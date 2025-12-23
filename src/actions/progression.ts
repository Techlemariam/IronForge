'use server';

import { ProgressionService } from '@/services/progression';
import { createClient } from '@/utils/supabase/server';

export async function getProgressionAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        return await ProgressionService.getProgressionState(user.id);
    } catch (e) {
        console.error("Progression Action Error:", e);
        return null;
    }
}
