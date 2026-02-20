'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { motion, AnimatePresence } from 'framer-motion'

interface FavoriteButtonProps {
  workerId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({ workerId, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorited, addFavorite, removeFavorite } = useFavoritesStore()
  const favorited = isFavorited(workerId)
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    if (favorited) {
      removeFavorite(workerId)
    } else {
      addFavorite(workerId)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
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
        'hover:bg-red-50 active:scale-90',
        sizeClasses[size],
        className
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={favorited ? 'filled' : 'empty'}
          initial={isAnimating ? { scale: 0.5 } : false}
          animate={{ scale: isAnimating ? [1.3, 1] : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Heart
            className={cn(
              iconSizes[size],
              'transition-colors',
              favorited
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-400'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
