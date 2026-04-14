'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { Skeleton } from '@/components/ui/skeleton'

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
 return (
 <Suspense fallback={<MessagesListSkeleton />}>
 <ClientMessagesContent />
 </Suspense>
 )
}

function MessagesListSkeleton() {
 return (
  <div className="bg-[#f9f9f7] min-h-screen">
   <div className="px-6 py-4">
    <Skeleton className="h-7 w-32 bg-[#e8e8e6]" />
   </div>
   <div className="px-4 mb-4">
    <Skeleton className="h-12 w-full rounded-xl bg-[#f4f4f2]" />
   </div>
   {[1, 2, 3, 4, 5].map(i => (
    <div key={i} className="flex items-center gap-4 px-6 h-[80px]">
     <Skeleton className="w-12 h-12 rounded-full bg-[#e8e8e6]" />
     <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32 bg-[#e8e8e6]" />
      <Skeleton className="h-3 w-48 bg-[#f4f4f2]" />
     </div>
     <Skeleton className="h-3 w-12 bg-[#f4f4f2]" />
    </div>
   ))}
  </div>
 )
}

function ClientMessagesContent() {
 const supabase = createClient()
 const router = useRouter()
 const searchParams = useSearchParams()
 const { user, isLoading: userLoading } = useUser()
 const [conversations, setConversations] = useState<ConversationItem[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [isConnecting, setIsConnecting] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [searchOpen, setSearchOpen] = useState(false)

 // Handle ?with={userId} param to auto-create/find conversation
 useEffect(() => {
  const withUserId = searchParams.get('with')
  if (!withUserId || !user || userLoading) return

  setIsConnecting(true)
  async function connectWithUser() {
   try {
    const { data: existing } = await supabase
     .from('conversations')
     .select('id')
     .or(`and(participant_1.eq.${user!.id},participant_2.eq.${withUserId}),and(participant_1.eq.${withUserId},participant_2.eq.${user!.id})`)
     .eq('status', 'active')
     .limit(1)
     .maybeSingle()

    if (existing) {
     router.replace(`/messages/${existing.id}`)
     return
    }

    const { data: newConvo } = await supabase
     .from('conversations')
     .insert({ participant_1: user!.id, participant_2: withUserId, status: 'active' })
     .select('id')
     .single()

    if (newConvo) {
     router.replace(`/messages/${newConvo.id}`)
     return
    }
   } catch (err) {
    console.error('Connect error:', err)
   }
   setIsConnecting(false)
  }
  connectWithUser()
 }, [searchParams, user, userLoading, supabase, router])

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

 // Realtime subscription for conversation updates
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
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}hr ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
 }

 const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

 const filteredConversations = searchQuery
  ? conversations.filter(c => c.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  : conversations

 if (isConnecting) {
  return (
   <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-[#f9f9f7]">
    <span className="material-symbols-outlined text-[#005d42] text-3xl animate-spin">progress_activity</span>
    <p className="text-[#3e4943] text-sm">Opening conversation...</p>
   </div>
  )
 }

 if (userLoading || isLoading) return <MessagesListSkeleton />

 return (
  <div className="bg-[#f9f9f7] min-h-screen">
   {/* Header */}
   <header className="sticky top-0 z-50 bg-[#f9f9f7]">
    <div className="flex justify-between items-center px-6 py-4">
     <h1 className="font-heading font-bold text-xl tracking-tight text-[#005d42]">Messages</h1>
     <button
      onClick={() => setSearchOpen(!searchOpen)}
      className="text-[#005d42] p-2 hover:bg-[#e8e8e6] rounded-full transition-colors active:scale-95"
     >
      <span className="material-symbols-outlined">{searchOpen ? 'close' : 'search'}</span>
     </button>
    </div>

    {/* Search bar */}
    <div
     className="overflow-hidden transition-all duration-200 ease-out px-6"
     style={{ maxHeight: searchOpen ? '56px' : '0', opacity: searchOpen ? 1 : 0 }}
    >
     <div className="bg-[#f4f4f2] rounded-xl flex items-center gap-3 px-4 py-3 mb-4">
      <span className="material-symbols-outlined text-[#6e7a73] text-xl">search</span>
      <input
       className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm placeholder:text-[#3e4943]/50 text-[#1a1c1b]"
       placeholder="Search conversations..."
       value={searchQuery}
       onChange={e => setSearchQuery(e.target.value)}
       autoFocus
      />
     </div>
    </div>
   </header>

   {/* Conversation list */}
   <main className="flex flex-col w-full">
    {filteredConversations.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#f4f4f2] flex items-center justify-center">
       <span className="material-symbols-outlined text-3xl text-[#6e7a73]">
        {searchQuery ? 'search_off' : 'chat_bubble_outline'}
       </span>
      </div>
      <div className="text-center">
       <p className="font-heading font-bold text-[#1a1c1b]">
        {searchQuery ? 'No results' : 'No messages yet'}
       </p>
       <p className="text-sm text-[#3e4943]/70 mt-1">
        {searchQuery
         ? 'Try a different search term.'
         : 'When you message a worker, your conversations will appear here.'}
       </p>
      </div>
     </div>
    ) : (
     filteredConversations.map((convo, index) => {
      const isUnread = convo.unread_count > 0
      const isEven = index % 2 === 0

      return (
       <Link key={convo.id} href={`/messages/${convo.id}`}>
        <div
         className={`h-[80px] flex items-center px-6 gap-4 transition-colors cursor-pointer active:bg-[#e2e3e1]/40 ${
          isUnread
           ? 'bg-[#047857]/5 border-l-4 border-[#005d42]'
           : isEven
            ? 'bg-[#f9f9f7] hover:bg-[#f4f4f2]'
            : 'bg-[#f4f4f2] hover:bg-[#e8e8e6]'
         }`}
        >
         {/* Avatar */}
         <div className="relative flex-shrink-0">
          {convo.other_user.avatar_url ? (
           <Image
            src={convo.other_user.avatar_url}
            alt={convo.other_user.full_name}
            width={48}
            height={48}
            unoptimized
            className={`w-12 h-12 rounded-full object-cover ${isUnread ? '' : 'grayscale-[0.2]'}`}
           />
          ) : (
           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
            isUnread ? 'bg-[#005d42] text-white' : 'bg-[#e8e8e6] text-[#3e4943]'
           }`}>
            {getInitials(convo.other_user.full_name)}
           </div>
          )}
         </div>

         {/* Content */}
         <div className="flex flex-col flex-grow min-w-0">
          <div className="flex justify-between items-baseline">
           <span className="font-bold text-[#1a1c1b] truncate">
            {convo.other_user.full_name}
           </span>
           <span className={`text-[11px] shrink-0 ml-2 ${
            isUnread ? 'font-bold text-[#005d42]' : 'text-[#3e4943]'
           }`}>
            {formatTime(convo.last_message_at)}
           </span>
          </div>
          <div className="flex justify-between items-center">
           <p className={`text-sm truncate ${
            isUnread ? 'text-[#3e4943] font-medium' : 'text-[#3e4943]/70'
           }`}>
            {convo.last_message_preview || 'No messages yet'}
           </p>
           {isUnread && (
            <div className="w-2.5 h-2.5 bg-[#005d42] rounded-full ml-2 shrink-0" />
           )}
          </div>
         </div>
        </div>
       </Link>
      )
     })
    )}

    {/* End of list indicator */}
    {filteredConversations.length > 0 && (
     <div className="mt-8 mx-6 p-8 rounded-2xl bg-[#f4f4f2] text-center mb-8">
      <span className="material-symbols-outlined text-4xl text-[#6e7a73] mb-4 block">archive</span>
      <p className="font-heading font-bold text-[#3e4943]">End of recent chats</p>
      <p className="text-sm text-[#3e4943]/70">Looking for older conversations? Check your archive.</p>
     </div>
    )}
   </main>
  </div>
 )
}
