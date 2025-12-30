import { getSupabase } from "../lib/supabase";

/**
 * Raid Service for Multiplayer Sync
 */
export const RaidService = {
  /**
   * Broadcasts damage dealt to the active Raid Boss.
   */
  async broadcastDamage(
    heroName: string,
    damage: number,
    exerciseName: string,
  ) {
    const supabase = await getSupabase();
    if (!supabase) return;

    // 1. Send Transient Event (Floating Text for others)
    await supabase.channel("guild_hall").send({
      type: "broadcast",
      event: "damage_dealt",
      payload: {
        heroName,
        damage,
        exerciseName,
        timestamp: new Date().toISOString(),
      },
    });

    // 2. Persist Damage (RPC Call to Backend)
    // Assuming 'damage_boss' RPC exists in the Supabase instance
    await supabase.rpc("damage_boss", {
      boss_id: 1,
      damage_amount: damage,
    });
  },

  /**
   * Broadcasts a "Buff" event when a player hits a PR or activates a skill.
   */
  async broadcastBuff(heroName: string, buffName: string) {
    const supabase = await getSupabase();
    if (!supabase) return;

    await supabase.channel("guild_hall").send({
      type: "broadcast",
      event: "buff_activation",
      payload: {
        heroName,
        buffName,
        timestamp: new Date().toISOString(),
      },
    });
  },

  /**
   * Broadcasts cursor/presence position for Live Party View
   */
  async broadcastPresence(heroName: string, x: number, y: number) {
    const supabase = await getSupabase();
    if (!supabase) return;

    await supabase.channel("guild_hall").track({
      user: heroName,
      x,
      y,
      online_at: new Date().toISOString(),
    });
  },
};
