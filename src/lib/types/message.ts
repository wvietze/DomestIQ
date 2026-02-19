// -----------------------------------------------------------------------------
// Conversation & Message Types — matches database schema
// -----------------------------------------------------------------------------

export type ConversationStatus = 'active' | 'archived' | 'blocked';

export type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
  booking_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  status: string;
  created_at: string;
};

export type MessageType = 'text' | 'image' | 'system';

export type TranslationCache = Record<string, string>;

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  translation_cache: TranslationCache | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
};
