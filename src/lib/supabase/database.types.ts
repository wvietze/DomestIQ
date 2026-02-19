/* eslint-disable @typescript-eslint/no-explicit-any */

// Flexible Insert/Update type that accepts any valid column values
type Insertable = Record<string, any>
type Updatable = Record<string, any>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          full_name: string
          phone: string | null
          email: string | null
          preferred_language: string
          avatar_url: string | null
          popi_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      worker_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          hourly_rate: number | null
          overall_rating: number
          total_reviews: number
          location_lat: number | null
          location_lng: number | null
          service_radius_km: number
          id_verified: boolean
          criminal_check_clear: boolean
          search_rank: number
          profile_completeness: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          address: string | null
          suburb: string | null
          city: string | null
          province: string | null
          location_lat: number | null
          location_lng: number | null
          preferred_contact: string
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      services: {
        Row: {
          id: string
          name: string
          name_zu: string | null
          name_xh: string | null
          name_af: string | null
          name_st: string | null
          description: string | null
          icon: string
          category: string
          base_rate: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      worker_services: {
        Row: {
          id: string
          worker_id: string
          service_id: string
          skill_level: string | null
          custom_rate: number | null
          years_experience: number | null
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      worker_availability: {
        Row: {
          id: string
          worker_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      worker_blocked_dates: {
        Row: {
          id: string
          worker_id: string
          blocked_date: string
          reason: string | null
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          worker_id: string
          service_id: string
          status: string
          scheduled_date: string
          start_time: string
          end_time: string | null
          location_lat: number | null
          location_lng: number | null
          address: string | null
          suburb: string | null
          instructions: string | null
          total_amount: number | null
          is_recurring: boolean
          recurrence_rule: any
          parent_booking_id: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          overall_rating: number
          punctuality: number | null
          quality: number | null
          communication: number | null
          comment: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          booking_id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          status: string
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          translation_cache: any
          image_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: any
          action_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          file_url: string
          file_name: string | null
          ocr_raw_text: string | null
          ocr_extracted_data: any
          verification_status: string
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      worker_service_areas: {
        Row: {
          id: string
          worker_id: string
          area_name: string
          center_lat: number
          center_lng: number
          radius_km: number
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      consent_records: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          consent_given: boolean
          consent_text: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
      report_flags: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_content_type: string
          reported_content_id: string
          reason: string
          description: string | null
          status: string
          resolved_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: Insertable
        Update: Updatable
      }
    }
    Views: Record<string, never>
    Functions: {
      search_workers: {
        Args: {
          p_lat?: number | null
          p_lng?: number | null
          p_radius_km?: number
          p_service_id?: string | null
          p_min_rating?: number
          p_available_day?: number | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          worker_id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          hourly_rate: number | null
          overall_rating: number
          total_reviews: number
          location_lat: number | null
          location_lng: number | null
          service_radius_km: number
          id_verified: boolean
          criminal_check_clear: boolean
          search_rank: number
          profile_completeness: number
          distance_km: number | null
          services: any
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
