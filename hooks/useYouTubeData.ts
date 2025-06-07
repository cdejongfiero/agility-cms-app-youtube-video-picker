/**
 * React hooks for easy consumption of YouTube field data
 * Works with both legacy and simplified data formats
 */

import { useMemo } from 'react'
import { SimplifiedVideo, SimplifiedPlaylist } from '../types/youtube'

/**
 * Hook to easily work with YouTube video field data regardless of format
 */
export function useYouTubeVideo(fieldValue: string): SimplifiedVideo | null {
  return useMemo(() => {
    if (!fieldValue) return null
    
    try {
      const video = JSON.parse(fieldValue)
      
      // Handle both legacy and simplified formats
      if (video.snippet) {
        // Legacy format - transform to simplified
        return {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description || '',
          publishedAt: video.snippet.publishedAt,
          duration: video.contentDetails?.duration || '',
          durationFormatted: formatDuration(video.contentDetails?.duration || ''),
          durationSeconds: getDurationInSeconds(video.contentDetails?.duration || ''),
          channelTitle: video.snippet.channelTitle,
          channelId: video.snippet.channelId,
          viewCount: parseInt(video.statistics?.viewCount || '0'),
          viewCountFormatted: formatCount(video.statistics?.viewCount || '0'),
          likeCount: parseInt(video.statistics?.likeCount || '0'),
          commentCount: parseInt(video.statistics?.commentCount || '0'),
          thumbnailUrl: getBestThumbnail(video.snippet.thumbnails),
          thumbnails: {
            small: video.snippet.thumbnails?.default?.url,
            medium: video.snippet.thumbnails?.medium?.url,
            large: video.snippet.thumbnails?.high?.url
          },
          embedUrl: `https://www.youtube.com/embed/${video.id}`,
          watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
          isShort: video.isShort || false,
          tags: video.snippet.tags
        }
      } else {
        // Already simplified format
        return video
      }
    } catch (error) {
      console.error('Failed to parse YouTube video data:', error)
      return null
    }
  }, [fieldValue])
}

/**
 * Hook for multi-video fields
 */
export function useYouTubeVideos(fieldValue: string): SimplifiedVideo[] {
  return useMemo(() => {
    if (!fieldValue) return []
    
    try {
      const videos = JSON.parse(fieldValue)
      
      return videos.map((item: any) => {
        // Handle both legacy {video: {...}, selectedAt: ...} and simplified [...] formats
        const videoData = item.video || item
        const selectedAt = item.selectedAt
        
        if (videoData.snippet) {
          // Legacy format
          return {
            id: videoData.id,
            title: videoData.snippet.title,
            description: videoData.snippet.description || '',
            publishedAt: videoData.snippet.publishedAt,
            duration: videoData.contentDetails?.duration || '',
            durationFormatted: formatDuration(videoData.contentDetails?.duration || ''),
            durationSeconds: getDurationInSeconds(videoData.contentDetails?.duration || ''),
            channelTitle: videoData.snippet.channelTitle,
            channelId: videoData.snippet.channelId,
            viewCount: parseInt(videoData.statistics?.viewCount || '0'),
            viewCountFormatted: formatCount(videoData.statistics?.viewCount || '0'),
            likeCount: parseInt(videoData.statistics?.likeCount || '0'),
            commentCount: parseInt(videoData.statistics?.commentCount || '0'),
            thumbnailUrl: getBestThumbnail(videoData.snippet.thumbnails),
            thumbnails: {
              small: videoData.snippet.thumbnails?.default?.url,
              medium: videoData.snippet.thumbnails?.medium?.url,
              large: videoData.snippet.thumbnails?.high?.url
            },
            embedUrl: `https://www.youtube.com/embed/${videoData.id}`,
            watchUrl: `https://www.youtube.com/watch?v=${videoData.id}`,
            isShort: videoData.isShort || false,
            tags: videoData.snippet.tags,
            selectedAt
          }
        } else {
          // Simplified format
          return videoData
        }
      })
    } catch (error) {
      console.error('Failed to parse YouTube videos data:', error)
      return []
    }
  }, [fieldValue])
}

/**
 * Hook for playlist fields
 */
export function useYouTubePlaylist(fieldValue: string): SimplifiedPlaylist | null {
  return useMemo(() => {
    if (!fieldValue) return null
    
    try {
      const playlist = JSON.parse(fieldValue)
      
      if (playlist.snippet) {
        // Legacy format
        return {
          id: playlist.id,
          title: playlist.snippet.title,
          description: playlist.snippet.description || '',
          publishedAt: playlist.snippet.publishedAt,
          channelTitle: playlist.snippet.channelTitle,
          channelId: playlist.snippet.channelId,
          videoCount: playlist.contentDetails?.itemCount || 0,
          thumbnailUrl: getBestThumbnail(playlist.snippet.thumbnails),
          thumbnails: {
            small: playlist.snippet.thumbnails?.default?.url,
            medium: playlist.snippet.thumbnails?.medium?.url,
            large: playlist.snippet.thumbnails?.high?.url
          },
          playlistUrl: `https://www.youtube.com/playlist?list=${playlist.id}`
        }
      } else {
        // Simplified format
        return playlist
      }
    } catch (error) {
      console.error('Failed to parse YouTube playlist data:', error)
      return null
    }
  }, [fieldValue])
}

// Helper functions (imported from utils)
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

function formatCount(count: string): string {
  const num = parseInt(count)
  if (isNaN(num)) return count
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return count
}

function getDurationInSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}

function getBestThumbnail(thumbnails: any): string {
  return thumbnails?.maxres?.url || 
         thumbnails?.high?.url || 
         thumbnails?.medium?.url || 
         thumbnails?.default?.url || 
         ''
}
