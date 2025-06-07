'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { List, Calendar } from 'lucide-react'
import { YouTubePlaylist, AppConfiguration, SimplifiedPlaylist } from '../../../types/youtube'
import { EmptyState } from '../../../components/LoadingState'
import { formatDate, getBestThumbnail } from '../../../utils/youtube'
import { simplifyPlaylist, getTransformationConfig } from '../../../utils/dataTransformation'

export default function YouTubePlaylistPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubePlaylist | SimplifiedPlaylist | null>(null)

  const config = appInstallContext?.configuration
  const apiKey = config?.apiKey || ''
  const channelId = config?.channelId
  const transformationConfig = getTransformationConfig(config)

  const updateValue = (playlist: YouTubePlaylist | null) => {
    let playlistData = ''
    
    if (playlist) {
      if (transformationConfig.dataFormat === 'simplified') {
        // Use simplified format
        const simplified = simplifyPlaylist(playlist, {
          includeDescription: transformationConfig.includeDescription
        })
        playlistData = JSON.stringify(simplified)
      } else {
        // Use legacy format
        playlistData = JSON.stringify(playlist)
      }
    }
    
    contentItemMethods.setFieldValue({ name: field?.name, value: playlistData })
    setSelectedPlaylist(playlist)
  }

  const clearPlaylist = () => {
    updateValue(null)
  }

  const openPlaylistSelector = () => {
    if (!apiKey) {
      alert('YouTube API key is required. Please configure the app in the settings.')
      return
    }

    openModal<YouTubePlaylist | null>({
      title: 'Choose a YouTube Playlist',
      name: 'youtube-playlist-selector',
      props: {
        apiKey,
        channelId,
      },
      callback: (selectedPlaylist) => {
        if (selectedPlaylist) {
          updateValue(selectedPlaylist)
        }
      },
    })
  }

  useEffect(() => {
    if (!fieldValue) {
      setSelectedPlaylist(null)
      return
    }

    try {
      const playlist = JSON.parse(fieldValue)
      setSelectedPlaylist(playlist)
    } catch (e) {
      console.error('Error parsing playlist JSON:', e)
      setSelectedPlaylist(null)
    }
  }, [fieldValue])

  // Helper function to get display data regardless of format (legacy or simplified)
  const getDisplayData = (playlist: YouTubePlaylist | SimplifiedPlaylist) => {
    // Check if it's legacy format (has snippet property)
    if ('snippet' in playlist && playlist.snippet) {
      // Legacy format
      return {
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnailUrl: getBestThumbnail(playlist.snippet.thumbnails),
        videoCount: playlist.contentDetails.itemCount,
        publishedAt: formatDate(playlist.snippet.publishedAt),
        channelTitle: playlist.snippet.channelTitle
      }
    } else {
      // Simplified format
      const simplifiedPlaylist = playlist as SimplifiedPlaylist
      return {
        title: simplifiedPlaylist.title,
        description: simplifiedPlaylist.description,
        thumbnailUrl: simplifiedPlaylist.thumbnailUrl,
        videoCount: simplifiedPlaylist.videoCount,
        publishedAt: formatDate(simplifiedPlaylist.publishedAt),
        channelTitle: simplifiedPlaylist.channelTitle
      }
    }
  }

  if (initializing) return null

  return (
    <div ref={containerRef} className="bg-white">
      <div className="p-1">
        {selectedPlaylist ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={getDisplayData(selectedPlaylist).thumbnailUrl}
                alt={getDisplayData(selectedPlaylist).title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <List className="w-3 h-3" />
                {getDisplayData(selectedPlaylist).videoCount} videos
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 mr-4">
                  {getDisplayData(selectedPlaylist).title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    type="secondary"
                    size="sm"
                    label="Change"
                    onClick={openPlaylistSelector}
                  />
                  <Button
                    type="alternative"
                    size="sm"
                    label="Remove"
                    onClick={clearPlaylist}
                  />
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {getDisplayData(selectedPlaylist).description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <List className="w-4 h-4" />
                  <span>{getDisplayData(selectedPlaylist).videoCount} videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{getDisplayData(selectedPlaylist).publishedAt}</span>
                </div>
                <div className="text-gray-600 truncate col-span-2">
                  Channel: {getDisplayData(selectedPlaylist).channelTitle}
                </div>
              </div>
              
              {/* Show data format indicator */}
              <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                <span>Format: {transformationConfig.dataFormat}</span>
                {transformationConfig.dataFormat === 'simplified' && (
                  <span className="text-green-600">✨ Developer-friendly</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<List className="w-16 h-16" />}
            title="No Playlist Selected"
            description="Choose a YouTube playlist to display a collection of videos with metadata."
            action={
              <Button
                type="primary"
                size="base"
                label="Choose Playlist"
                onClick={openPlaylistSelector}
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
