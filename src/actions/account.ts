'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function deleteAccountAction(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Delete user data from Prisma/DB first
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Sign out the user (Supabase admin delete requires service role, 
        // so we just sign out and let Supabase handle user deletion via their dashboard/policy)
        await supabase.auth.signOut();

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete account:', error);
        return { success: false, error: 'Failed to delete account. Please contact support.' };
    }
}

export async function signOutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}
