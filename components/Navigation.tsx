'use client';

import { useState } from 'react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import { Menu, X, Zap } from 'lucide-react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="glass-card mx-4 mt-4 p-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="pulse-ring" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              NexusFlow
            </h1>
            <p className="text-xs text-text-secondary">Unified Communications</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-text-secondary hover:text-white transition-colors duration-200">
            Dashboard
          </button>
          <button className="text-text-secondary hover:text-white transition-colors duration-200">
            Discover
          </button>
          <button className="text-text-secondary hover:text-white transition-colors duration-200">
            Networks
          </button>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          <Wallet>
            <ConnectWallet className="btn-primary">
              <Name />
            </ConnectWallet>
          </Wallet>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface/50 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex flex-col space-y-3">
            <button className="text-left text-text-secondary hover:text-white transition-colors duration-200">
              Dashboard
            </button>
            <button className="text-left text-text-secondary hover:text-white transition-colors duration-200">
              Discover
            </button>
            <button className="text-left text-text-secondary hover:text-white transition-colors duration-200">
              Networks
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
