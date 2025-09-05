'use client';

import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { NetworkStatus } from './NetworkStatus';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Network Visualization */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 blur-xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 blur-2xl animate-float" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto px-4 py-6 max-w-screen-lg">
          <NetworkStatus />
          {children}
        </main>
      </div>
    </div>
  );
}
