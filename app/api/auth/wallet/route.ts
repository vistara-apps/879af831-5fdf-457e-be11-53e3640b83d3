import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const WalletAuthSchema = z.object({
  walletAddress: z.string().min(1),
  displayName: z.string().min(1),
  signature: z.string().optional(),
  message: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, displayName, signature, message } = WalletAuthSchema.parse(body);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let user;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: crypto.randomUUID(),
          wallet_address: walletAddress,
          display_name: displayName,
          connected_networks: [],
          settings: {
            notifications: true,
            autoSync: true,
            theme: 'dark'
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.user_id,
        displayName: user.display_name,
        walletAddress: user.wallet_address,
        connectedNetworks: user.connected_networks,
        settings: user.settings
      }
    });

  } catch (error) {
    console.error('Wallet auth error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.user_id,
        displayName: user.display_name,
        walletAddress: user.wallet_address,
        connectedNetworks: user.connected_networks,
        settings: user.settings
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
