import { YouTubePlaylist } from '../types/youtube'
import { Button } from '@agility/plenum-ui'
import { List, Calendar } from 'lucide-react'
import { formatDate, getBestThumbnail } from '../utils/youtube'

interface PlaylistCardProps {
  playlist: YouTubePlaylist
  onSelect?: (playlist: YouTubePlaylist) => void
  onRemove?: (playlist: YouTubePlaylist) => void
  isSelected?: boolean
  showSelectButton?: boolean
  showRemoveButton?: boolean
  className?: string
}

export function PlaylistCard({
  playlist,
  onSelect,
  onRemove,
  isSelected = false,
  showSelectButton = true,
  showRemoveButton = false,
  className = ''
}: PlaylistCardProps) {
  const publishedDate = formatDate(playlist.snippet.publishedAt)
  const thumbnail = getBestThumbnail(playlist.snippet.thumbnails)

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${className} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="relative">
        <img
          src={thumbnail}
          alt={playlist.snippet.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <List className="w-3 h-3" />
          {playlist.contentDetails.itemCount} videos
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-2">
          {playlist.snippet.title}
        </h3>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {playlist.snippet.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {publishedDate}
          </span>
          <span className="text-gray-600 truncate">
            {playlist.snippet.channelTitle}
          </span>
        </div>
        
        <div className="flex gap-2">
          {showSelectButton && onSelect && (
            <Button
              type={isSelected ? 'primary' : 'secondary'}
              size="sm"
              label={isSelected ? 'Selected' : 'Select'}
              onClick={() => onSelect(playlist)}
              className="flex-1"
              isDisabled={isSelected}
            />
          )}
          {showRemoveButton && onRemove && (
            <Button
              type="alternative"
              size="sm"
              label="Remove"
              onClick={() => onRemove(playlist)}
              className="flex-1"
            />
          )}
        </div>
      </div>
    </div>
  )
}
