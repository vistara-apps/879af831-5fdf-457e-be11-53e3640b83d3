# NexusFlow - Unified Communication Dashboard

A Base Mini App that unifies digital conversations across 150+ fragmented networks, helping users manage and bridge communications efficiently.

## Features

### 🚀 Core Features
- **Unified Communication Dashboard**: Single interface for managing messages from multiple networks
- **Intelligent Contact Discovery**: AI-powered search to find connections across networks
- **Cross-Network Bridging**: Forward messages between different platforms
- **Real-time Network Status**: Monitor connection status across all integrated networks

### 🌐 Supported Networks (MVP)
- Farcaster (via Neynar API)
- Twitter/X
- Telegram
- Discord (coming soon)
- Lens Protocol (coming soon)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (via OnchainKit & MiniKit)
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Wallet-based auth via OnchainKit
- **AI**: OpenAI API for contact discovery
- **Backend**: Supabase (planned)

## Getting Started

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd nexusflow
npm install
```

2. **Set up environment variables**:
```bash
cp .env.local.example .env.local
# Add your API keys
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open in browser**:
Navigate to `http://localhost:3000`

## Environment Variables

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEYNAR_API_KEY=your_neynar_api_key
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

### Data Model
- **User**: Core user profile with connected networks
- **NetworkConnection**: OAuth tokens and sync status for each network
- **Message**: Unified message format across all networks
- **Contact**: Discovered contacts with network presence

### Key Components
- **AppShell**: Main layout with navigation and network status
- **MessageCard**: Unified message display with network-specific styling
- **ContactCard**: Contact discovery results with connection actions
- **SearchInput**: AI-powered search interface
- **NetworkStatus**: Real-time connection monitoring

## Design System

### Colors
- Background: `hsl(218 16% 16%)`
- Surface: `hsl(218 16% 22%)`
- Primary: `hsl(220 88% 52%)`
- Accent: `hsl(130 60% 50%)`
- Text Secondary: `hsl(218 16% 60%)`

### Components
- Glass morphism cards with backdrop blur
- Network-specific color coding
- Responsive grid layouts
- Smooth animations and transitions

## Roadmap

### Phase 1 (MVP) ✅
- [x] Basic UI and navigation
- [x] Wallet connection via OnchainKit
- [x] Mock data for messages and contacts
- [x] Network status monitoring
- [x] AI search interface

### Phase 2 (Integration)
- [ ] Farcaster API integration
- [ ] Twitter API integration
- [ ] Telegram Bot API
- [ ] Real-time message syncing
- [ ] Cross-network message forwarding

### Phase 3 (Advanced Features)
- [ ] AI-powered contact recommendations
- [ ] Message analytics and insights
- [ ] Custom notification rules
- [ ] Bulk message operations
- [ ] Advanced search filters

### Phase 4 (Scale)
- [ ] 50+ additional networks
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile app companion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the team.

---

Built with ❤️ for the Base ecosystem
