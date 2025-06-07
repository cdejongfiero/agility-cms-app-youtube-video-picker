'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { Video, Plus } from 'lucide-react'
import { YouTubeVideo, AppConfiguration, SelectedVideo } from '../../../types/youtube'
import { VideoCard } from '../../../components/VideoCard'
import { EmptyState } from '../../../components/LoadingState'

export default function YouTubeMultiVideoPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([])

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
              <h3 className="text-lg font-medium text-gray-900">
                Selected Videos ({selectedVideos.length})
              </h3>
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
                <div key={selectedVideo.video.id} className="relative">
                  <div className="absolute left-2 top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    #{index + 1}
                  </div>
                  <VideoCard
                    video={selectedVideo.video}
                    onRemove={removeVideo}
                    showSelectButton={false}
                    showRemoveButton={true}
                    className="ml-6"
                  />
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
