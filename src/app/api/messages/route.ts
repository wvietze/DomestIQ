import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/messages
 * Get conversations for authenticated user.
 * Includes last message preview and unread count.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch conversations where the user is a participant
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(
        '*, participant_one_profile:profiles!conversations_participant_one_fkey(id, full_name, avatar_url), participant_two_profile:profiles!conversations_participant_two_fkey(id, full_name, avatar_url)'
      )
      .or(
        `participant_one.eq.${user.id},participant_two.eq.${user.id}`
      )
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })

    if (convError) {
      console.error('Conversations fetch error:', convError)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // For each conversation, get unread message count
    const conversationsWithUnread = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .eq('is_read', false)

        // Determine the other participant's profile
        const otherParticipant =
          conv.participant_one === user.id
            ? conv.participant_two_profile
            : conv.participant_one_profile

        return {
          id: conv.id,
          bookingId: conv.booking_id,
          otherParticipant,
          lastMessageAt: conv.last_message_at,
          lastMessagePreview: conv.last_message_preview,
          unreadCount: count || 0,
          createdAt: conv.created_at,
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithUnread })
  } catch (error) {
    console.error('GET /api/messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * Send a message.
 * Required: conversationId, content.
 * Optional: messageType, imageUrl.
 * Validates user is a participant of the conversation.
 * Updates conversation last_message_at.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      conversationId,
      content,
      messageType = 'text',
      imageUrl,
    } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, content' },
        { status: 400 }
      )
    }

    // Verify the conversation exists and user is a participant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, participant_one, participant_two')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (
      conversation.participant_one !== user.id &&
      conversation.participant_two !== user.id
    ) {
      return NextResponse.json(
        { error: 'You are not a participant of this conversation' },
        { status: 403 }
      )
    }

    // Build message content based on type
    const messageContent =
      messageType === 'image' && imageUrl ? imageUrl : content

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageContent,
        message_type: messageType,
      })
      .select()
      .single()

    if (msgError) {
      console.error('Message creation error:', msgError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Update conversation's last message timestamp and preview
    const preview =
      messageType === 'image'
        ? 'Sent an image'
        : content.length > 100
          ? content.substring(0, 100) + '...'
          : content

    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
      })
      .eq('id', conversationId)

    // Notify the other participant
    const recipientId =
      conversation.participant_one === user.id
        ? conversation.participant_two
        : conversation.participant_one

    await supabase.from('notifications').insert({
      user_id: recipientId,
      title: 'New Message',
      body: preview,
      type: 'message',
      data: { conversation_id: conversationId, message_id: message.id },
      channel: 'in_app',
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
