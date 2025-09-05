// Core data model types
export interface User {
  userId: string;
  displayName: string;
  connectedNetworks: string[];
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  autoSync: boolean;
  theme: 'dark' | 'light';
}

export interface NetworkConnection {
  connectionId: string;
  userId: string;
  networkType: NetworkType;
  apiToken: string;
  lastSync: Date;
  isActive: boolean;
}

export interface Message {
  messageId: string;
  network: NetworkType;
  sender: string;
  content: string;
  timestamp: Date;
  threadId?: string;
  isRead: boolean;
  type: 'incoming' | 'outgoing';
}

export interface Contact {
  contactId: string;
  userId: string;
  network: NetworkType;
  profileUrl: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  followers?: number;
}

export type NetworkType = 'farcaster' | 'telegram' | 'twitter' | 'discord' | 'lens';

export interface NetworkStats {
  network: NetworkType;
  messageCount: number;
  unreadCount: number;
  lastActivity: Date;
  isConnected: boolean;
}

export interface AISearchQuery {
  query: string;
  networks: NetworkType[];
  filters?: {
    minFollowers?: number;
    location?: string;
    interests?: string[];
  };
}

export interface AISearchResult {
  contacts: Contact[];
  confidence: number;
  suggestions: string[];
}
