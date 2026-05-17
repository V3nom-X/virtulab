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
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          points: number | null
          start_date: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          points?: number | null
          start_date?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          points?: number | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "collaboration_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_rooms: {
        Row: {
          created_at: string
          experiment_id: string | null
          host_id: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
        }
        Insert: {
          created_at?: string
          experiment_id?: string | null
          host_id: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
        }
        Update: {
          created_at?: string
          experiment_id?: string | null
          host_id?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_rooms_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_experiments: {
        Row: {
          components: Json | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          scripts: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          components?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          scripts?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          components?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          scripts?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_comments: {
        Row: {
          content: string
          created_at: string | null
          experiment_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          experiment_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          experiment_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_comments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "custom_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_likes: {
        Row: {
          created_at: string | null
          experiment_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experiment_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          experiment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_likes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "custom_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_requests: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiments: {
        Row: {
          category: Database["public"]["Enums"]["experiment_category"]
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          simulation_type: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["experiment_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          simulation_type?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["experiment_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          simulation_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorite_channels: {
        Row: {
          channel_id: string
          channel_name: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          channel_name: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          channel_name?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          completed_at: string
          id: string
          passed: boolean | null
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          passed?: boolean | null
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          passing_score: number | null
          questions: Json
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          passing_score?: number | null
          questions?: Json
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          passing_score?: number | null
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      room_participants: {
        Row: {
          cursor_x: number | null
          cursor_y: number | null
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          cursor_x?: number | null
          cursor_y?: number | null
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          cursor_x?: number | null
          cursor_y?: number | null
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "collaboration_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          cinematic_video_enabled: boolean
          color_blind_mode: boolean | null
          community_updates_notifications: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          high_contrast: boolean | null
          id: string
          new_experiments_notifications: boolean | null
          parallax_enabled: boolean
          reduce_motion: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cinematic_video_enabled?: boolean
          color_blind_mode?: boolean | null
          community_updates_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          high_contrast?: boolean | null
          id?: string
          new_experiments_notifications?: boolean | null
          parallax_enabled?: boolean
          reduce_motion?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cinematic_video_enabled?: boolean
          color_blind_mode?: boolean | null
          community_updates_notifications?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          high_contrast?: boolean | null
          id?: string
          new_experiments_notifications?: boolean | null
          parallax_enabled?: boolean
          reduce_motion?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          experiment_id: string
          id: string
          last_accessed_at: string | null
          score: number | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          experiment_id: string
          id?: string
          last_accessed_at?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          experiment_id?: string
          id?: string
          last_accessed_at?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge_secure: { Args: { _badge_name: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      update_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      experiment_category: "physics" | "chemistry" | "biology" | "earth_science"
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
      app_role: ["admin", "moderator", "user"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      experiment_category: ["physics", "chemistry", "biology", "earth_science"],
    },
  },
} as const
