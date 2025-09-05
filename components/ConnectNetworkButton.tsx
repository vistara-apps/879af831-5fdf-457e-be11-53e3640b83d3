'use client';

import { NetworkType } from '@/lib/types';
import { SUPPORTED_NETWORKS } from '@/lib/constants';
import { Plus, Check } from 'lucide-react';

interface ConnectNetworkButtonProps {
  network: NetworkType;
  isConnected?: boolean;
  onConnect: (network: NetworkType) => void;
}

export function ConnectNetworkButton({ 
  network, 
  isConnected = false, 
  onConnect 
}: ConnectNetworkButtonProps) {
  const networkInfo = SUPPORTED_NETWORKS[network];

  return (
    <button
      onClick={() => onConnect(network)}
      disabled={isConnected}
      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 ${
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 cursor-default'
          : 'bg-surface/50 border-gray-700/50 text-white hover:bg-surface hover:border-gray-600/50'
      }`}
    >
      <div className={`network-icon ${network}`}>
        {networkInfo.icon}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium">{networkInfo.name}</h3>
        <p className="text-sm text-text-secondary">{networkInfo.description}</p>
      </div>
      <div className="flex items-center">
        {isConnected ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <Plus className="w-5 h-5 text-text-secondary" />
        )}
      </div>
    </button>
  );
}
