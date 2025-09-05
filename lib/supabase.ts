import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types based on our data model
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          display_name: string;
          wallet_address: string;
          connected_networks: string[];
          settings: {
            notifications: boolean;
            autoSync: boolean;
            theme: 'dark' | 'light';
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          wallet_address: string;
          connected_networks?: string[];
          settings?: {
            notifications?: boolean;
            autoSync?: boolean;
            theme?: 'dark' | 'light';
          };
        };
        Update: {
          display_name?: string;
          connected_networks?: string[];
          settings?: {
            notifications?: boolean;
            autoSync?: boolean;
            theme?: 'dark' | 'light';
          };
        };
      };
      network_connections: {
        Row: {
          connection_id: string;
          user_id: string;
          network_type: string;
          api_token: string;
          last_sync: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          connection_id: string;
          user_id: string;
          network_type: string;
          api_token: string;
          last_sync?: string;
          is_active?: boolean;
        };
        Update: {
          api_token?: string;
          last_sync?: string;
          is_active?: boolean;
        };
      };
      messages: {
        Row: {
          message_id: string;
          user_id: string;
          network: string;
          sender: string;
          content: string;
          timestamp: string;
          thread_id: string | null;
          is_read: boolean;
          type: 'incoming' | 'outgoing';
          created_at: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
          network: string;
          sender: string;
          content: string;
          timestamp: string;
          thread_id?: string | null;
          is_read?: boolean;
          type: 'incoming' | 'outgoing';
        };
        Update: {
          is_read?: boolean;
          content?: string;
        };
      };
      contacts: {
        Row: {
          contact_id: string;
          user_id: string;
          network: string;
          profile_url: string;
          display_name: string;
          avatar: string | null;
          bio: string | null;
          followers: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          contact_id: string;
          user_id: string;
          network: string;
          profile_url: string;
          display_name: string;
          avatar?: string | null;
          bio?: string | null;
          followers?: number | null;
        };
        Update: {
          display_name?: string;
          avatar?: string | null;
          bio?: string | null;
          followers?: number | null;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
