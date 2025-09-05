'use client';

import { Contact } from '@/lib/types';
import { SUPPORTED_NETWORKS } from '@/lib/constants';
import { ExternalLink, UserPlus, MessageCircle } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const network = SUPPORTED_NETWORKS[contact.network];
  
  return (
    <div className="glass-card p-4 hover:bg-surface/90 transition-all duration-200">
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 flex items-center justify-center text-lg font-bold">
          {contact.displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{contact.displayName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`network-icon ${contact.network} !w-5 !h-5 !text-xs`}>
              {network.icon}
            </div>
            <span className="text-sm text-text-secondary">{network.name}</span>
          </div>
        </div>
      </div>

      {contact.bio && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {contact.bio}
        </p>
      )}

      {contact.followers && (
        <p className="text-xs text-text-secondary mb-4">
          {contact.followers.toLocaleString()} followers
        </p>
      )}

      <div className="flex items-center space-x-2">
        <button className="flex-1 flex items-center justify-center space-x-1 bg-primary/20 text-primary border border-primary/30 py-2 px-3 rounded-lg text-sm hover:bg-primary/30 transition-colors duration-200">
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>
        <button className="flex items-center justify-center space-x-1 bg-surface/50 text-text-secondary border border-gray-700/50 py-2 px-3 rounded-lg text-sm hover:bg-surface transition-colors duration-200">
          <UserPlus className="w-4 h-4" />
          <span>Connect</span>
        </button>
        <button className="flex items-center justify-center p-2 text-text-secondary hover:text-white transition-colors duration-200">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
