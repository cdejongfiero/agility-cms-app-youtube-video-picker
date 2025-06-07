'use client'
import { useAgilityAppSDK, closeModal } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useState, useEffect, useMemo } from 'react'
import { YouTubeVideo, VideoContentFilter } from '../../../types/youtube'
import { useYouTubeVideos } from '../../../hooks/useYouTubeVideos'
import { VideoCard } from '../../../components/VideoCard'
import { SearchAndFilter } from '../../../components/SearchAndFilter'
import { ContentFilter } from '../../../components/ContentFilter'
import { LoadingState, EmptyState } from '../../../components/LoadingState'
import { Video, AlertCircle } from 'lucide-react'

interface YouTubeVideoSelectorProps {
  apiKey: string
  channelId?: string
}

export default function YouTubeVideoSelectorModal() {
  const { initializing, modalProps } = useAgilityAppSDK()
  const props = (modalProps as YouTubeVideoSelectorProps) || {}
  const { apiKey = '', channelId } = props
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentOrder, setCurrentOrder] = useState('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageTokens, setPageTokens] = useState<string[]>([''])
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [contentFilter, setContentFilter] = useState<VideoContentFilter>('all')

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

  // Apply content filtering
  const filteredVideos = useMemo(() => {
    if (contentFilter === 'all') {
      return videos
    } else if (contentFilter === 'shorts') {
      return videos.filter(video => video.isShort === true)
    } else if (contentFilter === 'videos') {
      return videos.filter(video => video.isShort !== true)
    }
    return videos
  }, [videos, contentFilter])

  // Reset pagination when search, order, or content filter changes
  useEffect(() => {
    setCurrentPage(1)
    setPageTokens([''])
    setSelectedVideo(null)
  }, [searchTerm, currentOrder, contentFilter])

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video)
  }

  const handleConfirmSelection = () => {
    closeModal(selectedVideo)
  }

  const handleCancel = () => {
    closeModal(null)
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

  if (initializing) return null

  // During static generation, modalProps might be null
  if (!apiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading YouTube Video Selector...</p>
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

      <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">Content Type:</div>
        <ContentFilter
          selectedFilter={contentFilter}
          onFilterChange={setContentFilter}
        />
      </div>

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

        {!isLoading && !error && videos.length > 0 && filteredVideos.length === 0 && (
          <EmptyState
            icon={<Video className="w-16 h-16" />}
            title="No Videos Match Filter"
            description={`No ${contentFilter === 'shorts' ? 'YouTube Shorts' : contentFilter === 'videos' ? 'regular videos' : 'videos'} found. Try changing the content filter.`}
          />
        )}

        {!isLoading && !error && filteredVideos.length > 0 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelect={handleVideoSelect}
                  isSelected={selectedVideo?.id === video.id}
                  showSelectButton={true}
                  showRemoveButton={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-6 border-t bg-gray-50 flex-shrink-0">
        <div className="text-sm text-gray-500">
          {selectedVideo ? `Selected: ${selectedVideo.snippet.title}` : 'No video selected'}
        </div>
        <div className="flex gap-2">
          <Button
            type="alternative"
            label="Cancel"
            onClick={handleCancel}
          />
          <Button
            type="primary"
            label="Select Video"
            onClick={handleConfirmSelection}
            isDisabled={!selectedVideo}
          />
        </div>
      </div>
    </div>
  )
}
