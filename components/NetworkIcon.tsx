'use client';

import { NetworkType } from '@/lib/types';
import { SUPPORTED_NETWORKS } from '@/lib/constants';

interface NetworkIconProps {
  network: NetworkType;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  isConnected?: boolean;
}

export function NetworkIcon({ 
  network, 
  size = 'medium', 
  showStatus = false,
  isConnected = false 
}: NetworkIconProps) {
  const networkInfo = SUPPORTED_NETWORKS[network];
  
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-12 h-12 text-base'
  };

  return (
    <div className="relative">
      <div className={`network-icon ${network} ${sizeClasses[size]}`}>
        {networkInfo.icon}
      </div>
      {showStatus && (
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
          isConnected ? 'bg-emerald-400' : 'bg-gray-500'
        }`} />
      )}
    </div>
  );
}
