import { VideoContentFilter } from '../types/youtube'

interface ContentFilterProps {
  selectedFilter: VideoContentFilter
  onFilterChange: (filter: VideoContentFilter) => void
  className?: string
}

export function ContentFilter({
  selectedFilter,
  onFilterChange,
  className = ''
}: ContentFilterProps) {
  const filters: { value: VideoContentFilter; label: string; description: string }[] = [
    { value: 'all', label: 'All', description: 'Show all videos' },
    { value: 'videos', label: 'Videos', description: 'Show only regular videos' },
    { value: 'shorts', label: 'Shorts', description: 'Show only YouTube Shorts' },
  ]

  return (
    <div className={`flex gap-1 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
            selectedFilter === filter.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={filter.description}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
