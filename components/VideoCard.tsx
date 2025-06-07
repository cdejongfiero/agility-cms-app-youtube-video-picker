import { YouTubeVideo } from '../types/youtube'
import { Button } from '@agility/plenum-ui'
import { Play, Clock, Eye, ThumbsUp } from 'lucide-react'
import { formatDuration, formatCount, formatDate, getBestThumbnail } from '../utils/youtube'

interface VideoCardProps {
  video: YouTubeVideo
  onSelect?: (video: YouTubeVideo) => void
  onRemove?: (video: YouTubeVideo) => void
  isSelected?: boolean
  showSelectButton?: boolean
  showRemoveButton?: boolean
  className?: string
}

export function VideoCard({
  video,
  onSelect,
  onRemove,
  isSelected = false,
  showSelectButton = true,
  showRemoveButton = false,
  className = ''
}: VideoCardProps) {
  const publishedDate = formatDate(video.snippet.publishedAt)
  const thumbnail = getBestThumbnail(video.snippet.thumbnails)

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="relative">
        <img
          src={thumbnail}
          alt={video.snippet.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.contentDetails.duration)}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <Play className="text-white opacity-0 hover:opacity-100 transition-opacity w-12 h-12" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-2">
          {video.snippet.title}
        </h3>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {video.snippet.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatCount(video.statistics.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {formatCount(video.statistics.likeCount)}
          </span>
          <span>{publishedDate}</span>
        </div>
        
        <div className="flex gap-2">
          {showSelectButton && onSelect && (
            <Button
              type={isSelected ? 'primary' : 'secondary'}
              size="sm"
              label={isSelected ? 'Selected' : 'Select'}
              onClick={() => onSelect(video)}
              className="flex-1"
              isDisabled={isSelected}
            />
          )}
          {showRemoveButton && onRemove && (
            <Button
              type="alternative"
              size="sm"
              label="Remove"
              onClick={() => onRemove(video)}
              className="flex-1"
            />
          )}
        </div>
      </div>
    </div>
  )
}
