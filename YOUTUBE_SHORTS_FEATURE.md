# YouTube Shorts Detection and Filtering Feature

## Overview

This feature adds the ability to distinguish between regular YouTube videos and YouTube Shorts within the Agility CMS YouTube Video Picker app. Content editors can now filter videos by type and easily identify shorts with visual indicators.

## Features Added

### 1. **Shorts Detection**
- Automatically detects whether a video is a YouTube Short using YouTube's API
- Uses the channel's Shorts playlist (UUSH playlist) to verify if a video is a short
- Adds `isShort` property to video data stored in Agility CMS fields

### 2. **Visual Indicators**
- YouTube Shorts display a red "SHORT" badge in the top-left corner of video thumbnails
- Clear visual distinction between regular videos and shorts

### 3. **Content Type Filtering**
- Three filter options: "All", "Videos", and "Shorts"
- **All**: Shows all content (default behavior)
- **Videos**: Shows only regular YouTube videos (hides shorts)
- **Shorts**: Shows only YouTube Shorts (hides regular videos)

### 4. **Enhanced Data Storage**
- Video JSON data now includes `isShort: boolean` property
- Backwards compatible - existing video data continues to work
- Frontend developers can use this data to customize display logic

## Technical Implementation

### Shorts Detection Method

YouTube's API doesn't directly indicate if a video is a short, so we use this approach:

1. **Channel ID to Shorts Playlist**: Convert channel ID from `UC...` to `UUSH...`
2. **Playlist Query**: Check if the video exists in the channel's Shorts playlist
3. **Result**: If found in shorts playlist → it's a short, otherwise → regular video

Example:
```javascript
// Channel ID: UCbqEsRhXQI5KWYVr8mSWWWw
// Shorts Playlist ID: UUSHbqEsRhXQI5KWYVr8mSWWWw
```

### API Changes

**New Utility Functions** (`utils/youtube.ts`):
```typescript
getShortsPlaylistId(channelId: string): string
isLikelyShortByDuration(duration: string): boolean  
getDurationInSeconds(duration: string): number
```

**Enhanced API Route** (`app/api/youtube/videos/route.ts`):
- Added `detectShorts()` function that checks each video
- Groups videos by channel for efficient API calls
- Graceful error handling - marks videos as regular if detection fails

### UI Components

**New ContentFilter Component** (`components/ContentFilter.tsx`):
- Three toggle buttons for filtering
- Clean, intuitive interface
- Consistent with existing UI design

**Enhanced VideoCard Component**:
- Shows "SHORT" badge for YouTube Shorts
- Red badge with rounded corners for visibility

### Updated Type Definitions

```typescript
// Enhanced video interface
interface YouTubeVideo {
  // ... existing properties
  isShort?: boolean  // New property
}

// New filter types
type VideoContentFilter = 'all' | 'videos' | 'shorts'
```

## Usage for Content Editors

### In Single Video Picker:
1. Open video selector modal
2. Use "Content Type" filter buttons to show specific types
3. Look for red "SHORT" badges to identify shorts
4. Select desired video

### In Multi Video Picker:
1. Open video selector modal  
2. Filter by content type using the toggle buttons
3. Select multiple videos (shorts and/or regular videos)
4. Mixed selections are supported

### In Field Data:
The selected video JSON now includes:
```json
{
  "id": "dQw4w9WgXcQ",
  "snippet": { ... },
  "contentDetails": { ... },
  "statistics": { ... },
  "isShort": false  // New property
}
```

## Frontend Integration

### Using the isShort Property

```jsx
// React example
function VideoDisplay({ videoFieldValue }) {
  const video = JSON.parse(videoFieldValue)
  
  return (
    <div className={`video-container ${video.isShort ? 'short-video' : 'regular-video'}`}>
      {video.isShort && <span className="shorts-label">SHORT</span>}
      <h3>{video.snippet.title}</h3>
      {/* ... rest of video display */}
    </div>
  )
}
```

### Filtering in Frontend

```jsx
// Filter video collections
function VideoGallery({ videosFieldValue }) {
  const videos = JSON.parse(videosFieldValue)
  
  // Show only regular videos
  const regularVideos = videos.filter(v => !v.video.isShort)
  
  // Show only shorts
  const shortsVideos = videos.filter(v => v.video.isShort)
  
  return (
    <div>
      <section>
        <h2>Featured Videos</h2>
        {regularVideos.map(item => <VideoCard video={item.video} />)}
      </section>
      
      <section>
        <h2>Quick Shorts</h2>
        {shortsVideos.map(item => <VideoCard video={item.video} />)}
      </section>
    </div>
  )
}
```

## Performance Considerations

### API Efficiency
- Shorts detection adds additional API calls to YouTube
- Groups videos by channel to minimize requests
- Uses error handling to prevent failures
- Caches results within the modal session

### Fallback Behavior
- If shorts detection fails, videos are marked as regular videos
- App continues to function normally even with API issues
- User sees helpful error messages if needed

## Testing the Feature

### Test Cases

1. **Load videos from a channel with both shorts and regular videos**
   - Verify shorts show red "SHORT" badge
   - Verify filtering works correctly

2. **Filter by content type**
   - "All" shows all videos
   - "Videos" shows only regular videos  
   - "Shorts" shows only YouTube Shorts

3. **Select mixed content**
   - Verify both shorts and regular videos can be selected
   - Check that `isShort` property is saved correctly

4. **Error handling**
   - Test with invalid channel IDs
   - Verify graceful degradation if API fails

### Verification Steps

1. Install/update the app in Agility CMS
2. Create content with YouTube video fields
3. Open video selector and verify filter buttons appear
4. Test filtering functionality
5. Save content and verify `isShort` property in data
6. Test frontend integration with the new property

## Browser Support

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard web APIs - no external dependencies
- Responsive design works on mobile and desktop

## Migration Notes

### Existing Content
- **No migration required** - existing video data continues to work
- New `isShort` property will be `undefined` for existing videos
- Frontend code should handle both cases:

```javascript
// Safe checking for isShort property
const isShort = video.isShort === true  // Handles undefined case
```

### API Compatibility
- All existing API endpoints continue to work unchanged
- New functionality is additive only
- Backwards compatible with older versions of the app

## Future Enhancements

### Possible Improvements
1. **Bulk Shorts Detection**: Pre-fetch shorts data for better performance
2. **Duration Fallback**: Use video duration as secondary indicator
3. **Smart Caching**: Cache shorts detection results
4. **Advanced Filtering**: Combine with other filters (duration, views, etc.)

### Configuration Options
Future versions could add:
- Enable/disable shorts detection
- Customize shorts badge appearance
- Set custom duration thresholds

## Troubleshooting

### Common Issues

**Shorts not detected properly:**
- Verify YouTube API key has proper permissions
- Check that channel ID is valid and starts with "UC"
- Some older shorts might not be in the UUSH playlist

**Filter not working:**
- Clear browser cache and reload
- Check browser console for JavaScript errors
- Verify app is updated to latest version

**Performance issues:**
- Shorts detection adds API calls - monitor YouTube API quota
- Consider reducing maxResults if experiencing slowness

### Debug Information

Enable debug logging by checking browser console for:
- `Failed to check if video X is a short:` - individual video errors
- `Failed to check shorts for channel Y:` - channel-level errors  
- `Failed to detect shorts:` - overall detection errors

These warnings are non-critical and the app will continue to function.
