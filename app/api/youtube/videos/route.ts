import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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

    const videos = videosResponse.data.items || []

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
