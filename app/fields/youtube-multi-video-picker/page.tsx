'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { Video, Plus, GripVertical } from 'lucide-react'
import { YouTubeVideo, AppConfiguration, SelectedVideo } from '../../../types/youtube'
import { VideoCard } from '../../../components/VideoCard'
import { EmptyState } from '../../../components/LoadingState'

export default function YouTubeMultiVideoPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const config = appInstallContext?.configuration
  const apiKey = config?.apiKey || ''
  const channelId = config?.channelId

  const updateValue = (videos: SelectedVideo[]) => {
    const videosJSON = JSON.stringify(videos)
    contentItemMethods.setFieldValue({ name: field?.name, value: videosJSON })
    setSelectedVideos(videos)
  }

  const addVideos = () => {
    if (!apiKey) {
      alert('YouTube API key is required. Please configure the app in the settings.')
      return
    }

    openModal<YouTubeVideo[]>({
      title: 'Choose YouTube Videos',
      name: 'youtube-multi-video-selector',
      props: {
        apiKey,
        channelId,
        selectedVideoIds: selectedVideos.map(v => v.video.id),
      },
      callback: (newVideos) => {
        if (newVideos && newVideos.length > 0) {
          const newSelectedVideos = newVideos.map(video => ({
            video,
            selectedAt: new Date().toISOString(),
          }))
          updateValue([...selectedVideos, ...newSelectedVideos])
        }
      },
    })
  }

  const removeVideo = (videoToRemove: YouTubeVideo) => {
    const updatedVideos = selectedVideos.filter(v => v.video.id !== videoToRemove.id)
    updateValue(updatedVideos)
  }

  const moveVideo = (fromIndex: number, toIndex: number) => {
    const newVideos = [...selectedVideos]
    const [movedVideo] = newVideos.splice(fromIndex, 1)
    newVideos.splice(toIndex, 0, movedVideo)
    updateValue(newVideos)
  }

  const clearAllVideos = () => {
    updateValue([])
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newVideos = [...selectedVideos]
    const draggedVideo = newVideos[draggedIndex]
    
    // Remove the dragged item
    newVideos.splice(draggedIndex, 1)
    
    // Insert at new position
    newVideos.splice(dropIndex, 0, draggedVideo)
    
    updateValue(newVideos)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  useEffect(() => {
    if (!fieldValue) {
      setSelectedVideos([])
      return
    }

    try {
      const videos = JSON.parse(fieldValue) as SelectedVideo[]
      setSelectedVideos(Array.isArray(videos) ? videos : [])
    } catch (e) {
      console.error('Error parsing videos JSON:', e)
      setSelectedVideos([])
    }
  }, [fieldValue])

  if (initializing) return null

  return (
    <div ref={containerRef} className="bg-white">
      <div className="p-1">
        {selectedVideos.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Selected Videos ({selectedVideos.length})
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Drag the grip handles to reorder videos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="secondary"
                  size="sm"
                  onClick={addVideos}
                  isDisabled={!apiKey}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add More
                </Button>
                <Button
                  type="alternative"
                  size="sm"
                  label="Clear All"
                  onClick={clearAllVideos}
                />
              </div>
            </div>

            <div className="space-y-4">
              {selectedVideos.map((selectedVideo, index) => (
                <div 
                  key={selectedVideo.video.id} 
                  className={`drag-item flex items-center gap-3 p-2 rounded-lg border border-gray-200 ${
                    draggedIndex === index ? 'dragging' : ''
                  } ${
                    dragOverIndex === index ? 'drag-over' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag Handle */}
                  <div className="drag-handle flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  {/* Video Number */}
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                    #{index + 1}
                  </div>
                  
                  {/* Video Card */}
                  <div className="flex-1">
                    <VideoCard
                      video={selectedVideo.video}
                      onRemove={removeVideo}
                      showSelectButton={false}
                      showRemoveButton={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Video className="w-16 h-16" />}
            title="No Videos Selected"
            description="Choose multiple YouTube videos to create a curated collection with rich metadata."
            action={
              <Button
                type="primary"
                size="base"
                label="Choose Videos"
                onClick={addVideos}
                isDisabled={!apiKey}
              />
            }
          />
        )}

        {!apiKey && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              YouTube API key is required. Please configure the app in the settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
