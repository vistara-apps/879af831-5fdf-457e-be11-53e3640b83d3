import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { farcasterService } from '@/lib/services/farcaster';
import { openaiService } from '@/lib/services/openai';
import { z } from 'zod';

const SearchContactsSchema = z.object({
  userId: z.string().min(1),
  query: z.string().min(1),
  networks: z.array(z.string()).optional(),
  useAI: z.boolean().default(true),
  limit: z.coerce.number().min(1).max(50).default(20)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, networks, useAI, limit } = SearchContactsSchema.parse(body);

    // Get user profile for AI context
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    // Get user's existing contacts for context
    const { data: existingContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .limit(100);

    if (contactsError) throw contactsError;

    const searchResults = [];
    const networkSearchPromises = [];

    // Search across specified networks or all connected networks
    const networksToSearch = networks || user.connected_networks || ['farcaster'];

    for (const network of networksToSearch) {
      switch (network) {
        case 'farcaster':
          networkSearchPromises.push(
            farcasterService.searchUsers(query, Math.min(limit, 25))
              .then(contacts => ({ network, contacts }))
              .catch(error => {
                console.error(`Farcaster search error:`, error);
                return { network, contacts: [] };
              })
          );
          break;
        
        // Add other network searches here
        default:
          console.log(`Search not implemented for ${network}`);
      }
    }

    // Execute all network searches in parallel
    const networkResults = await Promise.all(networkSearchPromises);
    
    // Combine results from all networks
    let allContacts = [];
    for (const result of networkResults) {
      allContacts = allContacts.concat(result.contacts);
    }

    // Remove duplicates based on display name and network
    const uniqueContacts = allContacts.filter((contact, index, self) =>
      index === self.findIndex(c => 
        c.displayName === contact.displayName && c.network === contact.network
      )
    );

    let finalResults = uniqueContacts;

    // Use AI for intelligent ranking if enabled
    if (useAI && uniqueContacts.length > 0) {
      try {
        const searchHistory = []; // TODO: Get from user's search history
        const aiContext = {
          userProfile: {
            interests: [], // TODO: Extract from user activity
            networks: user.connected_networks,
            recentActivity: [] // TODO: Get recent messages/activity
          },
          searchHistory,
          connectedContacts: existingContacts.map(c => ({
            contactId: c.contact_id,
            userId: c.user_id,
            network: c.network,
            profileUrl: c.profile_url,
            displayName: c.display_name,
            avatar: c.avatar,
            bio: c.bio,
            followers: c.followers
          }))
        };

        const aiResult = await openaiService.discoverContacts(
          query,
          aiContext,
          uniqueContacts
        );

        finalResults = aiResult.contacts;

        // Store search query for future AI improvements
        // TODO: Implement search history storage

        return NextResponse.json({
          success: true,
          contacts: finalResults.slice(0, limit),
          metadata: {
            totalFound: uniqueContacts.length,
            aiRanked: true,
            confidence: aiResult.confidence,
            suggestions: aiResult.suggestions,
            networksSearched: networksToSearch
          }
        });

      } catch (aiError) {
        console.error('AI search error:', aiError);
        // Fall back to simple results if AI fails
      }
    }

    // Simple text-based ranking if AI is disabled or failed
    finalResults = uniqueContacts
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameMatch = a.displayName.toLowerCase().includes(query.toLowerCase());
        const bNameMatch = b.displayName.toLowerCase().includes(query.toLowerCase());
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Then by follower count
        return (b.followers || 0) - (a.followers || 0);
      })
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      contacts: finalResults,
      metadata: {
        totalFound: uniqueContacts.length,
        aiRanked: false,
        networksSearched: networksToSearch
      }
    });

  } catch (error) {
    console.error('Contact search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to search contacts' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get AI-generated search suggestions
    const suggestions = await openaiService.generateSearchSuggestions(
      {
        interests: [], // TODO: Get from user profile
        networks: [], // TODO: Get from user's connected networks
        recentActivity: [] // TODO: Get from recent messages
      },
      [] // TODO: Get recent search history
    );

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
