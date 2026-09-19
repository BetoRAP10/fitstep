import { supabase } from './supabaseClient';
import type { RankingService, RankingEntry, RankingPeriod, SubmitScoreInput } from './ranking';
import type { ActivityState } from '@/constants/activity';
import { todayKey, addDays } from '@/utils/date';

interface RankingRow {
  user_id: string;
  display_name: string;
  date: string;
  kcal: number;
  activity: ActivityState;
  updated_at: string;
}

function rangeStartFor(period: RankingPeriod): string {
  const daysBack = period === 'today' ? 0 : period === 'week' ? 6 : 29;
  return todayKey(addDays(new Date(), -daysBack));
}

export const supabaseRankingService: RankingService = {
  async getRanking(period, currentUserId) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('ranking_public')
      .select('*')
      .gte('date', rangeStartFor(period));
    if (error || !data) return [];

    // La vista devuelve una fila por usuario y día; se agrega en el cliente
    // (suma de kcal, actividad más reciente) para semana/mes.
    const byUser = new Map<string, { name: string; kcal: number; activity: ActivityState; updatedAt: string }>();
    for (const row of data as RankingRow[]) {
      const existing = byUser.get(row.user_id);
      if (!existing) {
        byUser.set(row.user_id, {
          name: row.display_name,
          kcal: row.kcal,
          activity: row.activity,
          updatedAt: row.updated_at,
        });
        continue;
      }
      existing.kcal += row.kcal;
      if (row.updated_at > existing.updatedAt) {
        existing.activity = row.activity;
        existing.updatedAt = row.updated_at;
      }
    }

    const entries: RankingEntry[] = Array.from(byUser.entries()).map(([userId, value]) => ({
      userId,
      name: value.name,
      kcal: Math.round(value.kcal),
      activity: value.activity,
      lastActiveAt: new Date(value.updatedAt).getTime(),
      // Calcular la posición de ayer requeriría un snapshot histórico aparte;
      // se deja neutro en modo Supabase (ver limitaciones en el README).
      deltaRank: 0,
      isCurrentUser: userId === currentUserId,
    }));

    return entries.sort((a, b) => b.kcal - a.kcal);
  },

  async submitScore(entry: SubmitScoreInput) {
    if (!supabase) return;
    await supabase.from('daily_stats').upsert(
      {
        user_id: entry.userId,
        date: todayKey(),
        kcal_met: entry.kcal,
        activity: entry.activity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    );
  },
};
