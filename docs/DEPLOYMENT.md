# NexusFlow Deployment Guide

This guide covers deploying NexusFlow to production environments.

## Prerequisites

- Node.js 18+ 
- Supabase account
- Neynar API key (for Farcaster integration)
- OpenAI API key (for AI features)
- OnchainKit API key (for Base integration)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd nexusflow
npm install
```

### 2. Environment Variables

Copy the environment template and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
NEXT_PUBLIC_CHAIN_ID=8453

# Farcaster Integration (Neynar API)
NEYNAR_API_KEY=your_neynar_api_key_here
NEYNAR_BASE_URL=https://api.neynar.com/v2

# OpenAI API for AI-powered contact discovery
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.com
```

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Database Schema

Execute the schema file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase/schema.sql
```

Or use the Supabase CLI:

```bash
npx supabase db reset
```

### 3. Configure Row Level Security

The schema includes RLS policies, but verify they're enabled:

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## API Keys Setup

### 1. OnchainKit API Key

1. Visit [OnchainKit Dashboard](https://onchainkit.xyz)
2. Create a new project
3. Copy your API key

### 2. Neynar API Key

1. Visit [Neynar Dashboard](https://neynar.com)
2. Create an account and project
3. Copy your API key

### 3. OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Ensure you have GPT-4 access

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add all environment variables from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t nexusflow .
   docker run -p 3000:3000 nexusflow
   ```

### Option 4: Self-Hosted (PM2)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'nexusflow',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/nexusflow',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Deploy**
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Post-Deployment Configuration

### 1. Domain Setup

Configure your domain to point to your deployment:

- **Vercel**: Add custom domain in dashboard
- **Netlify**: Configure domain in site settings
- **Self-hosted**: Configure reverse proxy (nginx/Apache)

### 2. SSL Certificate

Ensure HTTPS is enabled:
- Vercel/Netlify: Automatic SSL
- Self-hosted: Use Let's Encrypt or Cloudflare

### 3. Environment Variables Verification

Test that all environment variables are properly set:

```bash
curl https://your-domain.com/api/health
```

### 4. Database Migrations

If you have schema updates, run migrations:

```bash
# Using Supabase CLI
npx supabase db push

# Or manually in Supabase dashboard
```

## Monitoring and Maintenance

### 1. Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### 2. Logging

Configure structured logging:

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'production' && {
    transport: {
      target: 'pino-pretty'
    }
  })
});
```

### 3. Error Tracking

Add error tracking (Sentry example):

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 4. Performance Monitoring

Monitor key metrics:
- API response times
- Database query performance
- Memory usage
- Error rates

### 5. Backup Strategy

**Database Backups:**
- Supabase provides automatic backups
- Consider additional backup strategy for critical data

**Code Backups:**
- Use Git for version control
- Tag releases for easy rollback

## Security Considerations

### 1. API Rate Limiting

Implement rate limiting:

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(request: NextRequest, limit = 100, window = 60000) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const windowStart = now - window;

  const requests = rateLimitMap.get(ip) || [];
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }

  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}
```

### 2. Input Validation

Use Zod for all API inputs:

```typescript
import { z } from 'zod';

const schema = z.object({
  userId: z.string().uuid(),
  query: z.string().min(1).max(100)
});
```

### 3. CORS Configuration

Configure CORS appropriately:

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 4. Environment Security

- Never commit `.env` files
- Use secrets management in production
- Rotate API keys regularly
- Use least-privilege access

## Scaling Considerations

### 1. Database Scaling

- Monitor Supabase usage
- Consider read replicas for heavy read workloads
- Implement connection pooling

### 2. API Scaling

- Use CDN for static assets
- Implement caching strategies
- Consider API gateway for rate limiting

### 3. Background Jobs

For heavy operations, consider background processing:

```typescript
// lib/queue.ts
import { Queue } from 'bullmq';

export const messageQueue = new Queue('message-sync', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});
```

## Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Verify environment variables are set
   - Check API key permissions
   - Ensure correct API endpoints

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure database schema is up to date

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

4. **Performance Issues**
   - Monitor API response times
   - Check database query performance
   - Review network latency

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Support

For deployment issues:
1. Check the GitHub issues
2. Review deployment logs
3. Contact support with specific error messages

## Maintenance Schedule

### Daily
- Monitor error rates
- Check API response times
- Review security alerts

### Weekly
- Review performance metrics
- Update dependencies (security patches)
- Backup verification

### Monthly
- Full security audit
- Performance optimization review
- Dependency updates
- Database maintenance

---

## Quick Start Checklist

- [ ] Environment variables configured
- [ ] Supabase project created and schema deployed
- [ ] API keys obtained and tested
- [ ] Application deployed to chosen platform
- [ ] Domain configured with SSL
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup strategy implemented

Your NexusFlow deployment should now be ready for production use!
