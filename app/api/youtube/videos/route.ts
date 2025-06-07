import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getShortsPlaylistId } from '@/utils/youtube'

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
        
        // Fetch ALL shorts from the channel's shorts playlist
        const allShorts = new Set<string>()
        let pageToken = ''
        
        do {
          const shortsResponse = await youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: shortsPlaylistId,
            maxResults: 50,
            pageToken: pageToken || undefined
          })
          
          // Add all shorts video IDs to our set
          if (shortsResponse.data.items) {
          shortsResponse.data.items.forEach((item: any) => {
          const videoId = item.snippet?.resourceId?.videoId
          if (videoId) {
          allShorts.add(videoId)
          }
          })
          }
          
          pageToken = shortsResponse.data.nextPageToken || ''
        } while (pageToken)
        
        // Mark videos as shorts based on whether they're in the shorts playlist
        channelVideos.forEach((video: any) => {
          video.isShort = allShorts.has(video.id)
        })
        
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
    return videos.map((video: any) => ({ ...video, isShort: false }))
  }
}

/**
 * Handle shorts-only queries by fetching from the channel's shorts playlist
 */
async function handleShortsQuery(
  youtube: any, 
  channelId: string | null, 
  search: string, 
  maxResults: number, 
  pageToken: string
) {
  if (!channelId || !channelId.startsWith('UC')) {
    return NextResponse.json({
      videos: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      nextPageToken: null,
      prevPageToken: null,
    })
  }

  try {
    const shortsPlaylistId = getShortsPlaylistId(channelId)
    
    // Get shorts from playlist
    const playlistResponse = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: shortsPlaylistId,
      maxResults,
      pageToken: pageToken || undefined
    })

    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      return NextResponse.json({
        videos: [],
        pageInfo: playlistResponse.data.pageInfo || { totalResults: 0, resultsPerPage: 0 },
        nextPageToken: null,
        prevPageToken: null,
      })
    }

    // Extract video IDs from playlist items
    const videoIds = playlistResponse.data.items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter((id: any): id is string => Boolean(id))

    if (videoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        pageInfo: playlistResponse.data.pageInfo || { totalResults: 0, resultsPerPage: 0 },
        nextPageToken: playlistResponse.data.nextPageToken,
        prevPageToken: playlistResponse.data.prevPageToken,
      })
    }

    // Get detailed video information
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds.join(','),
    })

    let videos = videosResponse.data.items || []
    
    // Mark all as shorts and apply search filter if needed
    videos = videos.map((video: any) => ({ ...video, isShort: true }))
    
    // Apply search filter client-side for shorts (since we can't search the playlist API)
    if (search) {
      const searchLower = search.toLowerCase()
      videos = videos.filter((video: any) => 
        video.snippet.title.toLowerCase().includes(searchLower) ||
        video.snippet.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      videos,
      pageInfo: playlistResponse.data.pageInfo,
      nextPageToken: playlistResponse.data.nextPageToken,
      prevPageToken: playlistResponse.data.prevPageToken,
    })
  } catch (error: any) {
    console.error('Error fetching shorts:', error)
    return NextResponse.json({
      videos: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      nextPageToken: null,
      prevPageToken: null,
    })
  }
}

/**
 * Handle regular video queries (all videos or videos-only)
 */
async function handleVideosQuery(
  youtube: any,
  channelId: string | null,
  search: string,
  maxResults: number,
  pageToken: string,
  order: string,
  contentFilter: string
) {
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
    .map((item: any) => item.id?.videoId)
    .filter((id: any): id is string => Boolean(id))

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

  // If contentFilter is 'videos', filter out shorts
  if (contentFilter === 'videos') {
    videos = videos.filter((video: any) => !video.isShort)
  }

  return NextResponse.json({
    videos,
    pageInfo: searchResponse.data.pageInfo,
    nextPageToken: searchResponse.data.nextPageToken,
    prevPageToken: searchResponse.data.prevPageToken,
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = request.headers.get('x-youtube-api-key')
    const channelId = searchParams.get('channelId')
    const search = searchParams.get('search') || ''
    const maxResults = parseInt(searchParams.get('maxResults') || '50')
    const pageToken = searchParams.get('pageToken') || ''
    const order = searchParams.get('order') || 'title'
    const contentFilter = searchParams.get('contentFilter') || 'all' // all, videos, shorts

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

    // Handle different content filters
    if (contentFilter === 'shorts') {
      // Query shorts playlist directly
      return await handleShortsQuery(youtube, channelId, search, maxResults, pageToken)
    } else {
      // Query regular videos (and filter out shorts if contentFilter === 'videos')
      return await handleVideosQuery(youtube, channelId, search, maxResults, pageToken, order, contentFilter)
    }
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
