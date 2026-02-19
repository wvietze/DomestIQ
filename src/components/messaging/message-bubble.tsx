'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Check, CheckCheck } from 'lucide-react'
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
      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{message.content}</span>
    </div>
  )

  return (
    <div className={cn('flex mb-2', isMine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[80%] space-y-1">
        <div className={cn('px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed', isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md')}>
          {message.image_url && <img src={message.image_url} alt="Attachment" className="rounded-lg max-w-full mb-2" loading="lazy" />}
          <p>{message.content}</p>
          {showTranslation && translatedText && (
            <p className={cn('mt-2 pt-2 text-sm italic border-t', isMine ? 'border-primary-foreground/20' : 'border-foreground/10')}>{translatedText}</p>
          )}
        </div>
        <div className={cn('flex items-center gap-1.5 px-1', isMine ? 'justify-end' : 'justify-start')}>
          <span className="text-[11px] text-muted-foreground">{time}</span>
          {isMine && (message.is_read ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5 text-muted-foreground" />)}
          {!isMine && onTranslate && (
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[11px]" onClick={handleTranslate} disabled={translating}>
              <Languages className="w-3 h-3 mr-0.5" />{translating ? '...' : showTranslation ? 'Original' : 'Translate'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
