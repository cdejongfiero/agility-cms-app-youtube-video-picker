'use client'
import { useAgilityAppSDK, closeModal } from '@agility/app-sdk'
import { Button } from '@agility/plenum-ui'
import { useState, useEffect, useMemo } from 'react'
import { YouTubePlaylist } from '../../../types/youtube'
import { useYouTubePlaylists } from '../../../hooks/useYouTubePlaylists'
import { PlaylistCard } from '../../../components/PlaylistCard'
import { SearchAndFilter } from '../../../components/SearchAndFilter'
import { LoadingState, EmptyState } from '../../../components/LoadingState'
import { List, AlertCircle } from 'lucide-react'

interface YouTubePlaylistSelectorProps {
  apiKey: string
  channelId?: string
}

export default function YouTubePlaylistSelectorModal() {
  const { initializing, modalProps } = useAgilityAppSDK()
  const props = (modalProps as YouTubePlaylistSelectorProps) || {}
  const { apiKey = '', channelId } = props
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageTokens, setPageTokens] = useState<string[]>([''])
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubePlaylist | null>(null)

  const {
    playlists,
    pageInfo,
    nextPageToken,
    prevPageToken,
    isLoading,
    error,
    refetch
  } = useYouTubePlaylists({
    apiKey,
    channelId,
    search: searchTerm,
    pageToken: pageTokens[currentPage - 1] || '',
    maxResults: 50
  })

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1)
    setPageTokens([''])
    setSelectedPlaylist(null)
  }, [searchTerm])

  const handlePlaylistSelect = (playlist: YouTubePlaylist) => {
    setSelectedPlaylist(playlist)
  }

  const handleConfirmSelection = () => {
    closeModal(selectedPlaylist)
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
          <p className="text-gray-600">Loading YouTube Playlist Selector...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
        pageInfo={pageInfoData}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        placeholder="Search YouTube playlists..."
        showOrderFilter={false}
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <LoadingState message="Loading YouTube playlists..." />
        )}

        {error && (
          <EmptyState
            icon={<AlertCircle className="w-16 h-16" />}
            title="Error Loading Playlists"
            description={`Failed to load YouTube playlists: ${error.message}`}
            action={
              <Button
                type="primary"
                label="Retry"
                onClick={() => refetch()}
              />
            }
          />
        )}

        {!isLoading && !error && playlists.length === 0 && (
          <EmptyState
            icon={<List className="w-16 h-16" />}
            title="No Playlists Found"
            description={searchTerm ? "Try adjusting your search terms." : "No playlists available for this channel."}
          />
        )}

        {!isLoading && !error && playlists.length > 0 && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onSelect={handlePlaylistSelect}
                  isSelected={selectedPlaylist?.id === playlist.id}
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
          {selectedPlaylist ? `Selected: ${selectedPlaylist.snippet.title}` : 'No playlist selected'}
        </div>
        <div className="flex gap-2">
          <Button
            type="alternative"
            label="Cancel"
            onClick={handleCancel}
          />
          <Button
            type="primary"
            label="Select Playlist"
            onClick={handleConfirmSelection}
            isDisabled={!selectedPlaylist}
          />
        </div>
      </div>
    </div>
  )
}
