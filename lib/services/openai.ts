import OpenAI from 'openai';
import { AISearchQuery, AISearchResult, Contact, NetworkType } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ContactDiscoveryContext {
  userProfile?: {
    interests: string[];
    networks: NetworkType[];
    recentActivity: string[];
  };
  searchHistory: string[];
  connectedContacts: Contact[];
}

class OpenAIService {
  async discoverContacts(
    query: string,
    context: ContactDiscoveryContext,
    availableContacts: Contact[]
  ): Promise<AISearchResult> {
    try {
      const systemPrompt = `You are an AI assistant specialized in helping users discover relevant contacts across social networks. 
      
Your task is to analyze a search query and recommend the most relevant contacts from the available pool based on:
1. Query relevance to contact profiles (name, bio, interests)
2. Network presence and activity
3. User's existing connections and interests
4. Semantic similarity and context

Return a JSON response with:
- contacts: Array of contact IDs ranked by relevance
- confidence: Overall confidence score (0-1)
- suggestions: Array of alternative search terms or refinements

Be intelligent about matching - consider synonyms, related concepts, and implicit connections.`;

      const userPrompt = `
Search Query: "${query}"

User Context:
- Interests: ${context.userProfile?.interests?.join(', ') || 'Not specified'}
- Connected Networks: ${context.userProfile?.networks?.join(', ') || 'Not specified'}
- Recent Activity: ${context.userProfile?.recentActivity?.join(', ') || 'Not specified'}
- Search History: ${context.searchHistory.slice(-5).join(', ') || 'None'}

Available Contacts:
${availableContacts.map(contact => `
ID: ${contact.contactId}
Name: ${contact.displayName}
Network: ${contact.network}
Bio: ${contact.bio || 'No bio'}
Followers: ${contact.followers || 0}
`).join('\n')}

Please analyze and return the most relevant contacts for this search query.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Filter and rank contacts based on AI response
      const rankedContacts = response.contacts
        ?.map((contactId: string) => availableContacts.find(c => c.contactId === contactId))
        .filter(Boolean) || [];

      return {
        contacts: rankedContacts,
        confidence: response.confidence || 0.5,
        suggestions: response.suggestions || []
      };
    } catch (error) {
      console.error('Error in AI contact discovery:', error);
      
      // Fallback to simple text matching
      const fallbackContacts = availableContacts.filter(contact =>
        contact.displayName.toLowerCase().includes(query.toLowerCase()) ||
        contact.bio?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

      return {
        contacts: fallbackContacts,
        confidence: 0.3,
        suggestions: ['Try more specific terms', 'Include network names', 'Use professional titles']
      };
    }
  }

  async generateSearchSuggestions(
    userProfile: ContactDiscoveryContext['userProfile'],
    recentSearches: string[]
  ): Promise<string[]> {
    try {
      const systemPrompt = `You are an AI assistant that generates intelligent search suggestions for finding contacts across social networks.

Based on the user's profile and recent searches, suggest 5-8 relevant search queries that would help them discover valuable connections.

Focus on:
- Professional networking opportunities
- Interest-based connections
- Industry-specific contacts
- Skill-based matching
- Geographic or community connections

Return a JSON array of search suggestion strings.`;

      const userPrompt = `
User Profile:
- Interests: ${userProfile?.interests?.join(', ') || 'Not specified'}
- Networks: ${userProfile?.networks?.join(', ') || 'Not specified'}
- Recent Activity: ${userProfile?.recentActivity?.join(', ') || 'Not specified'}

Recent Searches: ${recentSearches.join(', ') || 'None'}

Generate relevant search suggestions for this user.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.suggestions || [];
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [
        'web3 developers',
        'blockchain enthusiasts',
        'crypto traders',
        'DeFi builders',
        'NFT creators',
        'Base ecosystem'
      ];
    }
  }

  async analyzeMessageSentiment(messages: string[]): Promise<{
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    insights: string[];
  }> {
    try {
      const systemPrompt = `Analyze the sentiment and tone of social media messages. Return insights about the overall communication patterns and mood.

Return JSON with:
- overall: 'positive', 'neutral', or 'negative'
- confidence: 0-1 confidence score
- insights: Array of key observations about the messages`;

      const userPrompt = `Analyze these messages:
${messages.slice(0, 20).join('\n---\n')}`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        overall: response.overall || 'neutral',
        confidence: response.confidence || 0.5,
        insights: response.insights || []
      };
    } catch (error) {
      console.error('Error analyzing message sentiment:', error);
      return {
        overall: 'neutral',
        confidence: 0.3,
        insights: ['Unable to analyze sentiment at this time']
      };
    }
  }

  async generateMessageSummary(messages: string[], maxLength: number = 200): Promise<string> {
    try {
      const systemPrompt = `Summarize the key themes and important information from a collection of social media messages. Keep it concise and informative.`;

      const userPrompt = `Summarize these messages in ${maxLength} characters or less:
${messages.slice(0, 10).join('\n---\n')}`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: Math.floor(maxLength / 2)
      });

      return completion.choices[0].message.content?.slice(0, maxLength) || 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating message summary:', error);
      return 'Recent activity across your networks';
    }
  }

  async suggestReplyOptions(originalMessage: string, context?: string): Promise<string[]> {
    try {
      const systemPrompt = `Generate 3-4 appropriate reply options for a social media message. Consider the tone, context, and platform norms. Keep replies concise and engaging.

Return a JSON array of reply strings.`;

      const userPrompt = `Original message: "${originalMessage}"
${context ? `Context: ${context}` : ''}

Generate appropriate reply options.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.replies || ['Thanks for sharing!', 'Interesting perspective', 'Great point!'];
    } catch (error) {
      console.error('Error generating reply suggestions:', error);
      return ['Thanks for sharing!', 'Interesting perspective', 'Great point!'];
    }
  }
}

export const openaiService = new OpenAIService();
