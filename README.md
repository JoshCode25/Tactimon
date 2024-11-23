# TactiMon
A tactical RPG combining Fire Emblem's grid-based combat with Pokemon's creature battles and type system, featuring sandbox exploration and team building.

## Game Overview
TactiMon is a tactical RPG where players control a Pokemon in a sandbox environment, engaging in grid-based combat and recruiting other Pokemon to their team. The game combines tactical positioning with Pokemon-style battles in an explorable world.

### Core Mechanics

#### Movement System
- Grid-based movement with ranges determined by Pokemon's speed stat
- Terrain effects (grass increases evasion, water slows ground types, etc.)
- Map transition system requiring team proximity to leader
- Simple in-map battle animations without scene transitions

#### Combat System
- Turn-based combat using Fire Emblem's team-phase system
- Pokemon-style type effectiveness
- Friendly fire mechanics
- Attack Categories:
  1. Basic Melee (1 range, 1 AoE)
  2. Simple Ranged (2-3 range, 1 AoE)
  3. Line Effect (1 range, 2-3 AoE in line)
  4. Small Surrounding (1 range, 4 orthogonal spaces)
  5. Medium Surrounding (1 range, 8 adjacent spaces)
  6. Large Surrounding (2 range, all spaces within 2)
  7. Medium Range AoE (2-4 range, 3-5 AoE)
  8. Long Range Precise (3-5 range, 1 AoE)

#### Pokemon System
- Stats: HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed
- Simplified Experience System:
  - Gain XP equal to defeated Pokemon's level
  - Required XP equals current level
  - Excess XP carries over to next level
- Recruitment System:
  - Success chance based on:
    - Level difference
    - Target's remaining HP%
    - Status conditions
  - Must attempt recruitment while in range

#### World System
- Zelda-style map transitions
- Dynamic Pokemon spawning
- Territory control mechanics
- Team proximity requirements for map transitions
- Various terrain types affecting movement and combat

## Technical Implementation

### Architecture
```
src/
├── components/
│   ├── Map/
│   │   ├── Grid.tsx
│   │   ├── Tile.tsx
│   │   ├── MapTransition.tsx
│   │   └── Unit.tsx
│   ├── Battle/
│   │   ├── BattleScene.tsx
│   │   ├── AttackPatterns.tsx
│   │   ├── DamageCalculation.tsx
│   │   └── RecruitmentSystem.tsx
│   └── UI/
│       ├── UnitInfo.tsx
│       ├── MovementRange.tsx
│       ├── AttackPreview.tsx
│       └── TeamStatus.tsx
├── store/
│   ├── gameState.ts
│   ├── mapState.ts
│   ├── teamState.ts
│   └── battleState.ts
├── types/
│   ├── Pokemon.ts
│   ├── Attack.ts
│   ├── Terrain.ts
│   └── MapSection.ts
└── utils/
    ├── pathfinding.ts
    ├── combatCalculator.ts
    ├── experienceManager.ts
    ├── recruitmentCalculator.ts
    └── typeEffectiveness.ts
```

### Core Systems Implementation

1. **Pokemon Management**
```typescript
interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

interface Evolution {
  level: number;
  evolvesInto: number; // Pokemon ID
  conditions?: {
    item?: string;
    timeOfDay?: 'day' | 'night';
    friendship?: number;
    // Add other conditions as needed
  };
}

interface LearnableMove {
  level: number;
  moveId: number;
}

interface PokemonTemplate {
  id: number;
  name: string;
  types: ElementalType[];
  baseStats: BaseStats;
  learnableMoves: LearnableMove[];
  evolution?: Evolution;
  baseExperienceYield: number;
  recruitDifficulty: number; // Base difficulty for recruiting this Pokemon
}

interface Pokemon {
  templateId: number; // References PokemonTemplate
  nickname?: string;
  level: number;
  experience: number;
  currentStats: {
    hp: number;
    currentHp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  moves: Move[]; // Current moves (max 4)
  position: Position;
  isLeader: boolean;
  status?: StatusEffect;
  friendship: number;
}

interface Move {
  name: string;
  type: ElementalType;
  category: AttackCategory;
  range: Range;
  areaOfEffect: AreaOfEffect;
  power: number;
  accuracy: number;
  effects?: StatusEffect[];
}
```

2. **Map System**
```typescript
interface MapSection {
  id: string;
  terrain: TerrainType[][];
  spawnPoints: SpawnPoint[];
  connections: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
}

interface Position {
  x: number;
  y: number;
  mapId: string;
}
```

### Development Phases

1. **Phase 1: Core Systems**
   - Grid-based map rendering
   - Basic Pokemon movement
   - Simple combat system
   - Turn order management
   - Keyboard controls

2. **Phase 2: Combat & Recruitment**
   - Attack pattern implementation
   - Area of effect preview system
   - Damage calculation
   - Basic recruitment system
   - Team management

3. **Phase 3: World System**
   - Map transition system
   - Spawn system
   - Leader mechanics
   - Territory control
   - Advanced AI behaviors

4. **Phase 4: Polish**
   - Battle animations
   - Sound effects
   - UI improvements
   - Save/Load system
   - Tutorial system

### Technical Considerations

- Using React with TypeScript for type safety and component architecture
- Starting with CSS Grid for the map system
- Implementing keyboard controls (arrow keys, enter, etc.) for gameboy-style control
- Using Canvas for attack pattern previews and animations
- Implementing a custom pathfinding system for movement range calculation
- Using React Context for state management between components
