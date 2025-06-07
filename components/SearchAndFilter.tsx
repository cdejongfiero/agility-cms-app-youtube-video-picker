import { Button } from '@agility/plenum-ui'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

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
}

const orderOptions = [
  { value: 'date', label: 'Latest' },
  { value: 'relevance', label: 'Relevant' },
  { value: 'viewCount', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'title', label: 'A-Z' },
]

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  onOrderChange,
  currentOrder = 'date',
  isLoading = false,
  pageInfo,
  onPrevPage,
  onNextPage,
  placeholder = 'Search...',
  showOrderFilter = true
}: SearchAndFilterProps) {
  return (
    <div className="p-6 border-b bg-gray-50 flex-shrink-0">
      <div className="flex gap-4 items-center mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        {showOrderFilter && onOrderChange && (
          <select
            value={currentOrder}
            onChange={(e) => onOrderChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
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
