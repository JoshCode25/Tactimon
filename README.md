# TactiMon

A tactical RPG combining Fire Emblem's grid-based combat with Pokemon's creature battles and type system, featuring sandbox exploration and team building.

## Game Overview

TactiMon is a tactical RPG where players control Pokemon in a sandbox environment, engaging in grid-based combat and recruiting other Pokemon to their team. The game combines tactical positioning with Pokemon-style battles in an explorable world.

### Core Mechanics

#### Movement System [✓]

- Grid-based movement with ranges determined by Pokemon's speed stat
  - Base movement = floor(speed/35) + 2 [✓]
  - Terrain effects (grass, water, mountains) affect movement [✓]
  - Visual indicators for valid movement tiles [✓]
- Team-based movement restrictions [✓]
  - Units can only move during their team's turn [✓]
  - Visual indicators for units that have already moved [✓]
- Unit states and indicators [✓]
  - Health bars with color coding [✓]
  - Team indicators (blue/red rings) [✓]
  - Level display [✓]
  - Leader star indicator [✓]
  - Movement status (grayed out when moved) [✓]

#### Turn System [✓]

- Alternating turns between Team 1 and Team 2 [✓]
- End Turn button with turn indicator [✓]
- Unit movement tracking per turn [✓]
- Visual feedback for current turn [✓]
- Unit state reset on turn change [✓]

#### Combat System [TODO]

**Move Types and Patterns**

- Basic Melee (range: 1, single target)
- Ranged Attacks (range: 2-3, single target)
- Line Effects (variable range, affects all tiles in a line)
- Cross Pattern (affects tiles in a + shape)
- Diamond Pattern (affects tiles in a ♦ shape)
- Square Pattern (affects all tiles in a square area)

**Tactical Elements** [In Progress]

- Line of sight requirements
- Team-based targeting rules [✓]
- Movement effects (knockback, pull, self-movement)
- Status effects and stat modifications
- PP (Power Points) management
- Priority system for turn order

**Damage Calculation**

- Physical vs Special moves
- STAB (Same Type Attack Bonus)
- Complete type effectiveness system implemented [✓]
- Critical hits
- Random variance

#### Pokemon System [Partially Complete]

**Stats** [✓]

- HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed [✓]
- Level-based stat calculation [✓]
- Status effects modify base stats [Implemented, not in use]
- Stats scale with level [✓]

**Experience System** [In progress]

- Gain XP equal to defeated Pokemon's level
- Required XP equals current level
- Excess XP carries over to next level

**Move Learning** [✓]

- Learn moves at specific levels [✓]
- Maximum of 4 moves per Pokemon [✓]
- Moves can be replaced with new ones
- Full move validation system implemented [✓]

**Recruitment System**

- Success chance based on:
  - Level difference
  - Target's remaining HP%
  - Status conditions
- Must attempt recruitment while in range
- Base recruitment difficulty calculated from stats

#### World System [Partially Complete]

**Map Features** [✓]

- Dynamic grid-based map system [✓]
- Terrain visualization [✓]
- Unit placement on tiles [✓]
- Interactive tile selection [✓]

**Map Types** [✓]

- Valley Map: Central valley surrounded by mountains and forests [✓]
- River Map: Strategic river crossings with varied terrain [✓]
- Fortress Map: Defensive structure with surrounding moat [✓]

**Terrain Types** [✓]

- Plains: Basic movement terrain [✓]
- Grass: Provides cover and tactical advantages [✓]
- Water: Creates movement barriers and choke points [✓]
- Mountain: Impassable terrain for most units [✓]
- Forest: Provides defensive bonuses [✓]

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
│   │   └── Unit.tsx         [✓] Pokemon unit rendering
│   ├── Battle/
│   │   ├── BattleScene.tsx
│   │   ├── MovePreview.tsx  [✓] Move targeting preview
│   │   ├── DamageCalc.tsx   [✓] Damage calculation system
│   │   └── Recruitment.tsx
│   └── UI/
│       ├── UnitInfo.tsx
│       ├── MoveSelection.tsx
│       ├── RangeIndicator.tsx [✓] Movement range visualization
│       └── TurnControls.tsx  [✓] Turn management UI
├── services/
│   ├── pokemonService.ts    [✓] Pokemon data and creation
│   ├── moveService.ts       [✓] Move validation and effects
│   ├── movementService.ts   [✓] Movement calculation
│   └── mapService.ts        [✓] Map management
├── types/
│   ├── pokemon.ts           [✓] Pokemon interfaces
│   ├── moves.ts             [✓] Move interfaces
│   ├── map.ts              [✓] Map interfaces
│   └── common.ts           [✓] Shared types
└── utils/
    ├── pathfinding.ts      [✓] Movement validation
    ├── lineOfSight.ts
    ├── damageFormulas.ts    [✓] Damage calculations
    └── typeEffectiveness.ts [✓] Type matchups
```

### Development Phases

1. **Phase 1: Core Systems** [✓]

   - ✓ Grid-based map rendering with terrain visualization
   - ✓ Interactive tile system
   - ✓ Predefined map layouts
   - ✓ Pokemon data management and creation
   - ✓ Move system implementation
   - ✓ Type effectiveness system
   - ✓ Basic Pokemon movement
   - ✓ Turn system
   - Combat system [TODO]

2. **Phase 2: Combat & Recruitment** [Next]

   - Move pattern implementation
   - Area of effect preview
   - Damage calculation
   - Status effects
   - Basic recruitment system
   - Team management

3. **Phase 3: World System** [Partially Complete]

   - Map transition system
   - Spawn system
   - Leader mechanics [✓]
   - Territory control
   - Advanced AI behaviors

4. **Phase 4: Polish**
   - Battle animations
   - Sound effects
   - UI improvements
   - Save/Load system
   - Tutorial system

### Recent Implementations

1. **Movement System**

   - Speed-based movement range calculation
   - Terrain cost system
   - Movement validation
   - Visual range indicators
   - Unit position updating

2. **Turn System**

   - Team-based turns
   - Movement tracking
   - Turn switching
   - Unit state reset
   - Visual indicators

3. **UI Improvements**
   - Enhanced unit visualization
   - Team color coding
   - Movement state indicators
   - Health bars
   - Turn controls

### Next Steps

1. Implement basic attack system
2. Add move selection UI
3. Implement damage calculation
4. Add simple battle animations

### Technical Notes

- Using React with TypeScript for type safety
- CSS Grid for map system
- Service-based architecture for game logic
- React Context for state management
- Efficient Pokemon data caching
- Modular move system
