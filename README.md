# Agility CMS YouTube Video Picker App

This app provides YouTube video and playlist picker fields for Agility CMS with full YouTube API v3 integration.
```
agility-cms-app-youtube-video-picker/
├── app/
│   ├── api/youtube/          # YouTube API routes
│   ├── fields/               # Three field types
│   │   ├── youtube-video-picker/
│   │   ├── youtube-multi-video-picker/
│   │   └── youtube-playlist-picker/
│   └── modals/               # Three modal types
│       ├── youtube-video-selector/
│       ├── youtube-multi-video-selector/
│       └── youtube-playlist-selector/
├── components/               # Reusable UI components
├── hooks/                    # React hooks for YouTube API
├── types/                    # TypeScript definitions
├── utils/                    # Utility functions
└── public/.well-known/       # App registration
```

## Features

- **Single Video Picker**: Select individual YouTube videos with rich metadata
- **Multiple Video Picker**: Curate collections of YouTube videos with drag-and-drop reordering  
- **Playlist Picker**: Select YouTube playlists with full metadata
- **YouTube Shorts Detection**: Automatically detect and filter YouTube Shorts vs regular videos
- **Simplified Data Format**: Developer-friendly JSON structure (default) with pre-computed values
- YouTube API v3 integration with search and pagination
- Rich video previews with thumbnails, duration, view counts, etc.
- Visual indicators for YouTube Shorts with red "SHORT" badges
- Content filtering by "All", "Videos", or "Shorts"
- Complete JSON data storage for maximum frontend flexibility
- Responsive, modern interface

## Core Functionality

- ✅ YouTube API v3 integration with search and pagination
- ✅ Rich video previews with thumbnails, duration, view counts, likes
- ✅ Advanced search and filtering (by relevance, date, popularity)
- ✅ **YouTube Shorts detection and filtering** (All/Videos/Shorts)
- ✅ Visual indicators for YouTube Shorts with red "SHORT" badges
- ✅ Complete JSON data storage for frontend flexibility
- ✅ Responsive, modern interface with loading states
- ✅ Comprehensive error handling
- ✅ App installation screen with API key configuration

### Additional Features:

- ✅ Utility functions for duration formatting, count formatting, URL generation
- ✅ Validation utilities for YouTube IDs and data structures
- ✅ TypeScript support throughout
- ✅ Comprehensive documentation and testing guide

## Installation & Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure YouTube API

1. Create a YouTube Data API v3 key in Google Cloud Console
2. Enable the YouTube Data API v3 for your project
3. When installing the app in Agility CMS, provide:
   - **YouTube API Key**: Your YouTube Data API v3 key
   - **YouTube Channel ID** (optional): Default channel ID to load videos from

### 3. Development

```bash
npm run dev
```

The app will be available at `http://localhost:3013`

### 4. Building

```bash
npm run build
```

### 5. Deployment

This app is designed to be deployed to Vercel and then installed in Agility CMS.

## Usage

### 1. App Installation

1. Deploy the app to Vercel
2. Install the app in your Agility CMS instance
3. Configure with your YouTube API key and optional default channel ID

### 2. Adding Fields

Add any of the three field types to your content models:

- **YouTube Video Picker**: For single video selection
- **YouTube Multiple Video Picker**: For selecting multiple videos
- **YouTube Playlist Picker**: For playlist selection

### 3. Content Editing

- Browse and search YouTube videos/playlists
- Preview thumbnails, titles, descriptions, and metadata
- Use pagination to browse large result sets
- Filter by relevance, date, popularity, etc.

## Field Data Structure

### Single Video Field

Stores complete YouTube video data in simplified format:

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Never Gonna Give You Up",
  "description": "Rick Astley's official music video...",
  "publishedAt": "2009-10-25T06:57:33Z",
  "duration": "PT3M33S",
  "durationFormatted": "3:33",
  "durationSeconds": 213,
  "channelTitle": "Rick Astley",
  "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "viewCount": 1500000000,
  "viewCountFormatted": "1.5B",
  "likeCount": 15000000,
  "commentCount": 2800000,
  "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "thumbnails": {
    "small": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
    "medium": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    "large": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  },
  "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "watchUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "isShort": false,
  "tags": ["rick astley", "never gonna give you up", "80s"]
}
```

### Multiple Videos Field

Stores array of selected videos in simplified format:

```json
[
  {
    "id": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "durationFormatted": "3:33",
    "viewCountFormatted": "1.5B",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "isShort": false,
    "selectedAt": "2025-06-07T19:25:51.643Z"
    // ... other video properties
  }
]
```

### Playlist Field

Stores simplified YouTube playlist data:

```json
{
  "id": "PLrAXtmRdnEQy",
  "title": "Greatest Hits Collection",
  "description": "The best songs from the 80s...",
  "publishedAt": "2020-01-15T10:30:00Z",
  "channelTitle": "Music Channel",
  "channelId": "UCexample123",
  "videoCount": 25,
  "thumbnailUrl": "https://i.ytimg.com/vi/example/hqdefault.jpg",
  "thumbnails": {
    "small": "https://i.ytimg.com/vi/example/default.jpg",
    "medium": "https://i.ytimg.com/vi/example/mqdefault.jpg",
    "large": "https://i.ytimg.com/vi/example/hqdefault.jpg"
  },
  "playlistUrl": "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy"
}
```

## Frontend Usage

### React Hook Examples (Recommended)

```jsx
import { useYouTubeVideo, useYouTubeVideos, useYouTubePlaylist } from 'agility-cms-app-youtube-video-picker'

// Single Video
function VideoPlayer({ videoFieldValue }) {
  const video = useYouTubeVideo(videoFieldValue)
  
  if (!video) return null
  
  return (
    <div className="video-player">
      <iframe 
        src={video.embedUrl}
        title={video.title}
        width="560" 
        height="315"
      />
      <h3>{video.title}</h3>
      <div className="video-meta">
        <span>{video.viewCountFormatted} views</span>
        <span>{video.durationFormatted}</span>
        {video.isShort && <span className="short-badge">SHORT</span>}
      </div>
    </div>
  )
}

// Multiple Videos
function VideoGallery({ videosFieldValue }) {
  const videos = useYouTubeVideos(videosFieldValue)
  
  // Separate regular videos and shorts
  const regularVideos = videos.filter(v => !v.isShort)
  const shorts = videos.filter(v => v.isShort)
  
  return (
    <div className="video-gallery">
      {regularVideos.length > 0 && (
        <section>
          <h2>Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
      
      {shorts.length > 0 && (
        <section>
          <h2>YouTube Shorts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shorts.map(video => (
              <ShortCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// Playlist
function PlaylistCard({ playlistFieldValue }) {
  const playlist = useYouTubePlaylist(playlistFieldValue)
  
  if (!playlist) return null
  
  return (
    <div className="playlist-card">
      <img src={playlist.thumbnailUrl} alt={playlist.title} />
      <h3>{playlist.title}</h3>
      <p>{playlist.videoCount} videos</p>
      <a href={playlist.playlistUrl}>View Playlist</a>
    </div>
  )
}
```

### Direct JSON Usage

```jsx
// Single Video
function VideoPlayer({ videoFieldValue }) {
  if (!videoFieldValue) return null
  
  const video = JSON.parse(videoFieldValue)
  
  return (
    <div>
      <iframe 
        src={video.embedUrl}
        title={video.title}
        width="560" 
        height="315"
      />
      <h3>{video.title}</h3>
      <div>
        <span>Views: {video.viewCountFormatted}</span>
        <span>Duration: {video.durationFormatted}</span>
      </div>
    </div>
  )
}

// Multiple Videos
function VideoCollection({ videosFieldValue }) {
  const videos = JSON.parse(videosFieldValue)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
          />
          <h4>{video.title}</h4>
          <p>{video.description}</p>
          <div className="metadata">
            <span>{video.viewCountFormatted} views</span>
            <span>{video.channelTitle}</span>
            {video.isShort && <span className="short-badge">SHORT</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## API Endpoints

- `GET /api/youtube/videos` - Search and fetch YouTube videos
- `GET /api/youtube/playlists` - Search and fetch YouTube playlists

## Utilities

The app includes utility functions for common YouTube data formatting:

- `formatDuration(duration)` - Convert ISO 8601 to readable format
- `formatCount(count)` - Format numbers with K/M suffixes
- `formatDate(dateString)` - Format dates
- `getBestThumbnail(thumbnails)` - Get highest quality thumbnail
- `getEmbedUrl(videoId)` - Generate embed URLs
- `getWatchUrl(videoId)` - Generate watch URLs
- `getPlaylistUrl(playlistId)` - Generate playlist URLs
- `getShortsPlaylistId(channelId)` - Convert channel ID to shorts playlist ID
- `isLikelyShortByDuration(duration)` - Check if video is likely a short by duration

## React Hooks

The app provides React hooks for easy data consumption:

- `useYouTubeVideo(fieldValue)` - Parse and normalize single video data
- `useYouTubeVideos(fieldValue)` - Parse and normalize multi-video data
- `useYouTubePlaylist(fieldValue)` - Parse and normalize playlist data

**Example Usage:**
```jsx
import { useYouTubeVideo } from 'agility-cms-app-youtube-video-picker'

function VideoComponent({ fieldValue }) {
  const video = useYouTubeVideo(fieldValue)
  return <div>{video?.title}</div>
}
```

These hooks automatically handle both simplified and legacy data formats.

## YouTube Shorts Detection

The app automatically detects YouTube Shorts and provides filtering capabilities:

### Detection Method
Shorts are detected by checking if videos exist in the channel's Shorts playlist (converts channel ID from `UC...` to `UUSH...` format). This method provides accurate detection as YouTube maintains these playlists automatically.

### Features
- **Visual Indicators**: Shorts display a red "SHORT" badge
- **Content Filtering**: Filter by "All", "Videos", or "Shorts"
- **Data Enhancement**: Adds `isShort` property to video JSON
- **Smart Detection**: Uses YouTube's Shorts playlist to identify shorts

### Usage Example
```jsx
// Frontend usage with isShort property
function VideoDisplay({ videoData }) {
  const video = JSON.parse(videoData)
  
  return (
    <div className={video.isShort ? 'short-video' : 'regular-video'}>
      {video.isShort && <span className="shorts-badge">SHORT</span>}
      <h3>{video.title}</h3>
      <div className="metadata">
        <span>{video.viewCountFormatted} views</span>
        <span>{video.durationFormatted}</span>
      </div>
    </div>
  )
}
```


## Data Format Options

The app offers two data format options:

### **Simplified Format (Default)**
- Clean, developer-friendly structure
- Pre-computed values (formatted counts, durations, URLs)
- Consistent property names across all fields
- 60-70% smaller JSON payload
- Direct property access (no nested objects)

### **Legacy Format**
- Full YouTube API response structure
- Compatible with version 1.0.x implementations
- More verbose but complete metadata


## Configuration

### Required
- **YouTube API Key**: YouTube Data API v3 key from Google Cloud Console

### Optional  
- **Channel ID**: Default channel to load videos from (can be overridden in search)

### Self-Hosted Customization
The app uses the simplified data format by default. If you clone and deploy this app yourself and need the legacy format, modify the `getTransformationConfig` function in `/utils/dataTransformation.ts`:

```typescript
// Change from:
dataFormat: 'simplified'

// To:
dataFormat: 'legacy'
```

## Troubleshooting

### Common Issues

1. **"YouTube API key is required"** - Configure your API key in the app settings
2. **"Quota exceeded"** - Check your YouTube API quota in Google Cloud Console
3. **"Invalid channel ID"** - Verify the channel ID format (should start with 'UC')

### API Limits

- YouTube API has daily quota limits
- Each search request costs quota units
- Consider caching results for frequently accessed content

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

# YouTube Video Picker - Testing Guide

## Pre-Testing Setup

### 1. YouTube API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Note down your API key

### 2. Find Test Channel ID (Optional)
- Visit any YouTube channel
- Channel ID format: `UCxxxxxxxxxxxxxxxxxxxxx` (24 characters starting with UC)

## Local Development Testing

### 1. Install and Run
```bash
cd agility-cms-app-youtube-video-picker
npm install
npm run dev
```

### 2. Access at http://localhost:3013
- Should see the YouTube Video Picker homepage
- Verify all three field type cards display correctly

## Testing the App in Agility CMS

### 1. App Installation
1. Deploy to Vercel or your hosting platform
2. In Agility CMS, go to Settings > Apps
3. Install app using your deployment URL
4. Configure with:
   - **YouTube API Key**: Your API key from step 1
   - **YouTube Channel ID**: Optional test channel ID

### 2. Content Model Setup
Create a test content model with all three field types:

1. **Single Video Field**
   - Field Type: YouTube Video Picker
   - Name: `featuredVideo`
   - Label: "Featured Video"

2. **Multiple Videos Field**  
   - Field Type: YouTube Multiple Video Picker
   - Name: `videoCollection`
   - Label: "Video Collection"

3. **Playlist Field**
   - Field Type: YouTube Playlist Picker  
   - Name: `relatedPlaylist`
   - Label: "Related Playlist"

### 3. Testing Each Field Type

#### Single Video Picker
- [ ] Click "Choose Video" button
- [ ] Modal opens with search interface
- [ ] Search functionality works
- [ ] Pagination works (Previous/Next)
- [ ] Filter by order (Latest, Popular, etc.)
- [ ] Video thumbnails load correctly
- [ ] Video metadata displays (duration, views, likes, date)
- [ ] Can select a video
- [ ] Selected video displays with full details
- [ ] Can change selected video
- [ ] Can remove selected video
- [ ] Field value saves correctly

#### Multiple Video Picker
- [ ] Click "Choose Videos" button
- [ ] Modal opens with multi-select interface
- [ ] Can select multiple videos
- [ ] Selection counter updates correctly
- [ ] "Already Added" indicator shows for previously selected videos
- [ ] Can clear selection
- [ ] Can add selected videos
- [ ] Field displays all selected videos with ordering
- [ ] Can remove individual videos
- [ ] Can add more videos to existing selection
- [ ] Can clear all videos

#### Playlist Picker
- [ ] Click "Choose Playlist" button
- [ ] Modal opens with playlist search
- [ ] Search finds playlists correctly
- [ ] Playlist metadata displays (video count, date, channel)
- [ ] Can select a playlist
- [ ] Selected playlist displays correctly
- [ ] Can change selected playlist
- [ ] Can remove selected playlist

### 4. Error Handling Testing
- [ ] Missing API key shows appropriate warning
- [ ] Invalid API key shows error message
- [ ] Network errors are handled gracefully
- [ ] Empty search results show appropriate message
- [ ] Quota exceeded errors are handled

### 5. Data Structure Validation

#### Single Video Field Value
```javascript
// Should be valid YouTube video JSON
const video = JSON.parse(fieldValue)
console.log(video.id) // Video ID
console.log(video.snippet.title) // Title
console.log(video.contentDetails.duration) // Duration
console.log(video.statistics.viewCount) // View count
```

#### Multiple Videos Field Value
```javascript
// Should be array of selected videos with timestamps
const videos = JSON.parse(fieldValue)
console.log(videos[0].video.id) // First video ID
console.log(videos[0].selectedAt) // Selection timestamp
```

#### Playlist Field Value
```javascript
// Should be valid YouTube playlist JSON
const playlist = JSON.parse(fieldValue)
console.log(playlist.id) // Playlist ID
console.log(playlist.snippet.title) // Title
console.log(playlist.contentDetails.itemCount) // Video count
```

## Frontend Integration Testing

### 1. Create Test Frontend Component
```jsx
import { 
  formatDuration, 
  formatCount, 
  getEmbedUrl,
  getBestThumbnail 
} from 'agility-cms-app-youtube-video-picker'

function TestVideoPlayer({ videoFieldValue }) {
  if (!videoFieldValue) return null
  
  const video = JSON.parse(videoFieldValue)
  
  return (
    <div>
      <iframe 
        src={getEmbedUrl(video.id)}
        width="560" 
        height="315"
        frameBorder="0"
        allowFullScreen
      />
      <h3>{video.snippet.title}</h3>
      <img src={getBestThumbnail(video.snippet.thumbnails)} alt="" />
      <p>Duration: {formatDuration(video.contentDetails.duration)}</p>
      <p>Views: {formatCount(video.statistics.viewCount)}</p>
    </div>
  )
}
```

### 2. Test Utility Functions
- [ ] `formatDuration()` converts PT1H30M15S to 1:30:15
- [ ] `formatCount()` converts 1500000 to 1.5M
- [ ] `getEmbedUrl()` generates correct embed URLs
- [ ] `getBestThumbnail()` returns highest quality thumbnail
- [ ] `formatDate()` formats dates correctly

## Performance Testing

### 1. API Response Times
- [ ] Video search completes under 3 seconds
- [ ] Playlist search completes under 3 seconds
- [ ] Pagination is responsive
- [ ] Image loading doesn't block interface

### 2. Memory Usage
- [ ] No memory leaks when opening/closing modals
- [ ] Large result sets don't cause browser lag
- [ ] Video thumbnails load efficiently

## Browser Compatibility Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest) 
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on:
- [ ] Mobile phones (portrait/landscape)
- [ ] Tablets (portrait/landscape)
- [ ] Different screen sizes

## Common Issues & Solutions

### API Issues
- **"Invalid API key"**: Verify API key is correct and YouTube Data API v3 is enabled
- **"Quota exceeded"**: Check Google Cloud Console quota usage
- **"Channel not found"**: Verify channel ID format (should start with UC)

### Interface Issues  
- **Modal not opening**: Check for JavaScript errors in console
- **Images not loading**: Check thumbnail URLs and CORS policies
- **Pagination not working**: Verify pageToken handling

### Data Issues
- **Field not saving**: Check JSON parsing and field configuration
- **Metadata missing**: Verify YouTube API response includes all required parts
- **Duration formatting**: Check ISO 8601 duration parsing

## Success Criteria

✅ **Core Functionality**
- All three field types work correctly
- Search and filtering function properly
- Data saves and loads correctly
- Error handling works appropriately

✅ **User Experience**
- Interface is intuitive and responsive
- Loading states provide feedback
- Error messages are helpful
- Performance is acceptable

✅ **Integration**
- App installs successfully in Agility CMS
- Field configuration works
- Frontend integration is straightforward
- Documentation is clear and complete

## Deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] API keys are configured securely
- [ ] Error handling is comprehensive
- [ ] Performance is optimized
- [ ] Documentation is updated
- [ ] TypeScript compilation succeeds
- [ ] Build process completes successfully
