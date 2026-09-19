import type { ActivityState } from '@/constants/activity';
import { isSupabaseConfigured } from './supabaseClient';
import { localRankingService } from './ranking.local';
import { supabaseRankingService } from './ranking.supabase';

export type RankingPeriod = 'today' | 'week' | 'month';

export interface RankingEntry {
  userId: string;
  name: string;
  kcal: number;
  activity: ActivityState;
  lastActiveAt: number;
  deltaRank: number;
  isCurrentUser: boolean;
}

export interface SubmitScoreInput {
  userId: string;
  name: string;
  kcal: number;
  activity: ActivityState;
}

export interface RankingService {
  getRanking(period: RankingPeriod, currentUserId?: string): Promise<RankingEntry[]>;
  submitScore(entry: SubmitScoreInput): Promise<void>;
}

// Misma decisión de capa que en services/auth.ts: las pantallas solo conocen
// RankingService, nunca si los datos vienen de Supabase o de la simulación.
export const rankingService: RankingService = isSupabaseConfigured ? supabaseRankingService : localRankingService;
