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

export interface AppConfiguration {
  apiKey: string
  channelId?: string
}

// Filter types
export type VideoContentFilter = 'all' | 'videos' | 'shorts'

export interface VideoFilterOptions {
  contentFilter: VideoContentFilter
}
