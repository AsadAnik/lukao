import { audioManager } from './audio-manager';
import {
  GameRole,
  IslandLevel,
  ISLAND_LEVELS,
  PlayerProgression,
  LastMatchResult,
  calculateMatchScore,
  getRankTierFromPoints,
} from './progression-types';
import { loadProgression, saveProgression, DEFAULT_PROGRESSION } from './progression-storage';

export * from './progression-types';
export { loadProgression, saveProgression } from './progression-storage';

export type GamePhase = 'menu' | 'hiding' | 'seeking' | 'game_over';
export type Winner = 'hiders' | 'seekers' | null;

export interface Mission {
  id: number;
  number: string; // e.g. "01", "02"
  title: string;
  tagline: string;
  role: 'hider' | 'seeker';
  description: string;
  objective: string;
  reward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  stars: number;
  timeLimit: number;
  icon: string;
}

export const MISSIONS_LIST: Mission[] = [
  {
    id: 1,
    number: '01',
    title: 'The Great Bush Scramble',
    tagline: 'Slip into the foliage before the scanner turns on.',
    role: 'hider',
    description: 'Scramble to the Bush Grove (Zone A) within 15 seconds and maintain cover without getting exposed.',
    objective: 'Stay HIDDEN in the bushes for at least 25 seconds.',
    reward: '150 Coins + Bush Scout Badge',
    difficulty: 'Easy',
    stars: 1,
    timeLimit: 45,
    icon: '🌿',
  },
  {
    id: 2,
    number: '02',
    title: 'Bridge Over Hunter River',
    tagline: 'High elevation sprint across the arena viaduct.',
    role: 'hider',
    description: 'The Seeker has begun patrolling the perimeter. Cross the Arch Bridge to the upper observation ramp.',
    objective: 'Cross the elevated Arch Bridge without getting caught.',
    reward: '250 Coins + Acrobat Title',
    difficulty: 'Medium',
    stars: 2,
    timeLimit: 50,
    icon: '🌉',
  },
  {
    id: 3,
    number: '03',
    title: 'Gramer Bari Star Heist',
    tagline: 'Scale the Tin Roof and hide behind the Golden Haystack.',
    role: 'hider',
    description: 'Scramble up the straw bales to the Tin Roof (টিনের চালা) and use the Haystack (খড়ের গাদা) and Cow shed to dodge the Seeker.',
    objective: 'Survive in the Village Homestead while staying out of sight.',
    reward: '350 Coins + Village Explorer Badge',
    difficulty: 'Medium',
    stars: 2,
    timeLimit: 60,
    icon: '🏡',
  },
  {
    id: 4,
    number: '04',
    title: 'Ghost In The Shadows',
    tagline: 'The ultimate stealth test. Zero exposure allowed.',
    role: 'hider',
    description: 'Survive the entire 75-second seeking phase without your stealth status ever turning EXPOSED.',
    objective: 'Zero seconds exposed. Use crouch and bushes continuously.',
    reward: '600 Coins + Phantom Helmet',
    difficulty: 'Hard',
    stars: 3,
    timeLimit: 75,
    icon: '👻',
  },
  {
    id: 5,
    number: '05',
    title: 'Apex Hunter Strike',
    tagline: 'Turn the tables. Track and tag every survivor.',
    role: 'seeker',
    description: 'Equip your scanner flashlight beam and track down all 3 AI hiders (Pip, Milo, Kiko).',
    objective: 'Tag all 3 AI hiders before time runs out.',
    reward: '1,000 Coins + Hunter Champion Cape',
    difficulty: 'Extreme',
    stars: 3,
    timeLimit: 60,
    icon: '🎯',
  },
];

export interface BotState {
  id: string;
  name: string;
  role: 'hider' | 'seeker';
  color: string;
  position: [number, number, number];
  isTagged: boolean;
  hidingSpotIndex: number;
}

export interface GameState {
  role: GameRole;
  phase: GamePhase;
  winner: Winner;
  timeLeft: number;
  isFisheyeActive: boolean;
  fisheyeZoom: number;
  cameraMode: 'follow' | 'free';
  stealthStatus: 'hidden' | 'partially_hidden' | 'exposed';
  playerPosition: [number, number, number];
  playerCaught: boolean;
  canTag: boolean;
  nearbyTargetId: string | null;
  alertNearby: boolean; // seeker is close to player hider
  hidersRemaining: number;
  totalHiders: number;
  caughtHiders: string[];
  bots: BotState[];
  showTouchControls: boolean;
  isMenuOpen: boolean;
  currentMission: Mission | null;

  // Milestone 1 Progression & Scoring Engine State
  progression: PlayerProgression;
  lastMatchResult: LastMatchResult | null;
  roundElapsedSeconds: number;
  stealthExposedSeconds: number;
  islands: IslandLevel[];

  // Actions
  setRole: (role: GameRole) => void;
  toggleRole: () => void;
  setPhase: (phase: GamePhase) => void;
  toggleFisheye: () => void;
  setFisheyeZoom: (zoom: number) => void;
  setCameraMode: (mode: 'follow' | 'free') => void;
  setStealthStatus: (status: 'hidden' | 'partially_hidden' | 'exposed') => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setShowTouchControls: (show: boolean) => void;
  toggleTouchControls: () => void;
  setNearbyTarget: (id: string | null) => void;
  setAlertNearby: (alert: boolean) => void;
  tagBot: (id: string) => void;
  tagPlayer: () => void;
  performTagAction: () => void;
  decrementTimer: () => void;
  restartGame: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  startQuickPlay: (role?: GameRole) => void;
  startMission: (mission: Mission) => void;

  // Progression Actions
  addPoints: (amount: number, reason?: string) => void;
  unlockIsland: (islandId: string) => void;
  resetProgression: () => void;
}

const DEFAULT_BOTS: BotState[] = [
  {
    id: 'bot-1',
    name: 'Pip',
    role: 'hider',
    color: '#ed8936',
    position: [12, 0.75, 11],
    isTagged: false,
    hidingSpotIndex: 0,
  },
  {
    id: 'bot-2',
    name: 'Milo',
    role: 'hider',
    color: '#9f7aea',
    position: [-10, 0.75, 10],
    isTagged: false,
    hidingSpotIndex: 1,
  },
  {
    id: 'bot-3',
    name: 'Kiko',
    role: 'hider',
    color: '#38b2ac',
    position: [-2, 0.75, -13],
    isTagged: false,
    hidingSpotIndex: 2,
  },
];

type Listener = () => void;

class LukaoStore {
  private state: GameState;
  private listeners = new Set<Listener>();

  constructor() {
    const loadedProg = loadProgression();
    const initialIslands = this.getUpdatedIslands(loadedProg.unlockedIslands);

    this.state = {
      role: 'hider',
      phase: 'hiding',
      winner: null,
      timeLeft: 20, // 20s to hide
      isFisheyeActive: true,
      fisheyeZoom: 0.65,
      cameraMode: 'follow',
      stealthStatus: 'exposed',
      playerPosition: [0, 0.75, 0],
      playerCaught: false,
      canTag: false,
      nearbyTargetId: null,
      alertNearby: false,
      hidersRemaining: 2,
      totalHiders: 2,
      caughtHiders: [],
      bots: DEFAULT_BOTS.map((b, idx) => ({
        ...b,
        role: (idx === 0 ? 'seeker' : 'hider') as 'hider' | 'seeker',
        isTagged: false,
      })),
      showTouchControls: true,
      isMenuOpen: true,
      currentMission: null,

      // Progression fields
      progression: loadedProg,
      lastMatchResult: null,
      roundElapsedSeconds: 0,
      stealthExposedSeconds: 0,
      islands: initialIslands,

      setRole: (role) => {
        this.update({ role });
        this.state.restartGame();
      },
      toggleRole: () => {
        const nextRole = this.state.role === 'hider' ? 'seeker' : 'hider';
        this.update({ role: nextRole });
        this.state.restartGame();
      },
      setPhase: (phase) => this.update({ phase }),
      toggleFisheye: () => this.update({ isFisheyeActive: !this.state.isFisheyeActive }),
      setFisheyeZoom: (fisheyeZoom) => this.update({ fisheyeZoom }),
      setCameraMode: (cameraMode) => this.update({ cameraMode }),
      setStealthStatus: (stealthStatus) => this.update({ stealthStatus }),
      setPlayerPosition: (playerPosition) => this.update({ playerPosition }),
      setShowTouchControls: (showTouchControls) => this.update({ showTouchControls }),
      toggleTouchControls: () => this.update({ showTouchControls: !this.state.showTouchControls }),
      setNearbyTarget: (nearbyTargetId) => this.update({ nearbyTargetId, canTag: nearbyTargetId !== null }),
      setAlertNearby: (alertNearby) => {
        if (alertNearby && !this.state.alertNearby) {
          audioManager.playHeartbeat();
        }
        this.update({ alertNearby });
      },

      // Tag an AI bot
      tagBot: (id: string) => {
        if (this.state.caughtHiders.includes(id)) return;
        audioManager.playTagSound();

        const updatedBots = this.state.bots.map((b) =>
          b.id === id ? { ...b, isTagged: true } : b
        );
        const updatedCaught = [...this.state.caughtHiders, id];
        const remaining = Math.max(0, this.state.totalHiders - updatedCaught.length);

        this.update({
          bots: updatedBots,
          caughtHiders: updatedCaught,
          hidersRemaining: remaining,
          canTag: false,
          nearbyTargetId: null,
        });

        if (remaining === 0) {
          audioManager.playVictory();
          // Seeker Tagged All Hiders!
          this.finalizeMatch(true, this.state.role);
        }
      },

      // Tag the player (if player is hider and caught by seeker)
      tagPlayer: () => {
        if (this.state.playerCaught || this.state.role !== 'hider' || this.state.phase === 'game_over') return;
        audioManager.playDefeat();
        this.update({
          playerCaught: true,
        });
        // Player Hider caught by Seeker
        this.finalizeMatch(false, 'hider');
      },

      performTagAction: () => {
        if (this.state.nearbyTargetId) {
          this.state.tagBot(this.state.nearbyTargetId);
        }
      },

      decrementTimer: () => {
        if (this.state.phase === 'game_over' || this.state.phase === 'menu' || this.state.isMenuOpen) return;

        if (this.state.timeLeft > 1) {
          const nextTime = this.state.timeLeft - 1;
          if (nextTime <= 5) {
            audioManager.playTick(nextTime === 1);
          }

          // Advance elapsed match metrics during seeking phase
          if (this.state.phase === 'seeking') {
            const nextElapsed = this.state.roundElapsedSeconds + 1;
            const nextExposed =
              this.state.role === 'hider' && this.state.stealthStatus === 'exposed'
                ? this.state.stealthExposedSeconds + 1
                : this.state.stealthExposedSeconds;

            this.update({
              timeLeft: nextTime,
              roundElapsedSeconds: nextElapsed,
              stealthExposedSeconds: nextExposed,
            });
          } else {
            this.update({ timeLeft: nextTime });
          }
        } else {
          // Time expired for current phase
          if (this.state.phase === 'hiding') {
            audioManager.playTick(true);
            this.update({
              phase: 'seeking',
              timeLeft: 75, // 75s to seek!
              roundElapsedSeconds: 0,
              stealthExposedSeconds: 0,
            });
          } else if (this.state.phase === 'seeking') {
            // Timer ran out! Hiders survived the full round!
            const hiderWon = this.state.role === 'hider';
            if (hiderWon) {
              audioManager.playVictory();
            } else {
              audioManager.playDefeat();
            }
            this.finalizeMatch(hiderWon, this.state.role);
          }
        }
      },

      openMenu: () => {
        audioManager.playMenuOpen();
        this.update({ isMenuOpen: true });
      },

      closeMenu: () => {
        audioManager.playClick();
        this.update({ isMenuOpen: false });
      },

      startQuickPlay: (role) => {
        const chosenRole = role || this.state.role;
        audioManager.playGameStart();
        this.update({
          role: chosenRole,
          isMenuOpen: false,
          currentMission: null,
        });
        this.state.restartGame();
      },

      startMission: (mission) => {
        audioManager.playGameStart();
        this.update({
          role: mission.role,
          currentMission: mission,
          isMenuOpen: false,
        });
        this.state.restartGame();
      },

      restartGame: () => {
        const isSeeker = this.state.role === 'seeker';
        const freshBots: BotState[] = DEFAULT_BOTS.map((b, idx) => ({
          ...b,
          role: (isSeeker ? 'hider' : idx === 0 ? 'seeker' : 'hider') as 'hider' | 'seeker',
          isTagged: false,
        }));

        this.update({
          phase: 'hiding',
          isMenuOpen: false,
          winner: null,
          timeLeft: this.state.currentMission ? this.state.currentMission.timeLimit : 20,
          playerCaught: false,
          canTag: false,
          nearbyTargetId: null,
          alertNearby: false,
          hidersRemaining: isSeeker ? 3 : 2,
          totalHiders: isSeeker ? 3 : 2,
          caughtHiders: [],
          bots: freshBots,
          playerPosition: isSeeker ? [14, 0.8, -12] : [0, 0.75, 0],
          stealthStatus: 'exposed',
          roundElapsedSeconds: 0,
          stealthExposedSeconds: 0,
        });
      },

      addPoints: (amount: number, _reason?: string) => {
        if (amount <= 0) return;
        const prev = this.state.progression.totalPoints;
        const newTotal = prev + amount;
        const newRank = getRankTierFromPoints(newTotal);

        // Check if any islands unlocked
        const currentUnlocked = [...this.state.progression.unlockedIslands];
        let newlyUnlocked: IslandLevel | undefined;

        ISLAND_LEVELS.forEach((island) => {
          if (newTotal >= island.requiredPoints && !currentUnlocked.includes(island.id)) {
            currentUnlocked.push(island.id);
            if (!newlyUnlocked) newlyUnlocked = island;
          }
        });

        const nextProg: PlayerProgression = {
          ...this.state.progression,
          totalPoints: newTotal,
          highestRank: newRank,
          unlockedIslands: currentUnlocked,
        };

        saveProgression(nextProg);

        this.update({
          progression: nextProg,
          islands: this.getUpdatedIslands(currentUnlocked),
        });
      },

      unlockIsland: (islandId: string) => {
        if (this.state.progression.unlockedIslands.includes(islandId)) return;
        const updated = [...this.state.progression.unlockedIslands, islandId];
        const nextProg: PlayerProgression = {
          ...this.state.progression,
          unlockedIslands: updated,
        };
        saveProgression(nextProg);
        this.update({
          progression: nextProg,
          islands: this.getUpdatedIslands(updated),
        });
      },

      resetProgression: () => {
        const nextProg = { ...DEFAULT_PROGRESSION };
        saveProgression(nextProg);
        this.update({
          progression: nextProg,
          lastMatchResult: null,
          islands: this.getUpdatedIslands(nextProg.unlockedIslands),
        });
      },
    };
  }

  private getUpdatedIslands(unlockedIds: string[]): IslandLevel[] {
    return ISLAND_LEVELS.map((island) => ({
      ...island,
      unlocked: unlockedIds.includes(island.id),
    }));
  }

  /**
   * Finalizes the match round, executes the Milestone 1 scoring engine,
   * checks for island unlocks, and updates persistent player progression.
   */
  private finalizeMatch(won: boolean, role: GameRole) {
    if (this.state.phase === 'game_over') return;

    const timeTaken = Math.max(1, this.state.roundElapsedSeconds);
    const stealthExposed = this.state.stealthExposedSeconds;
    const botsCaught = this.state.caughtHiders.length;
    const totalBots = this.state.totalHiders;

    // 1. Calculate Score & Performance Stars
    const scoreResult = calculateMatchScore({
      role,
      won,
      timeTaken,
      stealthExposedSeconds: stealthExposed,
      botsCaught,
      totalBots,
    });

    // 2. Progression Account Updates
    const prevPoints = this.state.progression.totalPoints;
    const newTotalPoints = prevPoints + scoreResult.pointsEarned;
    const newRank = getRankTierFromPoints(newTotalPoints);

    // 3. Island Unlock Evaluation
    const currentUnlocked = [...this.state.progression.unlockedIslands];
    let newlyUnlockedIsland: IslandLevel | undefined;

    ISLAND_LEVELS.forEach((island) => {
      if (newTotalPoints >= island.requiredPoints && !currentUnlocked.includes(island.id)) {
        currentUnlocked.push(island.id);
        if (!newlyUnlockedIsland) {
          newlyUnlockedIsland = island;
        }
      }
    });

    // 4. Best Times Tracking
    const updatedBestTimes = { ...this.state.progression.bestTimes };
    if (role === 'seeker' && won) {
      const prevBest = updatedBestTimes.seekerBestWinTime ?? 999;
      if (timeTaken < prevBest) {
        updatedBestTimes.seekerBestWinTime = timeTaken;
      }
    } else if (role === 'hider') {
      const prevBest = updatedBestTimes.hiderBestSurvivalTime ?? 0;
      if (timeTaken > prevBest) {
        updatedBestTimes.hiderBestSurvivalTime = timeTaken;
      }
    }

    const updatedProgression: PlayerProgression = {
      totalPoints: newTotalPoints,
      highestRank: newRank,
      unlockedIslands: currentUnlocked,
      bestTimes: updatedBestTimes,
      matchesPlayed: this.state.progression.matchesPlayed + 1,
      matchesWon: won ? this.state.progression.matchesWon + 1 : this.state.progression.matchesWon,
    };

    saveProgression(updatedProgression);

    const lastMatchResult: LastMatchResult = {
      role,
      won,
      timeTaken,
      stars: scoreResult.stars,
      rankTier: scoreResult.rankTier,
      rankTitle: scoreResult.rankTitle,
      pointsEarned: scoreResult.pointsEarned,
      breakdown: scoreResult.breakdown,
      previousPoints: prevPoints,
      newTotalPoints,
      newlyUnlockedIsland,
    };

    const winner: Winner = won
      ? role === 'seeker'
        ? 'seekers'
        : 'hiders'
      : role === 'seeker'
      ? 'hiders'
      : 'seekers';

    this.update({
      phase: 'game_over',
      winner,
      progression: updatedProgression,
      lastMatchResult,
      islands: this.getUpdatedIslands(currentUnlocked),
    });
  }

  getState() {
    return this.state;
  }

  private update(partial: Partial<GameState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const lukaoStore = new LukaoStore();
