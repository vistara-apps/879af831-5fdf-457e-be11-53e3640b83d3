import axios from 'axios';
import { NetworkType, Message, Contact } from '../types';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_BASE_URL = process.env.NEYNAR_BASE_URL || 'https://api.neynar.com/v2';

interface NeynarCast {
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number;
  } | null;
  author: {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  };
  text: string;
  timestamp: string;
  embeds: any[];
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: any[];
    recasts: any[];
  };
  replies: {
    count: number;
  };
  mentioned_profiles: any[];
}

interface NeynarUser {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
}

class FarcasterService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY is required');
    }
    this.apiKey = NEYNAR_API_KEY;
    this.baseUrl = NEYNAR_BASE_URL;
  }

  private getHeaders() {
    return {
      'accept': 'application/json',
      'api_key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async getUserCasts(fid: number, limit: number = 25): Promise<Message[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/farcaster/casts`,
        {
          headers: this.getHeaders(),
          params: {
            fid,
            limit
          }
        }
      );

      return response.data.casts.map((cast: NeynarCast) => ({
        messageId: cast.hash,
        network: 'farcaster' as NetworkType,
        sender: cast.author.username,
        content: cast.text,
        timestamp: new Date(cast.timestamp),
        threadId: cast.thread_hash,
        isRead: false,
        type: 'incoming' as const
      }));
    } catch (error) {
      console.error('Error fetching user casts:', error);
      throw new Error('Failed to fetch Farcaster casts');
    }
  }

  async getFeedCasts(fid: number, limit: number = 25): Promise<Message[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/farcaster/feed`,
        {
          headers: this.getHeaders(),
          params: {
            fid,
            limit,
            with_recasts: true
          }
        }
      );

      return response.data.casts.map((cast: NeynarCast) => ({
        messageId: cast.hash,
        network: 'farcaster' as NetworkType,
        sender: cast.author.username,
        content: cast.text,
        timestamp: new Date(cast.timestamp),
        threadId: cast.thread_hash,
        isRead: false,
        type: 'incoming' as const
      }));
    } catch (error) {
      console.error('Error fetching feed casts:', error);
      throw new Error('Failed to fetch Farcaster feed');
    }
  }

  async searchUsers(query: string, limit: number = 10): Promise<Contact[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/farcaster/user/search`,
        {
          headers: this.getHeaders(),
          params: {
            q: query,
            limit
          }
        }
      );

      return response.data.result.users.map((user: NeynarUser) => ({
        contactId: user.fid.toString(),
        userId: 'current_user', // This should be the current user's ID
        network: 'farcaster' as NetworkType,
        profileUrl: `https://warpcast.com/${user.username}`,
        displayName: user.display_name || user.username,
        avatar: user.pfp_url,
        bio: user.profile?.bio?.text || '',
        followers: user.follower_count
      }));
    } catch (error) {
      console.error('Error searching Farcaster users:', error);
      throw new Error('Failed to search Farcaster users');
    }
  }

  async getUserByUsername(username: string): Promise<Contact | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/farcaster/user/by_username`,
        {
          headers: this.getHeaders(),
          params: {
            username
          }
        }
      );

      const user = response.data.user;
      return {
        contactId: user.fid.toString(),
        userId: 'current_user',
        network: 'farcaster' as NetworkType,
        profileUrl: `https://warpcast.com/${user.username}`,
        displayName: user.display_name || user.username,
        avatar: user.pfp_url,
        bio: user.profile?.bio?.text || '',
        followers: user.follower_count
      };
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async postCast(text: string, parentHash?: string): Promise<boolean> {
    try {
      const payload: any = {
        signer_uuid: process.env.NEYNAR_SIGNER_UUID,
        text
      };

      if (parentHash) {
        payload.parent = parentHash;
      }

      await axios.post(
        `${this.baseUrl}/farcaster/cast`,
        payload,
        {
          headers: this.getHeaders()
        }
      );

      return true;
    } catch (error) {
      console.error('Error posting cast:', error);
      return false;
    }
  }

  async getCastsByHash(hashes: string[]): Promise<Message[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/farcaster/casts`,
        {
          headers: this.getHeaders(),
          params: {
            casts: hashes.join(',')
          }
        }
      );

      return response.data.result.casts.map((cast: NeynarCast) => ({
        messageId: cast.hash,
        network: 'farcaster' as NetworkType,
        sender: cast.author.username,
        content: cast.text,
        timestamp: new Date(cast.timestamp),
        threadId: cast.thread_hash,
        isRead: false,
        type: 'incoming' as const
      }));
    } catch (error) {
      console.error('Error fetching casts by hash:', error);
      throw new Error('Failed to fetch casts');
    }
  }
}

export const farcasterService = new FarcasterService();
