'use client';

import { SUPPORTED_NETWORKS } from '@/lib/constants';
import { NetworkType } from '@/lib/types';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  // Mock network status - in real app, this would come from context/state
  const networkStatus: Record<NetworkType, boolean> = {
    farcaster: true,
    telegram: false,
    twitter: true,
    discord: false,
    lens: false
  };

  const connectedCount = Object.values(networkStatus).filter(Boolean).length;
  const totalNetworks = Object.keys(networkStatus).length;

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">Network Status</span>
          </div>
          <span className="text-sm text-text-secondary">
            {connectedCount}/{totalNetworks} connected
          </span>
        </div>
        <button className="btn-secondary text-sm py-2 px-4">
          Connect More
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => {
          const isConnected = networkStatus[key as NetworkType];
          return (
            <div
              key={key}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
              }`}
            >
              <div className={`network-icon ${key}`}>
                {network.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{network.name}</p>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span className="text-xs">
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
