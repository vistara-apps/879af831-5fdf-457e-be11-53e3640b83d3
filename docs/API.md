# NexusFlow API Documentation

This document provides comprehensive documentation for the NexusFlow API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

NexusFlow uses wallet-based authentication. Users authenticate by connecting their wallet through OnchainKit.

### Headers

```
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/wallet

Authenticate or register a user with their wallet.

**Request Body:**
```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "displayName": "John Doe",
  "signature": "optional_signature",
  "message": "optional_message"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "displayName": "John Doe",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "connectedNetworks": ["farcaster"],
    "settings": {
      "notifications": true,
      "autoSync": true,
      "theme": "dark"
    }
  }
}
```

#### GET /auth/wallet

Get user information by wallet address.

**Query Parameters:**
- `walletAddress` (required): The user's wallet address

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "displayName": "John Doe",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "connectedNetworks": ["farcaster"],
    "settings": {
      "notifications": true,
      "autoSync": true,
      "theme": "dark"
    }
  }
}
```

### Messages

#### GET /messages

Retrieve messages for a user.

**Query Parameters:**
- `userId` (required): User's unique identifier
- `network` (optional): Filter by specific network
- `limit` (optional): Number of messages to return (1-100, default: 25)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "messageId": "message_hash",
      "network": "farcaster",
      "sender": "username",
      "content": "Message content",
      "timestamp": "2024-01-01T12:00:00Z",
      "threadId": "thread_hash",
      "isRead": false,
      "type": "incoming"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 25,
    "hasMore": true
  }
}
```

#### POST /messages

Sync messages from connected networks.

**Request Body:**
```json
{
  "userId": "uuid",
  "networks": ["farcaster", "twitter"] // optional
}
```

**Response:**
```json
{
  "success": true,
  "syncResults": [
    {
      "network": "farcaster",
      "success": true,
      "messageCount": 15
    },
    {
      "network": "twitter",
      "success": false,
      "error": "API rate limit exceeded"
    }
  ]
}
```

#### PATCH /messages

Mark messages as read/unread.

**Request Body:**
```json
{
  "messageIds": ["message_id_1", "message_id_2"],
  "isRead": true
}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 2
}
```

### Contacts

#### POST /contacts/search

Search for contacts across networks using AI-powered discovery.

**Request Body:**
```json
{
  "userId": "uuid",
  "query": "web3 developers",
  "networks": ["farcaster", "twitter"], // optional
  "useAI": true, // optional, default: true
  "limit": 20 // optional, default: 20, max: 50
}
```

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "contactId": "contact_id",
      "userId": "uuid",
      "network": "farcaster",
      "profileUrl": "https://warpcast.com/username",
      "displayName": "Developer Name",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Web3 developer building on Base",
      "followers": 1500
    }
  ],
  "metadata": {
    "totalFound": 45,
    "aiRanked": true,
    "confidence": 0.85,
    "suggestions": ["blockchain developers", "DeFi builders"],
    "networksSearched": ["farcaster", "twitter"]
  }
}
```

#### GET /contacts/search

Get AI-generated search suggestions for contact discovery.

**Query Parameters:**
- `userId` (required): User's unique identifier

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "web3 developers",
    "blockchain enthusiasts",
    "crypto traders",
    "DeFi builders",
    "NFT creators",
    "Base ecosystem"
  ]
}
```

### Networks

#### GET /networks

Get supported networks and their status.

**Response:**
```json
{
  "success": true,
  "networks": [
    {
      "type": "farcaster",
      "name": "Farcaster",
      "description": "Decentralized social network",
      "status": "active",
      "features": ["messages", "contacts", "posting"]
    },
    {
      "type": "twitter",
      "name": "Twitter/X",
      "description": "Social media platform",
      "status": "coming_soon",
      "features": ["messages", "contacts"]
    }
  ]
}
```

#### POST /networks/connect

Connect a new network for the user.

**Request Body:**
```json
{
  "userId": "uuid",
  "networkType": "farcaster",
  "credentials": {
    "apiToken": "encrypted_token",
    "fid": "12345" // network-specific data
  }
}
```

**Response:**
```json
{
  "success": true,
  "connection": {
    "connectionId": "uuid",
    "networkType": "farcaster",
    "isActive": true,
    "lastSync": "2024-01-01T12:00:00Z"
  }
}
```

#### DELETE /networks/{connectionId}

Disconnect a network.

**Response:**
```json
{
  "success": true,
  "message": "Network disconnected successfully"
}
```

### Cross-Network Bridging

#### POST /bridge/forward

Forward a message from one network to another.

**Request Body:**
```json
{
  "userId": "uuid",
  "sourceMessageId": "message_id",
  "sourceNetwork": "farcaster",
  "targetNetwork": "telegram",
  "targetChannel": "channel_id", // optional
  "customMessage": "Custom forwarding message" // optional
}
```

**Response:**
```json
{
  "success": true,
  "forwardedMessage": {
    "messageId": "new_message_id",
    "network": "telegram",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### GET /bridge/rules

Get user's message forwarding rules.

**Query Parameters:**
- `userId` (required): User's unique identifier

**Response:**
```json
{
  "success": true,
  "rules": [
    {
      "ruleId": "uuid",
      "sourceNetwork": "farcaster",
      "targetNetwork": "telegram",
      "conditions": {
        "keywords": ["urgent", "important"],
        "senders": ["specific_user"]
      },
      "isActive": true
    }
  ]
}
```

#### POST /bridge/rules

Create a new forwarding rule.

**Request Body:**
```json
{
  "userId": "uuid",
  "sourceNetwork": "farcaster",
  "targetNetwork": "telegram",
  "conditions": {
    "keywords": ["urgent", "important"],
    "senders": ["specific_user"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "rule": {
    "ruleId": "uuid",
    "sourceNetwork": "farcaster",
    "targetNetwork": "telegram",
    "conditions": {
      "keywords": ["urgent", "important"],
      "senders": ["specific_user"]
    },
    "isActive": true
  }
}
```

### Analytics

#### GET /analytics/stats

Get user statistics and insights.

**Query Parameters:**
- `userId` (required): User's unique identifier
- `period` (optional): Time period ('day', 'week', 'month', default: 'week')

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMessages": 1250,
    "unreadMessages": 45,
    "totalContacts": 89,
    "connectedNetworks": 3,
    "messagesByNetwork": {
      "farcaster": 800,
      "twitter": 350,
      "telegram": 100
    },
    "activityTrend": [
      { "date": "2024-01-01", "messages": 25 },
      { "date": "2024-01-02", "messages": 30 }
    ],
    "topSenders": [
      { "sender": "username1", "count": 15 },
      { "sender": "username2", "count": 12 }
    ]
  }
}
```

#### GET /analytics/sentiment

Get sentiment analysis of recent messages.

**Query Parameters:**
- `userId` (required): User's unique identifier
- `days` (optional): Number of days to analyze (default: 7, max: 30)

**Response:**
```json
{
  "success": true,
  "sentiment": {
    "overall": "positive",
    "confidence": 0.78,
    "insights": [
      "High engagement with web3 topics",
      "Positive sentiment around Base ecosystem",
      "Increased activity in DeFi discussions"
    ],
    "breakdown": {
      "positive": 0.65,
      "neutral": 0.25,
      "negative": 0.10
    }
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // optional additional error details
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 10 requests per minute per IP
- **Message sync**: 5 requests per minute per user
- **Contact search**: 20 requests per minute per user
- **General endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Webhooks

NexusFlow supports webhooks for real-time notifications:

### Webhook Events

- `message.received` - New message received
- `contact.discovered` - New contact discovered
- `network.connected` - Network successfully connected
- `network.disconnected` - Network disconnected
- `sync.completed` - Message sync completed

### Webhook Payload

```json
{
  "event": "message.received",
  "timestamp": "2024-01-01T12:00:00Z",
  "userId": "uuid",
  "data": {
    "messageId": "message_id",
    "network": "farcaster",
    "sender": "username",
    "content": "Message content"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { NexusFlowClient } from '@nexusflow/sdk';

const client = new NexusFlowClient({
  apiKey: 'your_api_key',
  baseUrl: 'http://localhost:3000/api'
});

// Authenticate user
const user = await client.auth.wallet({
  walletAddress: '0x...',
  displayName: 'John Doe'
});

// Search contacts
const contacts = await client.contacts.search({
  userId: user.userId,
  query: 'web3 developers',
  useAI: true
});

// Sync messages
const syncResult = await client.messages.sync({
  userId: user.userId,
  networks: ['farcaster']
});
```

### Python

```python
from nexusflow import NexusFlowClient

client = NexusFlowClient(
    api_key='your_api_key',
    base_url='http://localhost:3000/api'
)

# Authenticate user
user = client.auth.wallet(
    wallet_address='0x...',
    display_name='John Doe'
)

# Search contacts
contacts = client.contacts.search(
    user_id=user['userId'],
    query='web3 developers',
    use_ai=True
)
```

## Testing

Use the provided Postman collection or test with curl:

```bash
# Authenticate user
curl -X POST http://localhost:3000/api/auth/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "displayName": "Test User"
  }'

# Search contacts
curl -X POST http://localhost:3000/api/contacts/search \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_uuid",
    "query": "web3 developers",
    "useAI": true
  }'
```
