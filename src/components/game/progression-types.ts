export type GameRole = 'hider' | 'seeker';

export type RankTierName =
  | 'Bronze Scout'
  | 'Silver Navigator'
  | 'Gold Phantom'
  | 'Diamond Voyager'
  | 'Apex Master';

export interface IslandLevel {
  id: string;
  number: string;
  name: string;
  nameBn: string;
  requiredPoints: number;
  coordinates: [number, number, number];
  radius: number;
  unlocked: boolean;
  difficulty: 'Starter' | 'Intermediate' | 'Hard' | 'Very Hard' | 'Master';
  reward: string;
  description: string;
}

export const ISLAND_LEVELS: IslandLevel[] = [
  {
    id: 'island-1',
    number: '01',
    name: 'Shonali Gram',
    nameBn: 'সোনালী গ্রাম',
    requiredPoints: 0,
    coordinates: [0, 0, 0],
    radius: 35,
    unlocked: true,
    difficulty: 'Starter',
    reward: 'Starter Village Scout Badge',
    description: 'The golden homeland: tin homestead, grazing cow, chickens, straw bales & grand mango tree.',
  },
  {
    id: 'island-2',
    number: '02',
    name: 'Ice Age Atoll',
    nameBn: 'হিমেল দ্বীপ (Ice Age)',
    requiredPoints: 500,
    coordinates: [85, 0, 65],
    radius: 32,
    unlocked: true,
    difficulty: 'Intermediate',
    reward: '350 Coins + Glacial Explorer Title',
    description: 'Expansive 32m Ice Age realm with snowfall, multi-room Frost Castle (walk-in Almira, tables, drawers, library), mammoth ribcage tunnel, waterfall grotto & glacial crevasse.',
  },
  {
    id: 'island-3',
    number: '03',
    name: 'Al-Dahna Desert Oasis',
    nameBn: 'মরুভূমি ও পিরামিড',
    requiredPoints: 1200,
    coordinates: [-85, 0, 75],
    radius: 48,
    unlocked: true,
    difficulty: 'Hard',
    reward: '700 Coins + Pharaoh Scarab Trophy',
    description: 'Grand Giza Trio of 3 pyramids with walk-in chambers, sliding stone doors, drinking Arabian horses, camels, snakes & soaring eagles.',
  },
  {
    id: 'island-4',
    number: '04',
    name: 'Mayabi Hill Tracts',
    nameBn: 'মায়াবী পাহাড়ী উপত্যকা',
    requiredPoints: 2000,
    coordinates: [-60, 0, -85],
    radius: 46,
    unlocked: true,
    difficulty: 'Very Hard',
    reward: '1,200 Coins + Celestial Wing Badge',
    description: 'High mountain terraces, river gorge, cascading waterfalls, 18m suspension bridge, horror rainy monsoon climate, night fireflies & winged celestial maidens.',
  },
  {
    id: 'island-5',
    number: '05',
    name: 'Stormy Lighthouse',
    nameBn: 'ঝড়ো বাতিঘর দ্বীপ',
    requiredPoints: 5000,
    coordinates: [-120, 0, -90],
    radius: 20,
    unlocked: true,
    difficulty: 'Master',
    reward: '2,500 Coins + Legend of Lukao Trophy',
    description: 'Climbable 15-meter stone lighthouse with rotating searchlight beam amid stormy ocean spray.',
  },
];

export interface PlayerProgression {
  totalPoints: number;
  highestRank: RankTierName;
  unlockedIslands: string[]; // e.g. ['island-1', 'island-2']
  bestTimes: {
    seekerBestWinTime?: number; // Lowest seconds taken to tag all hiders
    hiderBestSurvivalTime?: number; // Longest seconds survived
  };
  matchesPlayed: number;
  matchesWon: number;
}

export interface MatchBreakdownItem {
  label: string;
  points: number;
}

export interface LastMatchResult {
  role: GameRole;
  won: boolean;
  timeTaken: number; // in seconds
  stars: 1 | 2 | 3;
  rankTier: 'S' | 'A' | 'B' | 'C';
  rankTitle: string;
  pointsEarned: number;
  breakdown: MatchBreakdownItem[];
  previousPoints: number;
  newTotalPoints: number;
  newlyUnlockedIsland?: IslandLevel;
}

export function getRankTierFromPoints(points: number): RankTierName {
  if (points >= 5000) return 'Apex Master';
  if (points >= 3000) return 'Diamond Voyager';
  if (points >= 1500) return 'Gold Phantom';
  if (points >= 500) return 'Silver Navigator';
  return 'Bronze Scout';
}

export interface ScoreCalculationParams {
  role: GameRole;
  won: boolean;
  timeTaken: number;
  stealthExposedSeconds?: number;
  botsCaught?: number;
  totalBots?: number;
}

/**
 * Pure scoring calculation engine according to docs/island-levels-and-progression-plan.md
 */
export function calculateMatchScore(params: ScoreCalculationParams): {
  pointsEarned: number;
  stars: 1 | 2 | 3;
  rankTier: 'S' | 'A' | 'B' | 'C';
  rankTitle: string;
  breakdown: MatchBreakdownItem[];
} {
  const { role, won, timeTaken, stealthExposedSeconds = 0, botsCaught = 0, totalBots = 3 } = params;
  const breakdown: MatchBreakdownItem[] = [];
  let pointsEarned = 0;
  let stars: 1 | 2 | 3 = 1;
  let rankTier: 'S' | 'A' | 'B' | 'C' = 'C';
  let rankTitle = '';

  if (role === 'seeker') {
    if (won) {
      // Base Seeker Victory: +200 Pts
      const basePoints = 200;
      breakdown.push({ label: 'Hunter Victory Base', points: basePoints });
      pointsEarned += basePoints;

      // Speed Rank Tiers (Time to Tag All Hiders)
      if (timeTaken <= 30) {
        // S-Rank (< 30s)
        stars = 3;
        rankTier = 'S';
        rankTitle = 'Apex Hunter (S-Rank ⭐⭐⭐)';
        const bonus = 300;
        breakdown.push({ label: `Lightning Speed (<30s)`, points: bonus });
        pointsEarned += bonus;
      } else if (timeTaken <= 50) {
        // A-Rank (31s - 50s)
        stars = 2;
        rankTier = 'A';
        rankTitle = 'Swift Tracker (A-Rank ⭐⭐)';
        const bonus = 150;
        breakdown.push({ label: `Swift Hunt (31-50s)`, points: bonus });
        pointsEarned += bonus;
      } else {
        // B-Rank (> 50s)
        stars = 1;
        rankTier = 'B';
        rankTitle = 'Tenacious Scout (B-Rank ⭐)';
        const bonus = 50;
        breakdown.push({ label: `Match Clearance (>50s)`, points: bonus });
        pointsEarned += bonus;
      }
    } else {
      // Seeker Defeat / Time Expired
      stars = 1;
      rankTier = 'C';
      rankTitle = 'Time Expired (C-Rank)';
      const consolation = 30;
      breakdown.push({ label: 'Participation Consolation', points: consolation });
      pointsEarned += consolation;

      if (botsCaught > 0) {
        const catchBonus = botsCaught * 20;
        breakdown.push({ label: `Tagged ${botsCaught}/${totalBots} Hiders`, points: catchBonus });
        pointsEarned += catchBonus;
      }
    }
  } else {
    // Hider Role
    if (won) {
      // Base Survival Victory: +200 Pts
      const basePoints = 200;
      breakdown.push({ label: 'Survival Victory Base', points: basePoints });
      pointsEarned += basePoints;

      // Stealth Quality Multipliers
      if (stealthExposedSeconds === 0) {
        stars = 3;
        rankTier = 'S';
        rankTitle = 'Ghost Run (S-Rank ⭐⭐⭐)';
        const bonus = 250;
        breakdown.push({ label: 'Ghost Run (0s Exposed)', points: bonus });
        pointsEarned += bonus;
      } else if (stealthExposedSeconds < 10) {
        stars = 2;
        rankTier = 'A';
        rankTitle = 'Shadow Runner (A-Rank ⭐⭐)';
        const bonus = 120;
        breakdown.push({ label: `Shadow Runner (${stealthExposedSeconds}s Exposed)`, points: bonus });
        pointsEarned += bonus;
      } else {
        stars = 1;
        rankTier = 'B';
        rankTitle = 'Scrambler (B-Rank ⭐)';
        const bonus = 50;
        breakdown.push({ label: `Scrambler Escape (${stealthExposedSeconds}s Exposed)`, points: bonus });
        pointsEarned += bonus;
      }
    } else {
      // Tagged / Caught
      stars = 1;
      rankTier = 'C';
      rankTitle = 'Caught Out (C-Rank)';
      const consolation = 25;
      breakdown.push({ label: 'Survival Consolation', points: consolation });
      pointsEarned += consolation;

      // 1 point per second survived
      if (timeTaken > 0) {
        const timeBonus = Math.min(timeTaken, 75);
        breakdown.push({ label: `Survived ${timeBonus}s`, points: timeBonus });
        pointsEarned += timeBonus;
      }
    }
  }

  return { pointsEarned, stars, rankTier, rankTitle, breakdown };
}

