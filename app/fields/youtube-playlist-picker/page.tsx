'use client'
import { useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useEffect, useState } from 'react'
import { List, Calendar } from 'lucide-react'
import { YouTubePlaylist, AppConfiguration } from '../../../types/youtube'
import { EmptyState } from '../../../components/LoadingState'
import { formatDate, getBestThumbnail } from '../../../utils/youtube'

export default function YouTubePlaylistPickerField() {
  const { initializing, field, fieldValue, appInstallContext } = useAgilityAppSDK()
  const containerRef = useResizeHeight()
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubePlaylist | null>(null)

  const config = appInstallContext?.configuration
  const apiKey = config?.apiKey || ''
  const channelId = config?.channelId

  const updateValue = (playlist: YouTubePlaylist | null) => {
    const playlistJSON = playlist ? JSON.stringify(playlist) : ''
    contentItemMethods.setFieldValue({ name: field?.name, value: playlistJSON })
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
      const playlist = JSON.parse(fieldValue) as YouTubePlaylist
      setSelectedPlaylist(playlist)
    } catch (e) {
      console.error('Error parsing playlist JSON:', e)
      setSelectedPlaylist(null)
    }
  }, [fieldValue])

  if (initializing) return null

  return (
    <div ref={containerRef} className="bg-white">
      <div className="p-1">
        {selectedPlaylist ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={getBestThumbnail(selectedPlaylist.snippet.thumbnails)}
                alt={selectedPlaylist.snippet.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <List className="w-3 h-3" />
                {selectedPlaylist.contentDetails.itemCount} videos
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 mr-4">
                  {selectedPlaylist.snippet.title}
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
                {selectedPlaylist.snippet.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <List className="w-4 h-4" />
                  <span>{selectedPlaylist.contentDetails.itemCount} videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedPlaylist.snippet.publishedAt)}</span>
                </div>
                <div className="text-gray-600 truncate col-span-2">
                  Channel: {selectedPlaylist.snippet.channelTitle}
                </div>
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
