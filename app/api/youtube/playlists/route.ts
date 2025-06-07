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

    let playlists: any[] = []
    let pageInfo: any = {}
    let nextPageToken: string | undefined
    let prevPageToken: string | undefined

    if (channelId && !search) {
      // If we have a channelId and no search term, get playlists directly from the channel
      const playlistsResponse = await youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        channelId: channelId,
        maxResults,
        pageToken: pageToken || undefined,
      })

      playlists = playlistsResponse.data.items || []
      pageInfo = playlistsResponse.data.pageInfo || {}
      nextPageToken = playlistsResponse.data.nextPageToken || undefined
      prevPageToken = playlistsResponse.data.prevPageToken || undefined
    } else {
      // Use search API when we have a search term or no specific channel
      let searchParams_api: any = {
        part: ['snippet'],
        maxResults,
        type: ['playlist'],
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

      // Get search results for playlists
      const searchResponse = await youtube.search.list(searchParams_api)
      
      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return NextResponse.json({
          playlists: [],
          pageInfo: searchResponse.data.pageInfo,
          nextPageToken: null,
        })
      }

      // Get playlist IDs for detailed information
      const playlistIds = searchResponse.data.items
        .map(item => item.id?.playlistId)
        .filter((id): id is string => Boolean(id))

      if (playlistIds.length === 0) {
        return NextResponse.json({
          playlists: [],
          pageInfo: searchResponse.data.pageInfo,
          nextPageToken: searchResponse.data.nextPageToken,
        })
      }

      // Get detailed playlist information
      const playlistsResponse = await youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        id: playlistIds,
      })

      playlists = playlistsResponse.data.items || []
      pageInfo = searchResponse.data.pageInfo
      nextPageToken = searchResponse.data.nextPageToken || undefined
      prevPageToken = searchResponse.data.prevPageToken || undefined
    }

    return NextResponse.json({
      playlists,
      pageInfo,
      nextPageToken,
      prevPageToken,
    })
  } catch (error: any) {
    console.error('YouTube Playlists API Error:', error)
    
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
      { error: 'Failed to fetch YouTube playlists' },
      { status: 500 }
    )
  }
}
