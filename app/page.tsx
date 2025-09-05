'use client';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { AppShell } from '@/components/AppShell';
import { MessageCard } from '@/components/MessageCard';
import { ContactCard } from '@/components/ContactCard';
import { SearchInput } from '@/components/SearchInput';
import { ConnectNetworkButton } from '@/components/ConnectNetworkButton';
import { MOCK_MESSAGES, MOCK_CONTACTS, SUPPORTED_NETWORKS } from '@/lib/constants';
import { Message, Contact, NetworkType } from '@/lib/types';
import { MessageSquare, Users, Network, TrendingUp, Zap } from 'lucide-react';

export default function HomePage() {
  const { setFrameReady } = useMiniKit();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'discover' | 'networks'>('dashboard');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    // Simulate AI search delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI search results
    const mockResults = MOCK_CONTACTS.filter(contact => 
      contact.displayName.toLowerCase().includes(query.toLowerCase()) ||
      contact.bio?.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleConnectNetwork = (network: NetworkType) => {
    console.log(`Connecting to ${network}...`);
    // In real app, this would trigger OAuth flow
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const connectedNetworks = 2; // Mock data
  const totalNetworks = Object.keys(SUPPORTED_NETWORKS).length;

  return (
    <AppShell>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{messages.length}</p>
              <p className="text-sm text-text-secondary">Messages</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{contacts.length}</p>
              <p className="text-sm text-text-secondary">Contacts</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Network className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{connectedNetworks}/{totalNetworks}</p>
              <p className="text-sm text-text-secondary">Networks</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
              <p className="text-sm text-text-secondary">Unread</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-1 mb-6">
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: MessageSquare },
            { id: 'discover', label: 'Discover', icon: Users },
            { id: 'networks', label: 'Networks', icon: Network }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-text-secondary hover:text-white hover:bg-surface/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Recent Messages</h2>
            <button className="btn-secondary">Mark All Read</button>
          </div>
          
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard key={message.messageId} message={message} />
            ))}
          </div>

          {messages.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Zap className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
              <p className="text-text-secondary">Connect your networks to start seeing messages here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Discover Contacts</h2>
            <p className="text-text-secondary">Use AI to find and connect with people across your networks.</p>
          </div>

          <SearchInput onSearch={handleSearch} />

          {isSearching && (
            <div className="glass-card p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">AI is searching across your networks...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(searchResults.length > 0 ? searchResults : contacts).map((contact) => (
              <ContactCard key={contact.contactId} contact={contact} />
            ))}
          </div>

          {!isSearching && searchResults.length === 0 && contacts.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No contacts found</h3>
              <p className="text-text-secondary">Try searching for people or connect more networks.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Networks</h2>
            <p className="text-text-secondary">Connect your communication networks to unify your conversations.</p>
          </div>

          <div className="space-y-4">
            {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
              <ConnectNetworkButton
                key={key}
                network={key as NetworkType}
                isConnected={key === 'farcaster' || key === 'twitter'} // Mock connected state
                onConnect={handleConnectNetwork}
              />
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-medium text-white mb-3">Coming Soon</h3>
            <p className="text-text-secondary mb-4">
              We're working on integrating 150+ communication networks. Stay tuned for updates!
            </p>
            <div className="flex flex-wrap gap-2">
              {['Discord', 'Slack', 'WhatsApp', 'LinkedIn', 'Reddit', 'Signal'].map((network) => (
                <span
                  key={network}
                  className="px-3 py-1 bg-surface/50 text-text-secondary rounded-full text-sm border border-gray-700/50"
                >
                  {network}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
