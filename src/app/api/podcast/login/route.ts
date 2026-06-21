import { getErrorMessage } from '@/lib/error-message';
import { prisma } from '@/lib/prisma';
import { PocketCastsClient } from '@/services/pocketcasts';
import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const pcClient = new PocketCastsClient();
    const token = await pcClient.login(email, password);

    // Save token to user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pocketCastsToken: token,
        pocketCastsEnabled: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Podcast Login Error]:', getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to log in to Pocket Casts' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pocketCastsToken: null,
        pocketCastsEnabled: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
