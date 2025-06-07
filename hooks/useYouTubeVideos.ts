import useSWR from 'swr'
import { YouTubeSearchResponse } from '../types/youtube'

interface UseYouTubeVideosProps {
  apiKey: string
  channelId?: string
  search?: string
  maxResults?: number
  pageToken?: string
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount'
}

const fetcher = async (url: string, apiKey: string): Promise<YouTubeSearchResponse> => {
  const response = await fetch(url, {
    headers: {
      'x-youtube-api-key': apiKey,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch videos')
  }

  return response.json()
}

export function useYouTubeVideos({
  apiKey,
  channelId,
  search = '',
  maxResults = 25,
  pageToken = '',
  order = 'date'
}: UseYouTubeVideosProps) {
  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
    order,
  })

  if (channelId) params.append('channelId', channelId)
  if (search) params.append('search', search)
  if (pageToken) params.append('pageToken', pageToken)

  const url = `/api/youtube/videos?${params.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR(
    apiKey && apiKey.length > 0 ? [url, apiKey] : null,
    ([url, apiKey]) => fetcher(url, apiKey),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    videos: data?.videos || [],
    pageInfo: data?.pageInfo,
    nextPageToken: data?.nextPageToken,
    prevPageToken: data?.prevPageToken,
    isLoading,
    error,
    refetch: mutate,
  }
}
