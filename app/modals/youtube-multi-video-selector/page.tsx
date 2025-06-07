'use client'
import { useAgilityAppSDK, closeModal } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useState, useEffect, useMemo } from 'react'
import { YouTubeVideo } from '../../../types/youtube'
import { useYouTubeVideos } from '../../../hooks/useYouTubeVideos'
import { VideoCard } from '../../../components/VideoCard'
import { SearchAndFilter } from '../../../components/SearchAndFilter'
import { LoadingState, EmptyState } from '../../../components/LoadingState'
import { Video, AlertCircle, Check, X } from 'lucide-react'

interface YouTubeMultiVideoSelectorProps {
  apiKey: string
  channelId?: string
  selectedVideoIds?: string[]
}

export default function YouTubeMultiVideoSelectorModal() {
  const { initializing, modalProps } = useAgilityAppSDK()
  const props = (modalProps as YouTubeMultiVideoSelectorProps) || {}
  const { apiKey = '', channelId, selectedVideoIds = [] } = props
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentOrder, setCurrentOrder] = useState('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageTokens, setPageTokens] = useState<string[]>([''])
  const [selectedVideos, setSelectedVideos] = useState<Map<string, YouTubeVideo>>(new Map())

  const {
    videos,
    pageInfo,
    nextPageToken,
    prevPageToken,
    isLoading,
    error,
    refetch
  } = useYouTubeVideos({
    apiKey,
    channelId,
    search: searchTerm,
    order: currentOrder as any,
    pageToken: pageTokens[currentPage - 1] || '',
    maxResults: 12
  })

  // Reset pagination when search or order changes
  useEffect(() => {
    setCurrentPage(1)
    setPageTokens([''])
  }, [searchTerm, currentOrder])

  const handleVideoToggle = (video: YouTubeVideo) => {
    const newSelected = new Map(selectedVideos)
    if (newSelected.has(video.id)) {
      newSelected.delete(video.id)
    } else {
      newSelected.set(video.id, video)
    }
    setSelectedVideos(newSelected)
  }

  const handleConfirmSelection = () => {
    const videosArray = Array.from(selectedVideos.values())
    closeModal(videosArray)
  }

  const handleCancel = () => {
    closeModal(null)
  }

  const handleClearSelection = () => {
    setSelectedVideos(new Map())
  }

  const handleNextPage = () => {
    if (nextPageToken) {
      const newTokens = [...pageTokens]
      if (newTokens.length === currentPage) {
        newTokens.push(nextPageToken)
      }
      setPageTokens(newTokens)
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const pageInfoData = useMemo(() => ({
    currentPage,
    hasNextPage: !!nextPageToken,
    hasPrevPage: currentPage > 1
  }), [currentPage, nextPageToken])

  const selectedCount = selectedVideos.size

  if (initializing) return null

  // During static generation, modalProps might be null
  if (!apiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading YouTube Multi Video Selector...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentOrder={currentOrder}
        onOrderChange={setCurrentOrder}
        isLoading={isLoading}
        pageInfo={pageInfoData}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        placeholder="Search YouTube videos..."
      />

      {selectedCount > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800">
            <Check className="w-4 h-4" />
            <span className="font-medium">{selectedCount} video{selectedCount !== 1 ? 's' : ''} selected</span>
          </div>
          <Button
            type="alternative"
            size="sm"
            onClick={handleClearSelection}
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear Selection
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <LoadingState message="Loading YouTube videos..." />
        )}

        {error && (
          <EmptyState
            icon={<AlertCircle className="w-16 h-16" />}
            title="Error Loading Videos"
            description={`Failed to load YouTube videos: ${error.message}`}
            action={
              <Button
                type="primary"
                label="Retry"
                onClick={() => refetch()}
              />
            }
          />
        )}

        {!isLoading && !error && videos.length === 0 && (
          <EmptyState
            icon={<Video className="w-16 h-16" />}
            title="No Videos Found"
            description={searchTerm ? "Try adjusting your search terms or filters." : "No videos available for this channel."}
          />
        )}

        {!isLoading && !error && videos.length > 0 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const isSelected = selectedVideos.has(video.id)
                const isAlreadyAdded = selectedVideoIds.includes(video.id)
                
                return (
                  <div key={video.id} className="relative">
                    {isAlreadyAdded && (
                      <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Already Added
                      </div>
                    )}
                    <VideoCard
                      video={video}
                      onSelect={handleVideoToggle}
                      isSelected={isSelected}
                      showSelectButton={!isAlreadyAdded}
                      showRemoveButton={false}
                      className={isAlreadyAdded ? 'opacity-50' : ''}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-6 border-t bg-gray-50 flex-shrink-0">
        <div className="text-sm text-gray-500">
          {selectedCount > 0 ? `${selectedCount} video${selectedCount !== 1 ? 's' : ''} selected` : 'No videos selected'}
        </div>
        <div className="flex gap-2">
          <Button
            type="alternative"
            label="Cancel"
            onClick={handleCancel}
          />
          <Button
            type="primary"
            label={`Add ${selectedCount} Video${selectedCount !== 1 ? 's' : ''}`}
            onClick={handleConfirmSelection}
            isDisabled={selectedCount === 0}
          />
        </div>
      </div>
    </div>
  )
}
