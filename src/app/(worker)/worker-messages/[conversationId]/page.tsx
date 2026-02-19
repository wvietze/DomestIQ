'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, Send, Camera, Check, CheckCheck,
  Languages, Loader2, Image as ImageIcon, X
} from 'lucide-react'
import type { Message } from '@/lib/types'

interface Participant {
  id: string
  full_name: string
  avatar_url: string | null
}

export default function WorkerConversationPage({
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
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Get conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (!conversation) {
        setIsLoading(false)
        return
      }

      // Get other participant
      const otherUserId =
        conversation.participant_1 === authUser.id
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

      // Load messages
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
        .neq('sender_id', authUser.id)
        .eq('is_read', false)

      setIsLoading(false)
    }

    loadConversation()
  }, [conversationId, supabase])

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

          // Mark as read if from other participant
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

      // Update conversation last message
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-3 p-4 border-b">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}
            >
              <Skeleton className="h-12 w-48 rounded-2xl" />
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
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/worker-messages')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {otherParticipant && (
          <>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherParticipant.avatar_url || undefined} />
              <AvatarFallback>
                {otherParticipant.full_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {otherParticipant.full_name}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([dateKey, dayMessages]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {formatDateSeparator(dayMessages[0].created_at)}
                </span>
              </div>

              {dayMessages.map(msg => {
                const isOwn = msg.sender_id === user?.id
                const isImage = msg.message_type === 'image'
                return (
                  <div
                    key={msg.id}
                    className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      {isImage && msg.image_url ? (
                        <div className="space-y-1">
                          <img
                            src={msg.image_url}
                            alt="Image"
                            className="rounded-lg max-h-64 object-cover cursor-pointer"
                            onClick={() => window.open(msg.image_url!, '_blank')}
                          />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}

                      {/* Translation */}
                      {translations[msg.id] && (
                        <div
                          className={cn(
                            'mt-2 pt-2 border-t text-xs italic',
                            isOwn
                              ? 'border-primary-foreground/20 text-primary-foreground/80'
                              : 'border-border text-muted-foreground'
                          )}
                        >
                          {translations[msg.id]}
                        </div>
                      )}

                      {/* Time and read status */}
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <span
                          className={cn(
                            'text-[10px]',
                            isOwn
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          )}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isOwn && (
                          msg.is_read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                          )
                        )}
                      </div>

                      {/* Translate button for received messages */}
                      {!isOwn && !translations[msg.id] && (
                        <button
                          onClick={() => handleTranslate(msg.id, msg.content)}
                          disabled={translatingId === msg.id}
                          className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {translatingId === msg.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Languages className="w-3 h-3" />
                          )}
                          Translate
                        </button>
                      )}
                      {!isOwn && translations[msg.id] && (
                        <button
                          onClick={() =>
                            setTranslations(prev => {
                              const next = { ...prev }
                              delete next[msg.id]
                              return next
                            })
                          }
                          className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Hide translation
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t bg-white p-3 sticky bottom-0">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="shrink-0"
          >
            <Camera className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
