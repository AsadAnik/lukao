import { audioManager } from './audio-manager';

export type GameRole = 'hider' | 'seeker';
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
    title: 'Crate Yard Star Heist',
    tagline: 'Climb the shipping crates and claim the floating star.',
    role: 'hider',
    description: 'Parkour up the stacked crates in Zone C to reach the rotating golden star at the center plaza.',
    objective: 'Touch the Star while avoiding the Seeker beam.',
    reward: '350 Coins + Gold Star Trinket',
    difficulty: 'Medium',
    stars: 2,
    timeLimit: 60,
    icon: '⭐',
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
          this.update({ phase: 'game_over', winner: 'seekers' });
        }
      },

      // Tag the player (if player is hider and caught by seeker)
      tagPlayer: () => {
        if (this.state.playerCaught || this.state.role !== 'hider') return;
        audioManager.playDefeat();
        this.update({
          playerCaught: true,
          phase: 'game_over',
          winner: 'seekers',
        });
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
          this.update({ timeLeft: nextTime });
        } else {
          // Time expired for current phase
          if (this.state.phase === 'hiding') {
            audioManager.playTick(true);
            this.update({
              phase: 'seeking',
              timeLeft: 75, // 75s to seek!
            });
          } else if (this.state.phase === 'seeking') {
            // Timer ran out! Hiders survived!
            if (this.state.role === 'hider') {
              audioManager.playVictory();
            } else {
              audioManager.playDefeat();
            }
            this.update({
              phase: 'game_over',
              winner: 'hiders',
            });
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
          hidersRemaining: isSeeker ? 3 : 2, // If player is hider, 2 other hiders + player = 3
          totalHiders: isSeeker ? 3 : 2,
          caughtHiders: [],
          bots: freshBots,
          playerPosition: isSeeker ? [14, 0.8, -12] : [0, 0.75, 0],
          stealthStatus: 'exposed',
        });
      },
    };
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
