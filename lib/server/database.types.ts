export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ai_usage_daily: {
        Row: {
          request_count: number;
          usage_date: string;
          user_id: string;
        };
        Insert: {
          request_count?: number;
          usage_date: string;
          user_id: string;
        };
        Update: {
          request_count?: number;
          usage_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          ai_advice: string | null;
          coffee_name: string;
          coffee_url: string | null;
          coffee_weight: number;
          color: string;
          country: string | null;
          created_at: string;
          flavor_profiles: string[];
          id: string;
          likes_count: number;
          process: string | null;
          rating: number;
          reports_count: number;
          ratio: string;
          roaster_id: string;
          status: 'active' | 'hidden' | 'removed';
          taste_notes: string;
          updated_at: string;
          user_id: string;
          varietal: string | null;
          water_weight: number;
          brew_method: string;
        };
        Insert: {
          ai_advice?: string | null;
          coffee_name: string;
          coffee_url?: string | null;
          coffee_weight: number;
          color: string;
          country?: string | null;
          created_at?: string;
          flavor_profiles?: string[];
          id?: string;
          likes_count?: number;
          process?: string | null;
          rating: number;
          reports_count?: number;
          ratio: string;
          roaster_id: string;
          status?: 'active' | 'hidden' | 'removed';
          taste_notes: string;
          updated_at?: string;
          user_id: string;
          varietal?: string | null;
          water_weight: number;
          brew_method: string;
        };
        Update: {
          ai_advice?: string | null;
          coffee_name?: string;
          coffee_url?: string | null;
          coffee_weight?: number;
          color?: string;
          country?: string | null;
          created_at?: string;
          flavor_profiles?: string[];
          id?: string;
          likes_count?: number;
          process?: string | null;
          rating?: number;
          reports_count?: number;
          ratio?: string;
          roaster_id?: string;
          status?: 'active' | 'hidden' | 'removed';
          taste_notes?: string;
          updated_at?: string;
          user_id?: string;
          varietal?: string | null;
          water_weight?: number;
          brew_method?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar: string;
          bio: string | null;
          created_at: string;
          display_name: string;
          handle: string;
          id: string;
          role: 'user' | 'admin';
          updated_at: string;
        };
        Insert: {
          avatar: string;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          handle: string;
          id: string;
          role?: 'user' | 'admin';
          updated_at?: string;
        };
        Update: {
          avatar?: string;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          handle?: string;
          id?: string;
          role?: 'user' | 'admin';
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limit_buckets: {
        Row: {
          identifier: string;
          request_count: number;
          route_key: string;
          window_start: string;
        };
        Insert: {
          identifier: string;
          request_count?: number;
          route_key: string;
          window_start: string;
        };
        Update: {
          identifier?: string;
          request_count?: number;
          route_key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reporter_id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: 'open' | 'resolved' | 'dismissed';
          target_id: string;
          target_type: 'post' | 'roaster' | 'profile';
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reporter_id: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: 'open' | 'resolved' | 'dismissed';
          target_id: string;
          target_type: 'post' | 'roaster' | 'profile';
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: 'open' | 'resolved' | 'dismissed';
          target_id?: string;
          target_type?: 'post' | 'roaster' | 'profile';
        };
        Relationships: [];
      };
      roasters: {
        Row: {
          created_at: string;
          created_by: string;
          equipment: string;
          ethos: string;
          id: string;
          location: string;
          logo: string;
          name: string;
          status: 'active' | 'hidden' | 'removed';
          updated_at: string;
          website: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          equipment: string;
          ethos: string;
          id?: string;
          location: string;
          logo: string;
          name: string;
          status?: 'active' | 'hidden' | 'removed';
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          equipment?: string;
          ethos?: string;
          id?: string;
          location?: string;
          logo?: string;
          name?: string;
          status?: 'active' | 'hidden' | 'removed';
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      consume_ai_quota: {
        Args: { p_limit: number };
        Returns: {
          allowed: boolean;
          remaining: number;
          request_count: number;
        }[];
      };
      consume_rate_limit: {
        Args: {
          p_identifier: string;
          p_limit: number;
          p_route_key: string;
          p_window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
      increment_post_reports: {
        Args: { p_post_id: string };
        Returns: undefined;
      };
      toggle_post_like: {
        Args: { p_post_id: string };
        Returns: {
          liked: boolean;
          likes_count: number;
        }[];
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

