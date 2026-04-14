'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    sender_id: string
    message_type: string
    image_url: string | null
    is_read: boolean
    created_at: string
    translation_cache: Record<string, string> | null
  }
  currentUserId: string
  currentLanguage?: string
  onTranslate?: (messageId: string) => Promise<string | null>
}

export function MessageBubble({ message, currentUserId, currentLanguage = 'en', onTranslate }: MessageBubbleProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(message.translation_cache?.[currentLanguage] ?? null)
  const [translating, setTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  const isMine = message.sender_id === currentUserId
  const isSystem = message.message_type === 'system'
  const time = new Date(message.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  const handleTranslate = async () => {
    if (translatedText) { setShowTranslation(!showTranslation); return }
    if (!onTranslate) return
    setTranslating(true)
    const result = await onTranslate(message.id)
    if (result) { setTranslatedText(result); setShowTranslation(true) }
    setTranslating(false)
  }

  if (isSystem) return (
    <div className="flex justify-center my-2">
      <span className="text-[10px] text-[#3e4943]/60 uppercase tracking-widest font-medium">{message.content}</span>
    </div>
  )

  return (
    <div className={cn('flex mb-3', isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isMine
              ? 'bg-[#047857] text-white rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm'
              : 'bg-[#f4f4f2] text-[#1a1c1b] rounded-tr-xl rounded-br-xl rounded-bl-xl'
          )}
        >
          {/* Image attachment */}
          {message.image_url && (
            <div
              className={cn(
                'relative w-full mb-2 rounded-lg overflow-hidden cursor-pointer',
                isMine ? 'bg-[#005d42]/20' : 'bg-[#e8e8e6]'
              )}
              style={{ minHeight: 120 }}
              onClick={() => window.open(message.image_url!, '_blank')}
            >
              <Image
                src={message.image_url}
                alt="Attachment"
                fill
                className="rounded-lg object-contain"
                sizes="(max-width: 768px) 80vw, 400px"
              />
            </div>
          )}

          {/* Text content */}
          {message.message_type !== 'image' && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Translation */}
          {showTranslation && translatedText && (
            <p className={cn(
              'mt-2 pt-2 text-xs italic border-t',
              isMine ? 'border-white/20 text-white/80' : 'border-[#bdc9c1] text-[#3e4943]'
            )}>
              {translatedText}
            </p>
          )}

          {/* Translate button for received messages (inside bubble) */}
          {!isMine && onTranslate && (
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={handleTranslate}
                disabled={translating}
                className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">translate</span>
                <span className="text-[10px] font-semibold uppercase tracking-tighter">
                  {translating ? '...' : showTranslation ? 'Original' : 'Translate'}
                </span>
              </button>
            </div>
          )}

          {/* Timestamp + read receipt */}
          <div className={cn(
            'flex items-center gap-1 mt-1',
            isMine ? 'justify-end' : 'justify-start'
          )}>
            <span className={cn(
              'text-[10px]',
              isMine ? 'text-[#97f5cc]/80' : 'text-[#3e4943]/60'
            )}>
              {time}
            </span>
            {isMine && (
              <span
                className="material-symbols-outlined text-[14px] text-[#97f5cc]"
                style={message.is_read ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {message.is_read ? 'done_all' : 'done'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
