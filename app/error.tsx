'use client';

import { Zap, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400/20 to-orange-400/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong!
        </h2>
        
        <p className="text-text-secondary mb-6">
          We encountered an error while loading NexusFlow. This might be a temporary issue.
        </p>
        
        <button
          onClick={reset}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        {error.digest && (
          <p className="text-xs text-text-secondary mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
