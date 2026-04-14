'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'

interface Participant {
  id: string
  full_name: string
  avatar_url: string | null
}

export default function ClientConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [translatingId, setTranslatingId] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load conversation and messages
  useEffect(() => {
    async function loadConversation() {
      if (!user) return

      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        if (!conversation) return

        const otherUserId =
          conversation.participant_1 === user.id
            ? conversation.participant_2
            : conversation.participant_1

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single()

        if (profile) {
          setOtherParticipant(profile as unknown as Participant)
        }

        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesData) {
          setMessages(messagesData as unknown as Message[])
        }

        // Mark unread messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false)
      } catch (err) {
        console.error('Conversation load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId, user, supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as unknown as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          if (newMsg.sender_id !== user?.id) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
          }
        }
      )
      .on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updatedMsg = payload.new as unknown as Message
          setMessages(prev =>
            prev.map(m => (m.id === updatedMsg.id ? updatedMsg : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase, user?.id])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: 'text',
        content,
        is_read: false,
      })

      if (error) throw error

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.slice(0, 100),
        })
        .eq('id', conversationId)
    } catch (err) {
      console.error('Failed to send message:', err)
      setNewMessage(content)
    } finally {
      setIsSending(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsSending(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `messages/${conversationId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: 'image',
        content: 'Sent an image',
        image_url: urlData.publicUrl,
        is_read: false,
      })

      if (insertError) throw insertError

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: 'Sent an image',
        })
        .eq('id', conversationId)
    } catch (err) {
      console.error('Failed to upload image:', err)
    } finally {
      setIsSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleTranslate = async (messageId: string, content: string) => {
    setTranslatingId(messageId)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, targetLanguage: 'en' }),
      })
      const data = await res.json()
      if (data.translation) {
        setTranslations(prev => ({ ...prev, [messageId]: data.translation }))
      }
    } catch (err) {
      console.error('Translation failed:', err)
    } finally {
      setTranslatingId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-5rem)] bg-[#f9f9f7]">
        <div className="flex items-center gap-3 px-4 h-16 bg-[#f4f4f2]">
          <Skeleton className="w-10 h-10 rounded-full bg-[#e8e8e6]" />
          <Skeleton className="h-5 w-32 bg-[#e8e8e6]" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}
            >
              <Skeleton className={cn(
                'h-12 w-48 bg-[#e8e8e6]',
                i % 2 === 0 ? 'rounded-tl-xl rounded-bl-xl rounded-br-xl' : 'rounded-tr-xl rounded-br-xl rounded-bl-xl'
              )} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {}
  messages.forEach(msg => {
    const dateKey = new Date(msg.created_at).toDateString()
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = []
    messagesByDate[dateKey].push(msg)
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-[#f9f9f7]">
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 h-16 bg-[#f4f4f2] sticky top-0 z-10">
        <button
          onClick={() => router.push('/messages')}
          className="text-[#005d42] p-2 hover:bg-[#e8e8e6] rounded-full transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {otherParticipant && (
          <>
            <div className="relative">
              {otherParticipant.avatar_url ? (
                <Image
                  src={otherParticipant.avatar_url}
                  alt={otherParticipant.full_name}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#005d42] text-white flex items-center justify-center text-sm font-bold">
                  {getInitials(otherParticipant.full_name)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#047857] rounded-full border-2 border-[#f4f4f2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold tracking-tight text-[#1a1c1b] text-base truncate">
                {otherParticipant.full_name}
              </p>
              <p className="text-[#3e4943] text-[12px] leading-tight">online</p>
            </div>
            <button className="text-[#005d42] hover:bg-[#e8e8e6] transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined">call</span>
            </button>
          </>
        )}
      </header>

      {/* Messages */}
      <main
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 bg-[#f9f9f7]"
        style={{ scrollbarWidth: 'none' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="material-symbols-outlined text-4xl text-[#6e7a73]">chat_bubble_outline</span>
            <p className="text-sm text-[#3e4943]/70">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([dateKey, dayMessages]) => (
            <div key={dateKey}>
              {/* Date separator - Stitch asymmetric editorial style */}
              <div className="flex items-center gap-4 ml-6 mb-4">
                <span className="text-[10px] font-medium text-[#3e4943]/40 tracking-widest uppercase">
                  {formatDateSeparator(dayMessages[0].created_at)}
                </span>
                <div className="h-px flex-1 bg-[#bdc9c1]/20" />
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-3">
                {dayMessages.map(msg => {
                  const isOwn = msg.sender_id === user?.id
                  const isImage = msg.message_type === 'image'
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start', 'max-w-[85%]',
                        isOwn ? 'self-end' : 'self-start'
                      )}
                    >
                      {/* Image message */}
                      {isImage && msg.image_url ? (
                        <div className={cn(
                          'rounded-xl overflow-hidden p-1 shadow-sm',
                          isOwn ? 'bg-[#047857]' : 'bg-[#f4f4f2]'
                        )}>
                          <Image
                            src={msg.image_url}
                            alt="Shared image"
                            width={400}
                            height={300}
                            unoptimized
                            className="rounded-lg object-cover aspect-video w-full max-h-64 cursor-pointer"
                            onClick={() => window.open(msg.image_url!, '_blank')}
                          />
                          <div className={cn('flex items-center justify-end gap-1 px-2 py-1')}>
                            <span className={cn(
                              'text-[10px]',
                              isOwn ? 'text-[#97f5cc]/80' : 'text-[#3e4943]/60'
                            )}>
                              {formatTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              <span
                                className="material-symbols-outlined text-[14px] text-[#97f5cc]"
                                style={msg.is_read ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              >
                                {msg.is_read ? 'done_all' : 'done'}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Text message */
                        <div
                          className={cn(
                            'px-4 py-3 text-sm leading-relaxed',
                            isOwn
                              ? 'bg-[#047857] text-white rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm'
                              : 'bg-[#f4f4f2] text-[#1a1c1b] rounded-tr-xl rounded-br-xl rounded-bl-xl'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                          {/* Translation */}
                          {translations[msg.id] && (
                            <div className={cn(
                              'mt-2 pt-2 border-t text-xs italic',
                              isOwn ? 'border-white/20 text-white/80' : 'border-[#bdc9c1] text-[#3e4943]'
                            )}>
                              {translations[msg.id]}
                            </div>
                          )}

                          {/* Translate button for received messages */}
                          {!isOwn && !translations[msg.id] && (
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <button
                                onClick={() => handleTranslate(msg.id, msg.content)}
                                disabled={translatingId === msg.id}
                                className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-[14px]">translate</span>
                                <span className="text-[10px] font-semibold uppercase tracking-tighter">
                                  {translatingId === msg.id ? '...' : 'Translate'}
                                </span>
                              </button>
                            </div>
                          )}
                          {!isOwn && translations[msg.id] && (
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <button
                                onClick={() => setTranslations(prev => {
                                  const next = { ...prev }
                                  delete next[msg.id]
                                  return next
                                })}
                                className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                                <span className="text-[10px] font-semibold uppercase tracking-tighter">
                                  Hide translation
                                </span>
                              </button>
                            </div>
                          )}

                          {/* Timestamp + read receipt */}
                          <div className={cn(
                            'flex items-center gap-1 mt-1',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}>
                            <span className={cn(
                              'text-[10px]',
                              isOwn ? 'text-[#97f5cc]/80' : 'text-[#3e4943]/60'
                            )}>
                              {formatTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              <span
                                className="material-symbols-outlined text-[14px] text-[#97f5cc]"
                                style={msg.is_read ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              >
                                {msg.is_read ? 'done_all' : 'done'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar */}
      <div className="bg-[#f9f9f7] border-t border-[#e2e3e1]/20 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(26,28,27,0.06)] sticky bottom-0 z-10">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="flex items-center justify-center text-[#3e4943] p-2 hover:bg-[#f4f4f2] rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">photo_camera</span>
        </button>

        <div className="flex-1 bg-[#f4f4f2] rounded-full px-5 py-2.5">
          <input
            className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm placeholder:text-[#3e4943]/50 text-[#1a1c1b]"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="flex items-center justify-center bg-[#047857] text-white rounded-full h-11 w-11 shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isSending ? 'hourglass_empty' : 'send'}
          </span>
        </button>
      </div>
    </div>
  )
}
