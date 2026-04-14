'use client'

import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/lib/stores/favorites-store'

interface FavoriteButtonProps {
  workerId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({ workerId, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorited(workerId)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    if (favorited) {
      removeFavorite(workerId)
    } else {
      addFavorite(workerId)
    }

    try {
      if (favorited) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worker_id: workerId }),
        })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worker_id: workerId }),
        })
      }
    } catch {
      // Rollback on error
      if (favorited) {
        addFavorite(workerId)
      } else {
        removeFavorite(workerId)
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        'hover:bg-[#ffdad6] active:scale-90',
        sizeClasses[size],
        className
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span
        className={cn(
          'material-symbols-outlined transition-colors',
          iconSizes[size],
          favorited ? 'text-[#ba1a1a]' : 'text-[#6e7a73] hover:text-[#ba1a1a]'
        )}
        style={favorited ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
    </button>
  )
}
