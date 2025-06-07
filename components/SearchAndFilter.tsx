import { Button } from '@agility/plenum-ui'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { VideoContentFilter } from '../types/youtube'
import { ContentFilter } from './ContentFilter'

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onOrderChange?: (order: string) => void
  currentOrder?: string
  isLoading?: boolean
  pageInfo?: {
    currentPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  onPrevPage?: () => void
  onNextPage?: () => void
  placeholder?: string
  showOrderFilter?: boolean
  contentFilter?: VideoContentFilter
  onContentFilterChange?: (filter: VideoContentFilter) => void
  showContentFilter?: boolean
}

const orderOptions = [
  { value: 'title', label: 'A-Z' },
  { value: 'date', label: 'Latest' },
  { value: 'relevance', label: 'Relevant' },
  { value: 'viewCount', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
]

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  onOrderChange,
  currentOrder = 'title',
  isLoading = false,
  pageInfo,
  onPrevPage,
  onNextPage,
  placeholder = 'Search...',
  showOrderFilter = true,
  contentFilter = 'all',
  onContentFilterChange,
  showContentFilter = false
}: SearchAndFilterProps) {
  const [inputValue, setInputValue] = useState(searchTerm)

  // Update local input when searchTerm prop changes (e.g., reset)
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  const handleSearch = () => {
    onSearchChange(inputValue.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setInputValue('')
    onSearchChange('')
  }

  return (
    <div className="p-6 border-b bg-gray-50 flex-shrink-0">
      <div className="flex gap-4 items-center mb-4">
        {/* Content Filter - placed first */}
        {showContentFilter && onContentFilterChange && (
          <div className="flex-shrink-0">
            <ContentFilter
              selectedFilter={contentFilter}
              onFilterChange={onContentFilterChange}
            />
          </div>
        )}
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {inputValue && (
              <Button
                type="alternative"
                size="sm"
                label="Clear"
                onClick={handleClear}
                isDisabled={isLoading}
                className="px-2 py-1 text-xs"
              />
            )}
            <Button
              type="secondary"
              size="sm"
              label="Search"
              onClick={handleSearch}
              isDisabled={isLoading}
              className="px-3 py-1 text-xs"
            />
          </div>
        </div>
        
        {/* Sort Dropdown */}
        {showOrderFilter && onOrderChange && (
          <select
            value={currentOrder}
            onChange={(e) => onOrderChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] flex-shrink-0"
            disabled={isLoading}
          >
            {orderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {pageInfo && (onPrevPage || onNextPage) && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {pageInfo.currentPage}
          </div>
          <div className="flex gap-2">
            <Button
              type="alternative"
              size="sm"
              onClick={onPrevPage}
              isDisabled={!pageInfo.hasPrevPage || isLoading}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              type="alternative"
              size="sm"
              onClick={onNextPage}
              isDisabled={!pageInfo.hasNextPage || isLoading}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
