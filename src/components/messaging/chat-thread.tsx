'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './message-bubble'
import { Send, ImagePlus } from 'lucide-react'
import { WaveBars, BouncingDots } from '@/components/loading'
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
  const supabase = createClient()

  const scrollToBottom = useCallback(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(100)
      if (data) setMessages(data)
      setLoading(false)
    }
    load()
    const channel = supabase.channel(`messages:${conversationId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => { setMessages(prev => [...prev, payload.new as ChatMessage]) }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const handleSend = async () => {
    const text = newMessage.trim()
    if (!text || sending) return
    setSending(true); setNewMessage('')
    await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: currentUserId, content: text, message_type: 'text' })
    setSending(false)
  }

  const handleTranslate = async (messageId: string) => {
    try {
      const msg = messages.find(m => m.id === messageId)
      if (!msg) return null
      const res = await fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: msg.content, targetLanguage: currentLanguage }) })
      const data = await res.json()
      return data.translatedText || null
    } catch { return null }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><BouncingDots size="md" /></div>

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>}
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} currentLanguage={currentLanguage} onTranslate={handleTranslate} />)}
        <div ref={bottomRef} />
      </div>
      <div className="border-t bg-background p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0"><ImagePlus className="w-5 h-5" /></Button>
          <Input placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} className="h-11 text-base" />
          <Button size="icon" className="shrink-0 h-11 w-11" onClick={handleSend} disabled={!newMessage.trim() || sending}>
            {sending ? <WaveBars size="sm" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
