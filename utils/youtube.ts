/**
 * Utility functions for YouTube data formatting
 */

/**
 * Convert ISO 8601 duration to readable format
 * @param duration ISO 8601 duration string (PT1H30M15S)
 * @returns Formatted duration string (1:30:15 or 30:15)
 */
export function formatDuration(duration: string): string {
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

/**
 * Format large numbers with K/M suffixes
 * @param count Number as string
 * @returns Formatted count (1.2M, 15.3K, etc.)
 */
export function formatCount(count: string): string {
  const num = parseInt(count)
  if (isNaN(num)) return count
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return count
}

/**
 * Format date string to local date string
 * @param dateString ISO date string
 * @returns Formatted local date string
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

/**
 * Get best available thumbnail URL
 * @param thumbnails YouTube thumbnails object
 * @returns Best quality thumbnail URL
 */
export function getBestThumbnail(thumbnails: any): string {
  return thumbnails.maxres?.url || 
         thumbnails.high?.url || 
         thumbnails.medium?.url || 
         thumbnails.default?.url || 
         ''
}

/**
 * Truncate text to specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Generate YouTube embed URL from video ID
 * @param videoId YouTube video ID
 * @returns YouTube embed URL
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Generate YouTube watch URL from video ID
 * @param videoId YouTube video ID
 * @returns YouTube watch URL
 */
export function getWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * Generate YouTube playlist URL from playlist ID
 * @param playlistId YouTube playlist ID
 * @returns YouTube playlist URL
 */
export function getPlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`
}

/**
 * Convert a YouTube channel ID to its corresponding Shorts playlist ID
 * @param channelId YouTube channel ID (starts with UC)
 * @returns Shorts playlist ID (starts with UUSH)
 */
export function getShortsPlaylistId(channelId: string): string {
  if (!channelId || !channelId.startsWith('UC')) {
    throw new Error('Invalid channel ID. Must start with "UC"')
  }
  return channelId.replace(/^UC/, 'UUSH')
}

/**
 * Check if a video is likely a YouTube Short based on duration
 * Shorts are typically 60 seconds or less
 * @param duration ISO 8601 duration string
 * @returns boolean indicating if video is likely a short based on duration
 */
export function isLikelyShortByDuration(duration: string): boolean {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return false

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds <= 60
}

/**
 * Get total duration in seconds from ISO 8601 duration string
 * @param duration ISO 8601 duration string
 * @returns Total duration in seconds
 */
export function getDurationInSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}
