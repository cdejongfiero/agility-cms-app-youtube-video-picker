'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { Video, Plus, GripVertical } from 'lucide-react'
import { YouTubeVideo, AppConfiguration, SelectedVideo, SimplifiedVideo } from '../../../types/youtube'
import { VideoCard } from '../../../components/VideoCard'
import { EmptyState } from '../../../components/LoadingState'
import { simplifyVideo, getTransformationConfig } from '../../../utils/dataTransformation'

export default function YouTubeMultiVideoPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedVideos, setSelectedVideos] = useState<(SelectedVideo | SimplifiedVideo)[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const config = appInstallContext?.configuration
  const apiKey = config?.apiKey || ''
  const channelId = config?.channelId
  const transformationConfig = getTransformationConfig(config)

  const updateValue = (videos: (SelectedVideo | SimplifiedVideo)[]) => {
    let videosData = ''
    
    if (videos.length > 0) {
      if (transformationConfig.dataFormat === 'simplified') {
        // Convert to simplified format
        const simplifiedVideos = videos.map(item => {
          if ('video' in item) {
            // Legacy format with {video, selectedAt} structure
            return simplifyVideo(item.video, {
              includeTags: transformationConfig.includeTags,
              includeDescription: transformationConfig.includeDescription,
              selectedAt: item.selectedAt
            })
          } else {
            // Already simplified
            return item
          }
        })
        videosData = JSON.stringify(simplifiedVideos)
      } else {
        // Use legacy format
        const legacyVideos = videos.map(item => {
          if ('video' in item) {
            return item // Already in legacy format
          } else {
            // Convert simplified back to legacy (shouldn't happen in normal flow)
            return {
              video: item,
              selectedAt: item.selectedAt || new Date().toISOString()
            }
          }
        })
        videosData = JSON.stringify(legacyVideos)
      }
    }
    
    contentItemMethods.setFieldValue({ name: field?.name, value: videosData })
    setSelectedVideos(videos)
  }

  const addVideos = () => {
    if (!apiKey) {
      alert('YouTube API key is required. Please configure the app in the settings.')
      return
    }

    // Get current video IDs for "Already Added" detection
    const currentVideoIds = selectedVideos.map(item => {
      return 'video' in item ? item.video.id : item.id
    })

    openModal<YouTubeVideo[]>({
      title: 'Choose YouTube Videos',
      name: 'youtube-multi-video-selector',
      props: {
        apiKey,
        channelId,
        selectedVideoIds: currentVideoIds,
      },
      callback: (newVideos) => {
        if (newVideos && newVideos.length > 0) {
          const timestamp = new Date().toISOString()
          
          if (transformationConfig.dataFormat === 'simplified') {
            // Create simplified videos with selectedAt
            const newSimplifiedVideos = newVideos.map(video => 
              simplifyVideo(video, {
                includeTags: transformationConfig.includeTags,
                includeDescription: transformationConfig.includeDescription,
                selectedAt: timestamp
              })
            )
            updateValue([...selectedVideos, ...newSimplifiedVideos])
          } else {
            // Create legacy format
            const newSelectedVideos = newVideos.map(video => ({
              video,
              selectedAt: timestamp,
            }))
            updateValue([...selectedVideos, ...newSelectedVideos])
          }
        }
      },
    })
  }

  const removeVideo = (videoToRemove: YouTubeVideo | SimplifiedVideo) => {
    const videoIdToRemove = videoToRemove.id
    const updatedVideos = selectedVideos.filter(item => {
      const videoId = 'video' in item ? item.video.id : item.id
      return videoId !== videoIdToRemove
    })
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
      const videos = JSON.parse(fieldValue)
      // Handle both legacy [{video: {...}, selectedAt: ...}] and simplified [...] formats
      setSelectedVideos(Array.isArray(videos) ? videos : [])
    } catch (e) {
      console.error('Error parsing videos JSON:', e)
      setSelectedVideos([])
    }
  }, [fieldValue])

  // Helper function to get video data regardless of format
  const getVideoData = (item: SelectedVideo | SimplifiedVideo): YouTubeVideo => {
    if ('video' in item) {
      // Legacy format
      return item.video
    } else {
      // Simplified format - convert to legacy-like structure for VideoCard compatibility
      return {
        id: item.id,
        snippet: {
          title: item.title,
          description: item.description,
          publishedAt: item.publishedAt,
          channelId: item.channelId,
          channelTitle: item.channelTitle,
          thumbnails: {
            default: { url: item.thumbnails.small || '', width: 120, height: 90 },
            medium: { url: item.thumbnails.medium || '', width: 320, height: 180 },
            high: { url: item.thumbnails.large || '', width: 480, height: 360 }
          },
          tags: item.tags || [],
          categoryId: '0',
          liveBroadcastContent: 'none',
          defaultLanguage: undefined,
          defaultAudioLanguage: undefined
        },
        contentDetails: {
          duration: item.duration,
          dimension: '2d',
          definition: 'hd',
          caption: 'false',
          licensedContent: false,
          contentRating: {},
          projection: 'rectangular'
        },
        statistics: {
          viewCount: item.viewCount.toString(),
          likeCount: item.likeCount.toString(),
          dislikeCount: '0',
          favoriteCount: '0',
          commentCount: item.commentCount.toString()
        },
        isShort: item.isShort
      } as YouTubeVideo
    }
  }

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
                <div className="text-xs text-gray-400 mt-1">
                  Format: {transformationConfig.dataFormat}
                  {transformationConfig.dataFormat === 'simplified' && (
                    <span className="text-green-600 ml-2">✨ Developer-friendly</span>
                  )}
                </div>
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
              {selectedVideos.map((selectedVideoItem, index) => {
                const videoData = getVideoData(selectedVideoItem)
                
                return (
                  <div 
                    key={videoData.id} 
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
                        video={videoData}
                        onRemove={() => removeVideo(videoData)}
                        showSelectButton={false}
                        showRemoveButton={true}
                      />
                    </div>
                  </div>
                )
              })}
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
