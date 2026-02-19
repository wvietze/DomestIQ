'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface ConversationItem {
  id: string
  participant_one: string
  participant_two: string
  last_message_at: string | null
  last_message_preview: string | null
  other_profile: {
    full_name: string
    avatar_url: string | null
  }
  unread_count: number
}

export default function WorkerMessagesPage() {
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConversations() {
      if (!user) return

      // Get all conversations where user is a participant
      const { data: convos } = await supabase
        .from('conversations')
        .select('id, participant_one, participant_two, last_message_at, last_message_preview')
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false })

      if (!convos) {
        setIsLoading(false)
        return
      }

      // For each conversation, get the other participant's profile and unread count
      const enriched: ConversationItem[] = await Promise.all(
        convos.map(async (convo) => {
          const otherId = convo.participant_one === user.id
            ? convo.participant_two
            : convo.participant_one

          // Get other participant's profile
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherId)
            .single()

          // Count unread messages in this conversation
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .neq('sender_id', user.id)
            .eq('is_read', false)

          return {
            ...convo,
            other_profile: otherProfile || { full_name: 'Unknown User', avatar_url: null },
            unread_count: count || 0,
          }
        })
      )

      setConversations(enriched)
      setIsLoading(false)
    }

    if (!userLoading) loadConversations()
  }, [user, userLoading, supabase])

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 1) {
      const mins = Math.floor(diffMs / (1000 * 60))
      return mins <= 1 ? 'Just now' : `${mins}m ago`
    }
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    }
    if (diffHours < 48) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
  }

  if (userLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
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
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold"
      >
        Messages
      </motion.h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold text-lg mb-1">No Messages</h2>
            <p className="text-muted-foreground text-sm">
              Conversations with clients will appear here when they message you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {conversations.map((convo, index) => {
            const initials = convo.other_profile.full_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)

            return (
              <motion.div
                key={convo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link href={`/worker-messages/${convo.id}`}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Avatar with unread indicator */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={convo.other_profile.avatar_url || undefined} />
                          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        {convo.unread_count > 0 && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                        )}
                      </div>

                      {/* Conversation Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${convo.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                            {convo.other_profile.full_name}
                          </p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTimestamp(convo.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`text-xs truncate ${convo.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {convo.last_message_preview || 'No messages yet'}
                          </p>
                          {convo.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {convo.unread_count > 9 ? '9+' : convo.unread_count}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
