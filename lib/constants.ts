import { NetworkType } from './types';

export const SUPPORTED_NETWORKS: Record<NetworkType, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  farcaster: {
    name: 'Farcaster',
    icon: 'FC',
    color: 'purple',
    description: 'Decentralized social network'
  },
  telegram: {
    name: 'Telegram',
    icon: 'TG',
    color: 'blue',
    description: 'Secure messaging platform'
  },
  twitter: {
    name: 'Twitter/X',
    icon: 'X',
    color: 'cyan',
    description: 'Social media platform'
  },
  discord: {
    name: 'Discord',
    icon: 'DC',
    color: 'indigo',
    description: 'Community chat platform'
  },
  lens: {
    name: 'Lens Protocol',
    icon: 'LP',
    color: 'green',
    description: 'Web3 social graph'
  }
};

export const MOCK_MESSAGES = [
  {
    messageId: '1',
    network: 'farcaster' as NetworkType,
    sender: 'vitalik.eth',
    content: 'Excited about the future of decentralized social networks! The composability is incredible.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    type: 'incoming' as const
  },
  {
    messageId: '2',
    network: 'telegram' as NetworkType,
    sender: 'Base Builders',
    content: 'New grant program announced! Applications open for innovative Base projects.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
    type: 'incoming' as const
  },
  {
    messageId: '3',
    network: 'twitter' as NetworkType,
    sender: 'coinbase',
    content: 'Building the future of finance, one block at a time 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: false,
    type: 'incoming' as const
  }
];

export const MOCK_CONTACTS = [
  {
    contactId: '1',
    userId: 'user1',
    network: 'farcaster' as NetworkType,
    profileUrl: 'https://warpcast.com/vitalik.eth',
    displayName: 'Vitalik Buterin',
    avatar: '/api/placeholder/40/40',
    bio: 'Ethereum co-founder',
    followers: 500000
  },
  {
    contactId: '2',
    userId: 'user1',
    network: 'twitter' as NetworkType,
    profileUrl: 'https://twitter.com/coinbase',
    displayName: 'Coinbase',
    avatar: '/api/placeholder/40/40',
    bio: 'Cryptocurrency exchange',
    followers: 2000000
  }
];
