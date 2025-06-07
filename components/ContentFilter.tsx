import { Button } from '@agility/plenum-ui'
import { VideoContentFilter } from '../types/youtube'

interface ContentFilterProps {
  selectedFilter: VideoContentFilter
  onFilterChange: (filter: VideoContentFilter) => void
  className?: string
}

const filterOptions = [
  { value: 'all' as VideoContentFilter, label: 'All' },
  { value: 'videos' as VideoContentFilter, label: 'Videos' },
  { value: 'shorts' as VideoContentFilter, label: 'Shorts' },
]

export function ContentFilter({
  selectedFilter,
  onFilterChange,
  className = ''
}: ContentFilterProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {filterOptions.map(option => (
        <Button
          key={option.value}
          type={selectedFilter === option.value ? 'primary' : 'alternative'}
          size="sm"
          label={option.label}
          onClick={() => onFilterChange(option.value)}
          className="min-w-[60px]"
        />
      ))}
    </div>
  )
}
