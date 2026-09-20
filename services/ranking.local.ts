import type { ActivityState } from '@/constants/activity';
import type { RankingService, RankingEntry, RankingPeriod, SubmitScoreInput } from './ranking';

interface SimulatedUser {
  id: string;
  name: string;
  baseKcal: Record<RankingPeriod, number>;
  activity: ActivityState;
  lastActiveAt: number;
  deltaRank: number;
}

const NAMES = [
  'Camila Fernández',
  'Mateo Rodríguez',
  'Valentina Gómez',
  'Santiago Torres',
  'Isabella Martínez',
  'Sebastián López',
  'Sofía Ramírez',
  'Nicolás Herrera',
  'Renata Souza',
  'Emilia Castro',
  'Joaquín Morales',
  'Antonella Rojas',
  'Benjamín Vargas',
  'Martina Flores',
  'Tomás Jiménez',
  'Luciana Mendoza',
  'Diego Ortiz',
  'Josefina Reyes',
  'Emiliano Cruz',
  'Catalina Paredes',
  'Agustín Navarro',
  'Fernanda Aguilar',
  'Maximiliano Domínguez',
  'Daniela Campos',
  'Gabriel Oliveira',
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickActivity(): ActivityState {
  const roll = Math.random();
  if (roll < 0.5) return 'still';
  if (roll < 0.85) return 'walking';
  return 'running';
}

function seedUsers(): SimulatedUser[] {
  return NAMES.map((name, index) => {
    const todayKcal = randomBetween(150, 640);
    const weekKcal = todayKcal * randomBetween(5, 7);
    const monthKcal = weekKcal * randomBetween(3.5, 4.5);
    const recentlyActive = Math.random() < 0.4;

    return {
      id: `sim-${String(index + 1).padStart(2, '0')}`,
      name,
      baseKcal: { today: todayKcal, week: weekKcal, month: monthKcal },
      activity: pickActivity(),
      lastActiveAt: Date.now() - (recentlyActive ? randomBetween(0, 110_000) : randomBetween(6, 180) * 60_000),
      deltaRank: Math.floor(randomBetween(-3, 4)),
    };
  });
}

// Estado en memoria del proceso: persiste mientras la app sigue abierta, para
// que el "movimiento en vivo" se note entre refrescos sin backend real.
let simulatedUsers = seedUsers();
const realUsers = new Map<string, SubmitScoreInput>();

function jitterActivity(user: SimulatedUser): void {
  if (Math.random() < 0.15) {
    user.activity = pickActivity();
    user.lastActiveAt = Date.now();
  }
}

function jitterKcal(user: SimulatedUser, period: RankingPeriod): number {
  const drift = randomBetween(-6, 10);
  user.baseKcal[period] = Math.max(0, user.baseKcal[period] + drift);
  return user.baseKcal[period];
}

export const localRankingService: RankingService = {
  async getRanking(period, currentUserId) {
    const simulatedEntries: RankingEntry[] = simulatedUsers.map((user) => {
      jitterActivity(user);
      return {
        userId: user.id,
        name: user.name,
        kcal: Math.round(jitterKcal(user, period)),
        activity: user.activity,
        lastActiveAt: user.lastActiveAt,
        deltaRank: user.deltaRank,
        isCurrentUser: user.id === currentUserId,
      };
    });

    const realEntries: RankingEntry[] = Array.from(realUsers.values()).map((entry) => ({
      userId: entry.userId,
      name: entry.name,
      kcal: Math.round(entry.stats.kcalMet),
      activity: entry.activity,
      lastActiveAt: Date.now(),
      deltaRank: 0,
      isCurrentUser: entry.userId === currentUserId,
    }));

    return [...simulatedEntries, ...realEntries].sort((a, b) => b.kcal - a.kcal);
  },

  async submitScore(entry) {
    realUsers.set(entry.userId, entry);
  },
};
