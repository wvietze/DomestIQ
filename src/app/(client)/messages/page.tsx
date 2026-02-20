'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }

interface ConversationItem {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string | null
  last_message_preview: string | null
  status: string
  other_user: { id: string; full_name: string; avatar_url: string | null }
  unread_count: number
}

export default function ClientMessagesPage() {
  const supabase = createClient()
  const { user, isLoading: userLoading } = useUser()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConversations() {
      if (!user) return

      try {
        const { data: convos } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .eq('status', 'active')
          .order('last_message_at', { ascending: false, nullsFirst: false })

        if (!convos) return

        const conversationItems: ConversationItem[] = []
        for (const convo of convos) {
          const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1

          const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', otherUserId).single()
          const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', convo.id).neq('sender_id', user.id).eq('is_read', false)

          conversationItems.push({
            ...convo,
            other_user: profile
              ? (profile as unknown as { id: string; full_name: string; avatar_url: string | null })
              : { id: otherUserId, full_name: 'Unknown User', avatar_url: null },
            unread_count: count || 0,
          })
        }

        setConversations(conversationItems)
      } catch (err) {
        console.error('Messages load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (!userLoading) loadConversations()
  }, [user, userLoading, supabase])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('conversations-list')
      .on('postgres_changes' as never, { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as ConversationItem
          setConversations(prev =>
            prev.map(c => c.id === updated.id ? { ...c, last_message_at: updated.last_message_at, last_message_preview: updated.last_message_preview } : c)
              .sort((a, b) => { if (!a.last_message_at) return 1; if (!b.last_message_at) return -1; return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime() })
          )
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, user])

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-1">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold">Messages</h1>
      </motion.div>

      {conversations.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-muted-foreground text-sm">When you message a worker, your conversations will appear here.</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="divide-y rounded-xl border overflow-hidden bg-white">
          {conversations.map(convo => (
            <motion.div key={convo.id} variants={fadeUp} transition={{ duration: 0.3 }}>
              <Link href={`/messages/${convo.id}`}
                className="flex items-center gap-3 p-4 hover:bg-emerald-50/30 transition-colors">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={convo.other_user.avatar_url || undefined} />
                    <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
                      {convo.other_user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {convo.unread_count > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate ${convo.unread_count > 0 ? 'font-semibold' : ''}`}>
                      {convo.other_user.full_name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${convo.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {convo.last_message_preview || 'No messages yet'}
                    </p>
                    {convo.unread_count > 0 && (
                      <Badge className="ml-2 shrink-0 bg-emerald-500 text-white text-xs h-5 min-w-[20px] flex items-center justify-center rounded-full">
                        {convo.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
