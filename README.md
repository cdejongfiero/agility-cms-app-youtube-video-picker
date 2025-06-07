# Agility CMS YouTube Video Picker App

This app provides YouTube video and playlist picker fields for Agility CMS with full YouTube API v3 integration.

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


## Features

- **Single Video Picker**: Select individual YouTube videos with rich metadata
- **Multiple Video Picker**: Curate collections of YouTube videos  
- **Playlist Picker**: Select YouTube playlists with full metadata
- YouTube API v3 integration with search and pagination
- Rich video previews with thumbnails, duration, view counts, etc.
- Complete JSON data storage for maximum frontend flexibility
- Responsive, modern interface

## Core Functionality

Core Functionality:

✅ YouTube API v3 integration with search and pagination
✅ Rich video previews with thumbnails, duration, view counts, likes
✅ Advanced search and filtering (by relevance, date, popularity)
✅ Complete JSON data storage for frontend flexibility
✅ Responsive, modern interface with loading states
✅ Comprehensive error handling
✅ App installation screen with API key configuration

Additional Features:

✅ Utility functions for duration formatting, count formatting, URL generation
✅ Validation utilities for YouTube IDs and data structures
✅ TypeScript support throughout
✅ Comprehensive documentation and testing guide

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
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

Stores complete YouTube video JSON:

```json
{
  "id": "dQw4w9WgXcQ",
  "snippet": {
    "title": "Video Title",
    "description": "Video description...",
    "thumbnails": {
      "default": { "url": "...", "width": 120, "height": 90 },
      "medium": { "url": "...", "width": 320, "height": 180 },
      "high": { "url": "...", "width": 480, "height": 360 }
    },
    "channelTitle": "Channel Name",
    "publishedAt": "2023-01-01T00:00:00Z"
  },
  "contentDetails": {
    "duration": "PT3M30S"
  },
  "statistics": {
    "viewCount": "1000000",
    "likeCount": "50000"
  }
}
```

### Multiple Videos Field

Stores array of selected videos with timestamps:

```json
[
  {
    "video": { /* YouTube video object */ },
    "selectedAt": "2023-01-01T12:00:00Z"
  }
]
```

### Playlist Field

Stores complete YouTube playlist JSON:

```json
{
  "id": "PLx1A2...",
  "snippet": {
    "title": "Playlist Title",
    "description": "Playlist description...",
    "thumbnails": { /* thumbnail objects */ },
    "channelTitle": "Channel Name"
  },
  "contentDetails": {
    "itemCount": 25
  }
}
```

## Frontend Usage

### React Example

```jsx
import { formatDuration, formatCount, getEmbedUrl } from './utils/youtube'

function VideoPlayer({ videoData }) {
  if (!videoData) return null
  
  const video = typeof videoData === 'string' ? JSON.parse(videoData) : videoData
  
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
      <p>{video.snippet.description}</p>
      <div>
        <span>Duration: {formatDuration(video.contentDetails.duration)}</span>
        <span>Views: {formatCount(video.statistics.viewCount)}</span>
      </div>
    </div>
  )
}
```

### Next.js Example

```jsx
function VideoCollection({ videosData }) {
  const videos = typeof videosData === 'string' ? JSON.parse(videosData) : videosData
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(({ video }) => (
        <div key={video.id} className="video-card">
          <img 
            src={video.snippet.thumbnails.medium.url} 
            alt={video.snippet.title}
          />
          <h4>{video.snippet.title}</h4>
          <p>{video.snippet.description}</p>
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

## Configuration

### Required
- **YouTube API Key**: YouTube Data API v3 key from Google Cloud Console

### Optional  
- **Channel ID**: Default channel to load videos from (can be overridden in search)

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
