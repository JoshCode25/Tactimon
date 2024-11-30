# TactiMon

A tactical RPG combining Fire Emblem's grid-based combat with Pokemon's creature battles and type system, featuring sandbox exploration and team building.

## Game Overview

TactiMon is a tactical RPG where players control Pokemon in a sandbox environment, engaging in grid-based combat and recruiting other Pokemon to their team. The game combines tactical positioning with Pokemon-style battles in an explorable world.

### Core Mechanics

#### Movement System

- Grid-based movement with ranges determined by Pokemon's speed stat
- Terrain effects (grass increases evasion, water slows ground types, etc.)
- Map transition system requiring team proximity to leader
- Simple in-map battle animations without scene transitions

#### Combat System

**Move Types and Patterns**

- Basic Melee (range: 1, single target)
- Ranged Attacks (range: 2-3, single target)
- Line Effects (variable range, affects all tiles in a line)
- Cross Pattern (affects tiles in a + shape)
- Diamond Pattern (affects tiles in a ♦ shape)
- Square Pattern (affects all tiles in a square area)

**Tactical Elements**

- Line of sight requirements
- Team-based targeting rules
- Movement effects (knockback, pull, self-movement)
- Status effects and stat modifications
- PP (Power Points) management
- Priority system for turn order

**Damage Calculation**

- Physical vs Special moves
- STAB (Same Type Attack Bonus)
- Complete type effectiveness system implemented
- Critical hits
- Random variance

#### Pokemon System

**Stats**

- HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed
- Level-based stat calculation
- Status effects modify base stats
- Stats scale with level (implemented)

**Experience System**

- Gain XP equal to defeated Pokemon's level
- Required XP equals current level cubed
- Excess XP carries over to next level

**Move Learning**

- Learn moves at specific levels (implemented)
- Maximum of 4 moves per Pokemon
- Moves can be replaced with new ones
- Full move validation system implemented

**Recruitment System**

- Success chance based on:
  - Level difference
  - Target's remaining HP%
  - Status conditions
- Must attempt recruitment while in range
- Base recruitment difficulty calculated from stats

#### World System

**Map Features**

- Dynamic grid-based map system (implemented)
- Terrain visualization (implemented)
- Unit placement on tiles (implemented)
- Interactive tile selection (implemented)

**Map Types** (Implemented)

- Valley Map: Central valley surrounded by mountains and forests
- River Map: Strategic river crossings with varied terrain
- Fortress Map: Defensive structure with surrounding moat

**Terrain Types** (Implemented)

- Plains: Basic movement terrain
- Grass: Provides cover and tactical advantages
- Water: Creates movement barriers and choke points
- Mountain: Impassable terrain for most units
- Forest: Provides defensive bonuses

## Technical Implementation

### Architecture

```
src/
├── components/
│   ├── Map/
│   │   ├── Grid.tsx          [✓] Grid layout and rendering
│   │   ├── Tile.tsx         [✓] Individual tile with terrain
│   │   ├── GameMap.tsx      [✓] Main map container
│   │   ├── MapTransition.tsx
│   │   └── Unit.tsx
│   ├── Battle/
│   │   ├── BattleScene.tsx
│   │   ├── MovePreview.tsx  [✓] Move targeting preview
│   │   ├── DamageCalc.tsx   [✓] Damage calculation system
│   │   └── Recruitment.tsx
│   └── UI/
│       ├── UnitInfo.tsx
│       ├── MoveSelection.tsx
│       ├── RangeIndicator.tsx
│       └── TeamStatus.tsx
├── services/
│   ├── pokemonService.ts    [✓] Pokemon data and creation
│   ├── moveService.ts       [✓] Move validation and effects
│   ├── battleService.ts
│   └── mapService.ts        [✓] Map management
├── types/
│   ├── pokemon.ts           [✓] Pokemon interfaces
│   ├── moves.ts             [✓] Move interfaces
│   ├── map.ts              [✓] Map interfaces
│   └── common.ts           [✓] Shared types
└── utils/
    ├── pathfinding.ts
    ├── lineOfSight.ts
    ├── damageFormulas.ts    [✓] Damage calculations
    └── typeEffectiveness.ts [✓] Type matchups
```

### Development Phases

1. **Phase 1: Core Systems** [In Progress]

   - ✓ Grid-based map rendering with terrain visualization
   - ✓ Interactive tile system
   - ✓ Predefined map layouts
   - ✓ Pokemon data management and creation
   - ✓ Move system implementation
   - ✓ Type effectiveness system
   - Basic Pokemon movement [TODO]
   - Simple combat system [TODO]
   - Turn order management [TODO]

2. **Phase 2: Combat & Recruitment** [Next]

   - Move pattern implementation
   - Area of effect preview
   - Damage calculation
   - Status effects
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

- React with TypeScript for type safety
- CSS Grid for map system
- Service-based architecture for game logic ✓
- React Context for state management ✓
- Efficient Pokemon data caching ✓
- Modular move system ✓

### Recent Implementations

1. **Pokemon Service**

   - Pokemon template caching
   - Stat calculation system
   - Move learning system
   - Evolution chain handling

2. **Move Service**

   - Complete type effectiveness chart
   - Move validation system
   - Area of effect calculations
   - Team-based targeting rules

3. **Map System**
   - Grid-based rendering
   - Terrain visualization
   - Unit placement
   - Interactive tiles

### Next Steps

1. Implement Pokemon movement and pathfinding
2. Create move preview system
3. Develop basic combat flow
4. Add turn management
