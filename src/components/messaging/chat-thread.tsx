'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageBubble } from './message-bubble'
import { BouncingDots } from '@/components/loading'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
  id: string; content: string; sender_id: string; message_type: string
  image_url: string | null; is_read: boolean; created_at: string
  translation_cache: Record<string, string> | null
}

interface ChatThreadProps {
  conversationId: string
  currentUserId: string
  currentLanguage?: string
}

export function ChatThread({ conversationId, currentUserId, currentLanguage = 'en' }: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100)
      if (data) setMessages(data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => {
          const newMsg = payload.new as ChatMessage
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const updated = payload.new as ChatMessage
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const handleSend = async () => {
    const text = newMessage.trim()
    if (!text || sending) return
    setSending(true)
    setNewMessage('')

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
      message_type: 'text',
      is_read: false,
    })

    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
      last_message_preview: text.slice(0, 100),
    }).eq('id', conversationId)

    setSending(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSending(true)
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

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        message_type: 'image',
        content: 'Sent an image',
        image_url: urlData.publicUrl,
        is_read: false,
      })

      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        last_message_preview: 'Sent an image',
      }).eq('id', conversationId)
    } catch (err) {
      console.error('Failed to upload image:', err)
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleTranslate = async (messageId: string) => {
    try {
      const msg = messages.find(m => m.id === messageId)
      if (!msg) return null
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, targetLanguage: currentLanguage }),
      })
      const data = await res.json()
      return data.translatedText || data.translation || null
    } catch { return null }
  }

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BouncingDots size="md" />
      </div>
    )
  }

  // Group messages by date
  const messagesByDate: Record<string, ChatMessage[]> = {}
  messages.forEach(msg => {
    const dateKey = new Date(msg.created_at).toDateString()
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = []
    messagesByDate[dateKey].push(msg)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 bg-[#f9f9f7]"
        style={{ scrollbarWidth: 'none' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="material-symbols-outlined text-4xl text-[#6e7a73]">chat_bubble_outline</span>
            <p className="text-sm text-[#3e4943]/70">No messages yet. Start the conversation!</p>
          </div>
        )}

        {Object.entries(messagesByDate).map(([dateKey, dayMessages]) => (
          <div key={dateKey}>
            {/* Date marker */}
            <div className="flex items-center gap-4 ml-6 mb-4">
              <span className="text-[10px] font-medium text-[#3e4943]/40 tracking-widest uppercase">
                {formatDateSeparator(dayMessages[0].created_at)}
              </span>
              <div className="h-px flex-1 bg-[#bdc9c1]/20" />
            </div>

            {dayMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                currentLanguage={currentLanguage}
                onTranslate={handleTranslate}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-[#f9f9f7] border-t border-[#e2e3e1]/20 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(26,28,27,0.06)]">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
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
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={sending}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="flex items-center justify-center bg-[#047857] text-white rounded-full h-11 w-11 shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {sending ? 'hourglass_empty' : 'send'}
          </span>
        </button>
      </div>
    </div>
  )
}
