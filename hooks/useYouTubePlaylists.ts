import useSWR from 'swr'
import { YouTubeSearchResponse } from '../types/youtube'

interface UseYouTubePlaylistsProps {
  apiKey: string
  channelId?: string
  search?: string
  maxResults?: number
  pageToken?: string
}

const fetcher = async (url: string, apiKey: string): Promise<YouTubeSearchResponse> => {
  const response = await fetch(url, {
    headers: {
      'x-youtube-api-key': apiKey,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch playlists')
  }

  return response.json()
}

export function useYouTubePlaylists({
  apiKey,
  channelId,
  search = '',
  maxResults = 25,
  pageToken = ''
}: UseYouTubePlaylistsProps) {
  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
  })

  if (channelId) params.append('channelId', channelId)
  if (search) params.append('search', search)
  if (pageToken) params.append('pageToken', pageToken)

  const url = `/api/youtube/playlists?${params.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR(
    apiKey ? [url, apiKey] : null,
    ([url, apiKey]) => fetcher(url, apiKey),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    playlists: data?.playlists || [],
    pageInfo: data?.pageInfo,
    nextPageToken: data?.nextPageToken,
    prevPageToken: data?.prevPageToken,
    isLoading,
    error,
    refetch: mutate,
  }
}
