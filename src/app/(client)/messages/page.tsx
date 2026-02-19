'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'

interface ConversationItem {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string | null
  last_message_preview: string | null
  status: string
  other_user: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  unread_count: number
}

export default function ClientMessagesPage() {
  const supabase = createClient()
  const { user, isLoading: userLoading } = useUser()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConversations() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Fetch conversations where the user is a participant
      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${authUser.id},participant_2.eq.${authUser.id}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (!convos) {
        setIsLoading(false)
        return
      }

      // Get other participant profiles and unread counts
      const conversationItems: ConversationItem[] = []

      for (const convo of convos) {
        const otherUserId =
          convo.participant_1 === authUser.id
            ? convo.participant_2
            : convo.participant_1

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single()

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convo.id)
          .neq('sender_id', authUser.id)
          .eq('is_read', false)

        conversationItems.push({
          ...convo,
          other_user: profile
            ? (profile as unknown as { id: string; full_name: string; avatar_url: string | null })
            : { id: otherUserId, full_name: 'Unknown User', avatar_url: null },
          unread_count: count || 0,
        })
      }

      setConversations(conversationItems)
      setIsLoading(false)
    }

    loadConversations()
  }, [supabase])

  // Realtime subscription for conversation updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('conversations-list')
      .on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as ConversationItem
          setConversations(prev =>
            prev
              .map(c => {
                if (c.id === updated.id) {
                  return {
                    ...c,
                    last_message_at: updated.last_message_at,
                    last_message_preview: updated.last_message_preview,
                  }
                }
                return c
              })
              .sort((a, b) => {
                if (!a.last_message_at) return 1
                if (!b.last_message_at) return -1
                return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
              })
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-1">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-muted-foreground">
            When you message a worker, your conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {conversations.map(convo => (
            <Link
              key={convo.id}
              href={`/messages/${convo.id}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={convo.other_user.avatar_url || undefined} />
                  <AvatarFallback>
                    {convo.other_user.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium truncate ${
                      convo.unread_count > 0 ? 'text-foreground' : 'text-foreground'
                    }`}
                  >
                    {convo.other_user.full_name}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {formatTime(convo.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      convo.unread_count > 0
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {convo.last_message_preview || 'No messages yet'}
                  </p>
                  {convo.unread_count > 0 && (
                    <Badge className="ml-2 shrink-0 bg-primary text-primary-foreground text-xs h-5 min-w-[20px] flex items-center justify-center rounded-full">
                      {convo.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
