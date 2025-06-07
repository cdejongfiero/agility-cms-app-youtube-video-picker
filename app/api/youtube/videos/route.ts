import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getShortsPlaylistId } from '../../../utils/youtube'

/**
 * Check which videos are YouTube Shorts by querying the channel's Shorts playlist
 * @param youtube YouTube API client
 * @param videos Array of videos to check
 * @returns Array of videos with isShort property added
 */
async function detectShorts(youtube: any, videos: any[]): Promise<any[]> {
  try {
    // Group videos by channel ID
    const videosByChannel = new Map<string, any[]>()
    
    for (const video of videos) {
      const channelId = video.snippet.channelId
      if (!videosByChannel.has(channelId)) {
        videosByChannel.set(channelId, [])
      }
      videosByChannel.get(channelId)!.push(video)
    }

    // Check each channel's shorts
    for (const [channelId, channelVideos] of Array.from(videosByChannel.entries())) {
      try {
        // Convert channel ID to shorts playlist ID
        if (!channelId || !channelId.startsWith('UC')) {
          // If we can't get the shorts playlist ID, mark all as regular videos
          channelVideos.forEach((video: any) => {
            video.isShort = false
          })
          continue
        }

        const shortsPlaylistId = getShortsPlaylistId(channelId)
        
        // Check each video to see if it's in the shorts playlist
        for (const video of channelVideos) {
          try {
            const playlistResponse = await youtube.playlistItems.list({
              part: ['id', 'snippet', 'contentDetails'],
              playlistId: shortsPlaylistId,
              videoId: video.id,
              maxResults: 1
            })
            
            // If the video is found in the shorts playlist, it's a short
            video.isShort = playlistResponse.data.items && playlistResponse.data.items.length > 0
          } catch (videoError: any) {
            // If there's an error checking this specific video, assume it's not a short
            console.warn(`Failed to check if video ${video.id} is a short:`, videoError.message)
            video.isShort = false
          }
        }
      } catch (channelError: any) {
        // If there's an error with this channel, mark all its videos as regular videos
        console.warn(`Failed to check shorts for channel ${channelId}:`, channelError.message)
        channelVideos.forEach((video: any) => {
          video.isShort = false
        })
      }
    }

    return videos
  } catch (error: any) {
    console.warn('Failed to detect shorts, marking all as regular videos:', error.message)
    // If shorts detection fails entirely, mark all videos as regular videos
    return videos.map(video => ({ ...video, isShort: false }))
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = request.headers.get('x-youtube-api-key')
    const channelId = searchParams.get('channelId')
    const search = searchParams.get('search') || ''
    const maxResults = parseInt(searchParams.get('maxResults') || '25')
    const pageToken = searchParams.get('pageToken') || ''
    const order = searchParams.get('order') || 'date'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key is required' },
        { status: 400 }
      )
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    })

    let searchParams_api: any = {
      part: ['snippet'],
      maxResults,
      order,
      type: ['video'],
      safeSearch: 'none',
    }

    if (pageToken) {
      searchParams_api.pageToken = pageToken
    }

    // If we have a search term, use it
    if (search) {
      searchParams_api.q = search
    }

    // If we have a channelId, filter by it
    if (channelId) {
      searchParams_api.channelId = channelId
    }

    // Get search results
    const searchResponse = await youtube.search.list(searchParams_api)
    
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return NextResponse.json({
        videos: [],
        pageInfo: searchResponse.data.pageInfo,
        nextPageToken: null,
      })
    }

    // Get video IDs for detailed information
    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter((id): id is string => Boolean(id))

    if (videoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        pageInfo: searchResponse.data.pageInfo,
        nextPageToken: searchResponse.data.nextPageToken,
      })
    }

    // Get detailed video information
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    })

    let videos = videosResponse.data.items || []

    // Detect which videos are YouTube Shorts
    videos = await detectShorts(youtube, videos)

    return NextResponse.json({
      videos,
      pageInfo: searchResponse.data.pageInfo,
      nextPageToken: searchResponse.data.nextPageToken,
      prevPageToken: searchResponse.data.prevPageToken,
    })
  } catch (error: any) {
    console.error('YouTube API Error:', error)
    
    // Handle specific YouTube API errors
    if (error.response?.data?.error) {
      const youtubeError = error.response.data.error
      return NextResponse.json(
        { 
          error: youtubeError.message || 'YouTube API error',
          details: youtubeError.errors?.[0]?.reason
        },
        { status: error.response.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch YouTube videos' },
      { status: 500 }
    )
  }
}
