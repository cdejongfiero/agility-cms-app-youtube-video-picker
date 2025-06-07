'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { Video, Play, Eye, ThumbsUp, Calendar } from 'lucide-react'
import { YouTubeVideo, AppConfiguration } from '../../../types/youtube'
import { EmptyState } from '../../../components/LoadingState'
import { formatDuration, formatCount, formatDate, getBestThumbnail } from '../../../utils/youtube'

export default function YouTubeVideoPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)

  const config = appInstallContext?.configuration
  const apiKey = config?.apiKey || ''
  const channelId = config?.channelId

  const updateValue = (video: YouTubeVideo | null) => {
    const videoJSON = video ? JSON.stringify(video) : ''
    contentItemMethods.setFieldValue({ name: field?.name, value: videoJSON })
    setSelectedVideo(video)
  }

  const clearVideo = () => {
    updateValue(null)
  }

  const openVideoSelector = () => {
    if (!apiKey) {
      alert('YouTube API key is required. Please configure the app in the settings.')
      return
    }

    openModal<YouTubeVideo | null>({
      title: 'Choose a YouTube Video',
      name: 'youtube-video-selector',
      props: {
        apiKey,
        channelId,
      },
      callback: (selectedVideo) => {
        if (selectedVideo) {
          updateValue(selectedVideo)
        }
      },
    })
  }

  useEffect(() => {
    if (!fieldValue) {
      setSelectedVideo(null)
      return
    }

    try {
      const video = JSON.parse(fieldValue) as YouTubeVideo
      setSelectedVideo(video)
    } catch (e) {
      console.error('Error parsing video JSON:', e)
      setSelectedVideo(null)
    }
  }, [fieldValue])



  if (initializing) return null

  return (
    <div ref={containerRef} className="bg-white">
      <div className="p-1">
        {selectedVideo ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={getBestThumbnail(selectedVideo.snippet.thumbnails)}
                alt={selectedVideo.snippet.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {formatDuration(selectedVideo.contentDetails.duration)}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <Play className="text-white opacity-0 hover:opacity-100 transition-opacity w-16 h-16" />
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 mr-4">
                  {selectedVideo.snippet.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    type="secondary"
                    size="sm"
                    label="Change"
                    onClick={openVideoSelector}
                  />
                  <Button
                    type="alternative"
                    size="sm"
                    label="Remove"
                    onClick={clearVideo}
                  />
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {selectedVideo.snippet.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{formatCount(selectedVideo.statistics.viewCount)} views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{formatCount(selectedVideo.statistics.likeCount)} likes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedVideo.snippet.publishedAt)}</span>
                </div>
                <div className="text-gray-600 truncate">
                  {selectedVideo.snippet.channelTitle}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Video className="w-16 h-16" />}
            title="No Video Selected"
            description="Choose a YouTube video to display rich content and metadata."
            action={
              <Button
                type="primary"
                size="base"
                label="Choose Video"
                onClick={openVideoSelector}
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
