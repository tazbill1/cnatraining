export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bug_reports: {
        Row: {
          created_at: string
          dealership_id: string | null
          description: string | null
          device_info: Json | null
          error_context: Json | null
          error_message: string | null
          error_stack: string | null
          error_type: string | null
          id: string
          recent_actions: Json | null
          screenshot_path: string | null
          source: string
          status: string
          url: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          viewport: string | null
        }
        Insert: {
          created_at?: string
          dealership_id?: string | null
          description?: string | null
          device_info?: Json | null
          error_context?: Json | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          id?: string
          recent_actions?: Json | null
          screenshot_path?: string | null
          source?: string
          status?: string
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          viewport?: string | null
        }
        Update: {
          created_at?: string
          dealership_id?: string | null
          description?: string | null
          device_info?: Json | null
          error_context?: Json | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          id?: string
          recent_actions?: Json | null
          screenshot_path?: string | null
          source?: string
          status?: string
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          viewport?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_scenarios: {
        Row: {
          buyer_type: string
          category: string
          created_at: string | null
          customer_name: string
          dealership_id: string
          description: string | null
          difficulty: string
          estimated_time: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
          name: string
          opening_line: string
          personality: string | null
          system_prompt: string
          trade_value: string | null
          trade_vehicle: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_type?: string
          category?: string
          created_at?: string | null
          customer_name?: string
          dealership_id: string
          description?: string | null
          difficulty?: string
          estimated_time?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          name: string
          opening_line: string
          personality?: string | null
          system_prompt: string
          trade_value?: string | null
          trade_vehicle?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_type?: string
          category?: string
          created_at?: string | null
          customer_name?: string
          dealership_id?: string
          description?: string | null
          difficulty?: string
          estimated_time?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          name?: string
          opening_line?: string
          personality?: string | null
          system_prompt?: string
          trade_value?: string | null
          trade_vehicle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_scenarios_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_scenarios_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dealership_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_module_sections: {
        Row: {
          content_html: string | null
          content_type: string
          created_at: string
          id: string
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_html?: string | null
          content_type?: string
          created_at?: string
          id?: string
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_html?: string | null
          content_type?: string
          created_at?: string
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealership_module_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dealership_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_modules: {
        Row: {
          base_module_id: string | null
          category: string
          created_at: string
          dealership_id: string
          description: string | null
          estimated_time: string | null
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          base_module_id?: string | null
          category?: string
          created_at?: string
          dealership_id: string
          description?: string | null
          estimated_time?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          base_module_id?: string | null
          category?: string
          created_at?: string
          dealership_id?: string
          description?: string | null
          estimated_time?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealership_modules_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_practice_scenarios: {
        Row: {
          category: string
          created_at: string
          customer_quote: string
          customer_setup: string
          decision_points: Json
          difficulty: string
          id: string
          is_active: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          customer_quote: string
          customer_setup: string
          decision_points?: Json
          difficulty?: string
          id?: string
          is_active?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          customer_quote?: string
          customer_setup?: string
          decision_points?: Json
          difficulty?: string
          id?: string
          is_active?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_practice_scenarios_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dealership_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_quiz_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          module_id: string
          options: Json
          question: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          module_id: string
          options?: Json
          question: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          module_id?: string
          options?: Json
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "dealership_quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dealership_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dealership_settings: {
        Row: {
          certificates_enabled: boolean | null
          completion_deadline_days: number | null
          created_at: string
          custom_base_statement: string | null
          custom_welcome_message: string | null
          dealership_id: string
          dealership_tagline: string | null
          enabled_difficulty_levels: string[] | null
          enabled_module_ids: string[] | null
          enabled_scenario_categories: string[] | null
          id: string
          leaderboard_enabled: boolean | null
          logo_url: string | null
          primary_color: string | null
          required_module_ids: string[] | null
          updated_at: string
          voice_training_enabled: boolean | null
        }
        Insert: {
          certificates_enabled?: boolean | null
          completion_deadline_days?: number | null
          created_at?: string
          custom_base_statement?: string | null
          custom_welcome_message?: string | null
          dealership_id: string
          dealership_tagline?: string | null
          enabled_difficulty_levels?: string[] | null
          enabled_module_ids?: string[] | null
          enabled_scenario_categories?: string[] | null
          id?: string
          leaderboard_enabled?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          required_module_ids?: string[] | null
          updated_at?: string
          voice_training_enabled?: boolean | null
        }
        Update: {
          certificates_enabled?: boolean | null
          completion_deadline_days?: number | null
          created_at?: string
          custom_base_statement?: string | null
          custom_welcome_message?: string | null
          dealership_id?: string
          dealership_tagline?: string | null
          enabled_difficulty_levels?: string[] | null
          enabled_module_ids?: string[] | null
          enabled_scenario_categories?: string[] | null
          id?: string
          leaderboard_enabled?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          required_module_ids?: string[] | null
          updated_at?: string
          voice_training_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dealership_settings_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: true
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      drill_scores: {
        Row: {
          best_streak: number
          created_at: string
          dealership_id: string | null
          drill_key: string
          id: string
          last_streak: number
          plays: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          dealership_id?: string | null
          drill_key: string
          id?: string
          last_streak?: number
          plays?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          dealership_id?: string | null
          drill_key?: string
          id?: string
          last_streak?: number
          plays?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drill_scores_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          dealership_id: string | null
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          dealership_id?: string | null
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          dealership_id?: string | null
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      module_completions: {
        Row: {
          completed_at: string
          dealership_id: string | null
          id: string
          module_id: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          dealership_id?: string | null
          id?: string
          module_id: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          dealership_id?: string | null
          id?: string
          module_id?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      module_section_progress: {
        Row: {
          created_at: string
          id: string
          module_id: string
          section_key: string
          updated_at: string
          user_id: string
          watched_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          section_key: string
          updated_at?: string
          user_id: string
          watched_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          section_key?: string
          updated_at?: string
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_section_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "dealership_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coaching_intensity: string | null
          created_at: string
          dealership_id: string | null
          dealership_name: string | null
          difficulty_default: string | null
          email: string
          full_name: string
          id: string
          last_active_at: string | null
          updated_at: string
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          coaching_intensity?: string | null
          created_at?: string
          dealership_id?: string | null
          dealership_name?: string | null
          difficulty_default?: string | null
          email?: string
          full_name?: string
          id?: string
          last_active_at?: string | null
          updated_at?: string
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          coaching_intensity?: string | null
          created_at?: string
          dealership_id?: string | null
          dealership_name?: string | null
          difficulty_default?: string | null
          email?: string
          full_name?: string
          id?: string
          last_active_at?: string | null
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_goals: {
        Row: {
          close_rate_goal: number
          created_at: string
          dealership_id: string | null
          id: string
          internet_leads_goal: number
          month: string
          phone_leads_goal: number
          sales_goal: number
          show_rate_goal: number
          updated_at: string
          user_id: string
          walk_ins_goal: number
        }
        Insert: {
          close_rate_goal?: number
          created_at?: string
          dealership_id?: string | null
          id?: string
          internet_leads_goal?: number
          month: string
          phone_leads_goal?: number
          sales_goal?: number
          show_rate_goal?: number
          updated_at?: string
          user_id: string
          walk_ins_goal?: number
        }
        Update: {
          close_rate_goal?: number
          created_at?: string
          dealership_id?: string | null
          id?: string
          internet_leads_goal?: number
          month?: string
          phone_leads_goal?: number
          sales_goal?: number
          show_rate_goal?: number
          updated_at?: string
          user_id?: string
          walk_ins_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_goals_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_leads: {
        Row: {
          created_at: string
          customer_name: string
          dealership_id: string | null
          id: string
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          dealership_id?: string | null
          id?: string
          source: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          dealership_id?: string | null
          id?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          ai_feedback: Json | null
          checklist_state: Json | null
          cna_completion_score: number | null
          completed_at: string | null
          conversation: Json | null
          dealership_id: string | null
          duration_seconds: number | null
          id: string
          info_gathering_score: number | null
          needs_identification_score: number | null
          rapport_score: number | null
          scenario_type: string
          score: number | null
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          checklist_state?: Json | null
          cna_completion_score?: number | null
          completed_at?: string | null
          conversation?: Json | null
          dealership_id?: string | null
          duration_seconds?: number | null
          id?: string
          info_gathering_score?: number | null
          needs_identification_score?: number | null
          rapport_score?: number | null
          scenario_type: string
          score?: number | null
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          checklist_state?: Json | null
          cna_completion_score?: number | null
          completed_at?: string | null
          conversation?: Json | null
          dealership_id?: string | null
          duration_seconds?: number | null
          id?: string
          info_gathering_score?: number | null
          needs_identification_score?: number | null
          rapport_score?: number | null
          scenario_type?: string
          score?: number | null
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      walk_in_logs: {
        Row: {
          dealership_id: string | null
          id: string
          logged_at: string
          type: string
          user_id: string
        }
        Insert: {
          dealership_id?: string | null
          id?: string
          logged_at?: string
          type: string
          user_id: string
        }
        Update: {
          dealership_id?: string | null
          id?: string
          logged_at?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_in_logs_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_user_dealership_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "salesperson" | "manager" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["salesperson", "manager", "super_admin"],
    },
  },
} as const
