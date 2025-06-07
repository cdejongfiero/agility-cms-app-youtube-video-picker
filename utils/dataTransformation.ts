/**
 * Data transformation utilities for YouTube API data
 * Converts YouTube API responses to simplified, developer-friendly format
 */

import { formatDuration, formatCount, getBestThumbnail, getEmbedUrl, getWatchUrl, getPlaylistUrl, getDurationInSeconds } from './youtube'
import { SimplifiedVideo, SimplifiedPlaylist } from '../types/youtube'

/**
 * Transform YouTube video from API format to simplified format
 */
export function simplifyVideo(youtubeVideo: any, options: {
  includeTags?: boolean
  includeDescription?: boolean
  selectedAt?: string
} = {}): SimplifiedVideo {
  const { includeTags = true, includeDescription = true, selectedAt } = options
  
  const simplified: SimplifiedVideo = {
    id: youtubeVideo.id,
    title: youtubeVideo.snippet.title,
    description: includeDescription ? (youtubeVideo.snippet.description || '') : '',
    publishedAt: youtubeVideo.snippet.publishedAt,
    duration: youtubeVideo.contentDetails.duration,
    durationFormatted: formatDuration(youtubeVideo.contentDetails.duration),
    durationSeconds: getDurationInSeconds(youtubeVideo.contentDetails.duration),
    channelTitle: youtubeVideo.snippet.channelTitle,
    channelId: youtubeVideo.snippet.channelId,
    viewCount: parseInt(youtubeVideo.statistics.viewCount || '0'),
    viewCountFormatted: formatCount(youtubeVideo.statistics.viewCount || '0'),
    likeCount: parseInt(youtubeVideo.statistics.likeCount || '0'),
    commentCount: parseInt(youtubeVideo.statistics.commentCount || '0'),
    thumbnailUrl: getBestThumbnail(youtubeVideo.snippet.thumbnails),
    thumbnails: {
      small: youtubeVideo.snippet.thumbnails.default?.url,
      medium: youtubeVideo.snippet.thumbnails.medium?.url,
      large: youtubeVideo.snippet.thumbnails.high?.url
    },
    embedUrl: getEmbedUrl(youtubeVideo.id),
    watchUrl: getWatchUrl(youtubeVideo.id),
    isShort: youtubeVideo.isShort || false
  }

  // Add tags if requested and available
  if (includeTags && youtubeVideo.snippet.tags) {
    simplified.tags = youtubeVideo.snippet.tags
  }

  // Add selectedAt if provided
  if (selectedAt) {
    simplified.selectedAt = selectedAt
  }

  return simplified
}

/**
 * Transform YouTube playlist from API format to simplified format
 */
export function simplifyPlaylist(youtubePlaylist: any, options: {
  includeDescription?: boolean
} = {}): SimplifiedPlaylist {
  const { includeDescription = true } = options

  return {
    id: youtubePlaylist.id,
    title: youtubePlaylist.snippet.title,
    description: includeDescription ? (youtubePlaylist.snippet.description || '') : '',
    publishedAt: youtubePlaylist.snippet.publishedAt,
    channelTitle: youtubePlaylist.snippet.channelTitle,
    channelId: youtubePlaylist.snippet.channelId,
    videoCount: youtubePlaylist.contentDetails.itemCount,
    thumbnailUrl: getBestThumbnail(youtubePlaylist.snippet.thumbnails),
    thumbnails: {
      small: youtubePlaylist.snippet.thumbnails.default?.url,
      medium: youtubePlaylist.snippet.thumbnails.medium?.url,
      large: youtubePlaylist.snippet.thumbnails.high?.url
    },
    playlistUrl: getPlaylistUrl(youtubePlaylist.id)
  }
}

/**
 * Transform multi-video field data from legacy to simplified format
 */
export function simplifyMultiVideoField(fieldValue: string, options: {
  includeTags?: boolean
  includeDescription?: boolean
} = {}): SimplifiedVideo[] {
  try {
    const data = JSON.parse(fieldValue)
    return data.map((item: any) => 
      simplifyVideo(item.video, { ...options, selectedAt: item.selectedAt })
    )
  } catch {
    return []
  }
}

/**
 * Transform single video field data from legacy to simplified format
 */
export function simplifySingleVideoField(fieldValue: string, options: {
  includeTags?: boolean
  includeDescription?: boolean
} = {}): SimplifiedVideo | null {
  try {
    const video = JSON.parse(fieldValue)
    return simplifyVideo(video, options)
  } catch {
    return null
  }
}

/**
 * Transform playlist field data from legacy to simplified format
 */
export function simplifyPlaylistField(fieldValue: string, options: {
  includeDescription?: boolean
} = {}): SimplifiedPlaylist | null {
  try {
    const playlist = JSON.parse(fieldValue)
    return simplifyPlaylist(playlist, options)
  } catch {
    return null
  }
}

/**
 * Detect if field data is already in simplified format
 */
export function isSimplifiedFormat(data: any): boolean {
  // Check if it has snippet property (legacy) or simplified properties
  if (Array.isArray(data)) {
    return data.length === 0 || !data[0].video?.snippet
  }
  return !data?.snippet
}

/**
 * Get configuration for data transformation from app context
 */
export function getTransformationConfig(appConfig: any) {
  return {
    dataFormat: appConfig?.dataFormat || 'simplified',
    includeTags: appConfig?.includeTags !== false,
    includeDescription: appConfig?.includeDescription !== false
  }
}
