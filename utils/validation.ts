/**
 * Validation utilities for YouTube data
 */

import { YouTubeVideo, YouTubePlaylist } from '../types/youtube'

/**
 * Validate if a string is a valid YouTube video ID
 * @param id Video ID to validate
 * @returns boolean
 */
export function isValidVideoId(id: string): boolean {
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/
  return videoIdRegex.test(id)
}

/**
 * Validate if a string is a valid YouTube playlist ID
 * @param id Playlist ID to validate
 * @returns boolean
 */
export function isValidPlaylistId(id: string): boolean {
  const playlistIdRegex = /^(PL|UU|LL|RD|OL)[a-zA-Z0-9_-]+$/
  return playlistIdRegex.test(id)
}

/**
 * Validate if a string is a valid YouTube channel ID
 * @param id Channel ID to validate
 * @returns boolean
 */
export function isValidChannelId(id: string): boolean {
  const channelIdRegex = /^UC[a-zA-Z0-9_-]{22}$/
  return channelIdRegex.test(id)
}

/**
 * Validate YouTube video object structure
 * @param video Video object to validate
 * @returns boolean
 */
export function isValidVideo(video: any): video is YouTubeVideo {
  return (
    video &&
    typeof video.id === 'string' &&
    video.snippet &&
    typeof video.snippet.title === 'string' &&
    video.snippet.thumbnails &&
    video.contentDetails &&
    video.statistics
  )
}

/**
 * Validate YouTube playlist object structure
 * @param playlist Playlist object to validate
 * @returns boolean
 */
export function isValidPlaylist(playlist: any): playlist is YouTubePlaylist {
  return (
    playlist &&
    typeof playlist.id === 'string' &&
    playlist.snippet &&
    typeof playlist.snippet.title === 'string' &&
    playlist.snippet.thumbnails &&
    playlist.contentDetails &&
    typeof playlist.contentDetails.itemCount === 'number'
  )
}

/**
 * Extract video ID from various YouTube URL formats
 * @param url YouTube URL
 * @returns Video ID or null if not found
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && isValidVideoId(match[1])) {
      return match[1]
    }
  }

  return null
}

/**
 * Extract playlist ID from YouTube URL
 * @param url YouTube URL
 * @returns Playlist ID or null if not found
 */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&\n?#]+)/)
  if (match && isValidPlaylistId(match[1])) {
    return match[1]
  }
  return null
}

/**
 * Extract channel ID from YouTube URL
 * @param url YouTube URL
 * @returns Channel ID or null if not found
 */
export function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([^\/\n?#]+)/,
    /youtube\.com\/c\/([^\/\n?#]+)/,
    /youtube\.com\/user\/([^\/\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Sanitize HTML content from video descriptions
 * @param html HTML string
 * @returns Plain text
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim()
}

/**
 * Calculate estimated reading time for video description
 * @param text Description text
 * @param wordsPerMinute Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = text.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Check if video is likely suitable for children based on title/description
 * @param video YouTube video object
 * @returns boolean indicating if content appears child-friendly
 */
export function isChildFriendly(video: YouTubeVideo): boolean {
  const title = video.snippet.title.toLowerCase()
  const description = video.snippet.description.toLowerCase()
  
  const kidsFriendlyKeywords = [
    'kids', 'children', 'family', 'educational', 'learning', 
    'cartoon', 'animation', 'nursery rhyme', 'story time'
  ]
  
  const adultKeywords = [
    'mature', 'explicit', 'adult', 'warning', '18+', 'nsfw'
  ]
  
  const hasKidsKeywords = kidsFriendlyKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  )
  
  const hasAdultKeywords = adultKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  )
  
  return hasKidsKeywords && !hasAdultKeywords
}
