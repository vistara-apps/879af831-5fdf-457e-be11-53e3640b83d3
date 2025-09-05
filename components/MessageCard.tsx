'use client';

import { Message } from '@/lib/types';
import { SUPPORTED_NETWORKS } from '@/lib/constants';
import { formatTimeAgo, truncateText } from '@/lib/utils';
import { ExternalLink, Reply, Forward } from 'lucide-react';

interface MessageCardProps {
  message: Message;
  variant?: 'incoming' | 'outgoing' | 'native';
}

export function MessageCard({ message, variant = 'incoming' }: MessageCardProps) {
  const network = SUPPORTED_NETWORKS[message.network];
  
  return (
    <div className={`message-card ${variant}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`network-icon ${message.network}`}>
            {network.icon}
          </div>
          <div>
            <p className="font-medium text-white">{message.sender}</p>
            <p className="text-xs text-text-secondary">
              {network.name} • {formatTimeAgo(message.timestamp)}
            </p>
          </div>
        </div>
        
        {!message.isRead && (
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
        )}
      </div>

      <p className="text-gray-300 mb-4 leading-relaxed">
        {truncateText(message.content, 200)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 text-text-secondary hover:text-cyan-400 transition-colors duration-200">
            <Reply className="w-4 h-4" />
            <span className="text-sm">Reply</span>
          </button>
          <button className="flex items-center space-x-1 text-text-secondary hover:text-emerald-400 transition-colors duration-200">
            <Forward className="w-4 h-4" />
            <span className="text-sm">Forward</span>
          </button>
        </div>
        
        <button className="flex items-center space-x-1 text-text-secondary hover:text-white transition-colors duration-200">
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">Open</span>
        </button>
      </div>
    </div>
  );
}
