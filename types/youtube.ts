// YouTube API response types
export interface YouTubeVideo {
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: YouTubeThumbnail
      medium: YouTubeThumbnail
      high: YouTubeThumbnail
      standard?: YouTubeThumbnail
      maxres?: YouTubeThumbnail
    }
    channelTitle: string
    tags?: string[]
    categoryId: string
    liveBroadcastContent: string
    defaultLanguage?: string
    defaultAudioLanguage?: string
  }
  contentDetails: {
    duration: string
    dimension: string
    definition: string
    caption: string
    licensedContent: boolean
    contentRating: any
    projection: string
  }
  statistics: {
    viewCount: string
    likeCount: string
    dislikeCount: string
    favoriteCount: string
    commentCount: string
  }
  // App-specific properties
  isShort?: boolean
}

export interface YouTubePlaylist {
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: YouTubeThumbnail
      medium: YouTubeThumbnail
      high: YouTubeThumbnail
      standard?: YouTubeThumbnail
      maxres?: YouTubeThumbnail
    }
    channelTitle: string
    defaultLanguage?: string
  }
  contentDetails: {
    itemCount: number
  }
}

export interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}

export interface YouTubeSearchResponse {
  videos?: YouTubeVideo[]
  playlists?: YouTubePlaylist[]
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  nextPageToken?: string
  prevPageToken?: string
}

// App-specific types
export interface SelectedVideo {
  video: YouTubeVideo
  selectedAt: string
}

export interface SelectedPlaylist {
  playlist: YouTubePlaylist
  selectedAt: string
}

// Simplified data structures for developer-friendly usage
export interface SimplifiedVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  duration: string
  durationFormatted: string
  durationSeconds: number
  channelTitle: string
  channelId: string
  viewCount: number
  viewCountFormatted: string
  likeCount: number
  commentCount: number
  thumbnailUrl: string
  thumbnails: {
    small?: string
    medium?: string
    large?: string
  }
  embedUrl: string
  watchUrl: string
  isShort: boolean
  tags?: string[]
  selectedAt?: string
}

export interface SimplifiedPlaylist {
  id: string
  title: string
  description: string
  publishedAt: string
  channelTitle: string
  channelId: string
  videoCount: number
  thumbnailUrl: string
  thumbnails: {
    small?: string
    medium?: string
    large?: string
  }
  playlistUrl: string
}

export interface AppConfiguration {
  apiKey: string
  channelId?: string
  dataFormat?: 'simplified' | 'legacy'
  includeTags?: boolean
  includeDescription?: boolean
}

// Filter types
export type VideoContentFilter = 'all' | 'videos' | 'shorts'

export interface VideoFilterOptions {
  contentFilter: VideoContentFilter
}
