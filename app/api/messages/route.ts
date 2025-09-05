import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { farcasterService } from '@/lib/services/farcaster';
import { z } from 'zod';

const GetMessagesSchema = z.object({
  userId: z.string().min(1),
  network: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0)
});

const SyncMessagesSchema = z.object({
  userId: z.string().min(1),
  networks: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = GetMessagesSchema.parse({
      userId: searchParams.get('userId'),
      network: searchParams.get('network'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    });

    let query = supabase
      .from('messages')
      .select('*')
      .eq('user_id', params.userId)
      .order('timestamp', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.network) {
      query = query.eq('network', params.network);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        messageId: msg.message_id,
        network: msg.network,
        sender: msg.sender,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        threadId: msg.thread_id,
        isRead: msg.is_read,
        type: msg.type
      })),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: messages.length === params.limit
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, networks } = SyncMessagesSchema.parse(body);

    // Get user's network connections
    const { data: connections, error: connectionsError } = await supabase
      .from('network_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (connectionsError) throw connectionsError;

    const syncResults = [];

    for (const connection of connections) {
      if (networks && !networks.includes(connection.network_type)) {
        continue;
      }

      try {
        let newMessages = [];

        switch (connection.network_type) {
          case 'farcaster':
            // For Farcaster, we need the user's FID
            // This would typically be stored in the connection or user profile
            const fid = parseInt(connection.api_token); // Simplified - in real app, store FID separately
            newMessages = await farcasterService.getFeedCasts(fid, 25);
            break;
          
          // Add other network integrations here
          default:
            console.log(`Sync not implemented for ${connection.network_type}`);
            continue;
        }

        // Store new messages in database
        const messagesToInsert = newMessages.map(msg => ({
          message_id: msg.messageId,
          user_id: userId,
          network: msg.network,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          thread_id: msg.threadId,
          is_read: msg.isRead,
          type: msg.type
        }));

        if (messagesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('messages')
            .upsert(messagesToInsert, { 
              onConflict: 'message_id',
              ignoreDuplicates: true 
            });

          if (insertError) {
            console.error(`Error inserting messages for ${connection.network_type}:`, insertError);
          }
        }

        // Update last sync time
        await supabase
          .from('network_connections')
          .update({ last_sync: new Date().toISOString() })
          .eq('connection_id', connection.connection_id);

        syncResults.push({
          network: connection.network_type,
          success: true,
          messageCount: newMessages.length
        });

      } catch (networkError) {
        console.error(`Sync error for ${connection.network_type}:`, networkError);
        syncResults.push({
          network: connection.network_type,
          success: false,
          error: networkError instanceof Error ? networkError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncResults
    });

  } catch (error) {
    console.error('Sync messages error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to sync messages' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageIds, isRead } = z.object({
      messageIds: z.array(z.string()),
      isRead: z.boolean()
    }).parse(body);

    const { error } = await supabase
      .from('messages')
      .update({ is_read: isRead })
      .in('message_id', messageIds);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updatedCount: messageIds.length
    });

  } catch (error) {
    console.error('Update messages error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}
