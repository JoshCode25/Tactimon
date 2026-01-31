# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TactiMon is a tactical RPG that combines Fire Emblem's grid-based combat with Pokemon's creature battles and type system. Built with React and TypeScript, it features turn-based combat, team management, and strategic positioning gameplay.

## Development Commands

### Running the Application
```bash
npm start                 # Start development server
npm run build            # Build for production
npm run deploy           # Deploy to GitHub Pages
npm test                 # Run tests in watch mode
```

### Testing
- Tests use React Testing Library and Jest
- Configuration is in `src/setupTests.ts`
- Run with `npm test`

## Architecture Overview

### State Management Pattern
The application uses **React Context + Reducer pattern** for global state management (`src/store/GameContext.tsx`). All game state is centralized in a single reducer with typed actions. This is the core of the application.

**Critical:** The reducer maintains TWO sources of truth for Pokemon:
1. `state.units` - Record<string, Pokemon> keyed by `templateId` (authoritative)
2. `state.mapState.tiles[y][x].unit` - Pokemon references on tiles

When updating Pokemon state, ALWAYS update BOTH locations. The units record should be updated first, then tiles should reference the updated Pokemon. Failing to do this causes desync bugs where units have outdated `hasMoved`/`hasAttacked` flags.

### Data Flow
1. User interaction → Component event handler
2. Component dispatches action to GameContext
3. Reducer processes action, updates state
4. React re-renders affected components

### Key State Synchronization Points
- **Movement**: Updates unit position in both `units` record and tile references
- **Combat**: Updates attacker (PP, flags) and target (HP, status) in both locations
- **Turn End**: Resets `hasMoved` and `hasAttacked` flags for all units in BOTH locations
- **Experience/Leveling**: Updates stats and level in units record, then propagates to tiles

### Service Architecture

Services use the **Singleton pattern** for shared game logic:

- **PokemonService** (`src/services/pokemonService.ts`):
  - Fetches Pokemon data from PokeAPI
  - Maintains in-memory cache to avoid repeated API calls
  - Calculates level-based stats using formula: `floor((2 * baseStat * level) / 100 + offset)`
  - Creates Pokemon instances with moves, stats, and metadata

- **MoveService** (`src/services/moveService.ts`):
  - Validates move usage (range, PP, line of sight, targeting)
  - Calculates damage using Pokemon-style formula with STAB and type effectiveness
  - Contains complete 18-type effectiveness chart
  - Determines valid targets based on move tactical properties

- **MovementService** (`src/services/movementService.ts`):
  - Calculates movement range: `floor(speed/35) + 2`
  - Applies terrain costs (plains: 1x, forest: 1.5x, water: 2x)
  - Enforces type-based terrain restrictions (e.g., Fire can't enter water)
  - Uses Manhattan distance for range validation

### Type System Organization

Types are modular and co-located by domain:

- `types/pokemon.ts` - Pokemon, PokemonTemplate, BaseStats, StatusEffect
- `types/moves.ts` - Move, MoveTemplate, TacticalMoveProperties
- `types/map.ts` - MapTile, MapState, TeamId
- `types/game.ts` - GameState, GamePhase
- `types/common.ts` - Position, ElementalType, TerrainType

### Component Structure

- **Map Components** (`src/components/Map/`):
  - `GameMap.tsx` - Main container, handles tile selection and dispatches actions
  - `Grid.tsx` - Renders tile grid using CSS Grid
  - `Tile.tsx` - Individual tile with terrain styling
  - `Unit.tsx` - Pokemon sprite and status indicators (HP bar, team ring, level)

- **Battle Components** (`src/components/Battle/`):
  - `BattleControls.tsx` - Move selection UI, dispatches SELECT_MOVE and EXECUTE_ATTACK
  - `MoveTooltip.tsx` - Shows move details on hover

- **UI Components** (`src/components/UI/`):
  - `TurnControls.tsx` - End turn button, dispatches END_TURN
  - `NotificationContainer.tsx` - Displays battle events and level-ups
  - `BattleNotification.tsx` - Individual notification with auto-dismiss

### Game State Lifecycle

**Turn Flow:**
1. Units start with `hasMoved: false, hasAttacked: false`
2. Player selects unit → Shows movement range (if !hasMoved)
3. Player moves unit → Sets `hasMoved: true`
4. Player selects move → Shows valid targets (if !hasAttacked)
5. Player executes attack → Sets `hasAttacked: true`, reduces PP
6. Player ends turn → Resets ALL units' flags, switches to opposite team

**Combat Flow:**
1. SELECT_MOVE action → Phase changes to 'combat', shows valid targets
2. Tile click on valid target → Dispatches EXECUTE_ATTACK
3. Reducer calculates damage, updates HP, checks for faint
4. If target faints:
   - Attacker gains XP equal to target's level
   - XP processing can trigger level-ups (multiple levels possible)
   - Level-up restores HP to full and may unlock new moves
   - Team 2 (wild) Pokemon are removed and replaced via spawn system
   - Team 1 Pokemon remain on map in fainted state
5. Phase returns to 'movement'

### Experience and Leveling

Experience system (`src/utils/experienceUtils.ts`):
- Gained XP = defeated Pokemon's level
- Level-up requirement = current level (e.g., level 5 needs 5 XP to reach 6)
- Excess XP carries over to next level
- Multiple level-ups can occur from a single battle
- Stats recalculated on level-up using base stats from template
- HP restored to full on level-up
- New moves learned at specific levels (checked during level-up)

### Spawn System

When Team 2 (wild) Pokemon faint (`src/utils/spawnUtils.ts`):
1. Fainted Pokemon removed from map and units record
2. New Pokemon spawned at random empty position (not water/mountain)
3. New Pokemon pulled from queue system (`pokemonQueService`)
4. Level based on fainted Pokemon's level
5. Notification shown to player

### PokeAPI Integration

The app fetches Pokemon data from `https://pokeapi.co/api/v2`:
- `/pokemon/{name}` - Base stats, types, sprites, moves
- Evolution chains fetched via species URL
- Move data includes power, accuracy, PP, type, category
- All data cached in `PokemonService.templateCache` to minimize API calls

### Map Generation

Maps are predefined and generated programmatically (`src/config/maps.ts`):
- 8x8 grid with varied terrain
- Three map types: Valley, River, Fortress
- Random map selected on game start
- Each map has strategic terrain placement (choke points, barriers)

## Common Patterns

### Adding New Actions
1. Add action type to `GameAction` union in `GameContext.tsx`
2. Add case to reducer with state update logic
3. Remember to update BOTH `units` record and tile references for Pokemon changes
4. Dispatch from component: `dispatch({ type: 'ACTION_NAME', payload: data })`

### Creating New Pokemon
```typescript
const pokemon = await pokemonService.createPokemon(
  'pikachu',           // Pokemon name
  5,                   // Level
  { x: 2, y: 2 },     // Position
  {
    teamId: 'team1',
    isLeader: true,
    nickname: 'Sparky'
  }
);

dispatch({ type: 'ADD_UNITS', payload: [pokemon] });
```

### Damage Calculation
Follows Pokemon formula:
```
damage = (((2 * level / 5 + 2) * power * attack / defense) / 50 + 2)
       * STAB (1.5 if move type matches user type)
       * TypeEffectiveness (0, 0.5, 1, or 2)
       * Random(0.85-1.0)
```

### Movement Range Calculation
```
baseRange = floor(speedStat / 35) + 2
effectiveRange = baseRange / terrainCostMultiplier
```

### Working with Game Phases
- `'movement'` - Default phase, allows unit selection and movement
- `'combat'` - Active when move selected, shows valid targets
- `'enemy'` - Reserved for future AI implementation

## Current Implementation Status

### Completed
- Grid-based map system with terrain types
- Turn-based gameplay with alternating teams
- Pokemon movement with speed-based range
- Combat system with damage calculation
- Type effectiveness (all 18 types)
- Experience and level-up system
- Move learning at level thresholds
- Faint handling and spawn system
- HP restoration on level-up
- Notification system for events

### In Progress / TODO
- Move range and area-of-effect patterns (currently all moves are range 1)
- Recruitment system
- Status effects application
- Line of sight validation
- Priority system for turn order
- Healing spaces
- Territory control
- Save/Load system

## Development Notes

### Known Patterns to Follow
- Always use `pokemon.templateId` as the unique identifier
- Access Pokemon template data via `pokemonService.getTemplate(templateId)`
- Movement validation checks terrain restrictions based on Pokemon type
- All positions use `{x, y}` coordinate objects
- Team IDs are `'team1'` or `'team2'` (string literals, not numbers)

### Common Pitfalls
- Don't modify state directly - always return new objects from reducer
- Don't forget to update tile references when modifying Pokemon in units record
- Don't use array indices as keys - use `templateId` for Pokemon
- Don't make direct API calls from components - use PokemonService
- Remember that `hasMoved` and `hasAttacked` are independent flags (unit can attack before moving)

### GitHub Pages Deployment
- Deployed to: `https://JoshCode25.GitHub.io/Tactimon`
- Uses `gh-pages` package
- Build output in `build/` directory
- Run `npm run deploy` to build and publish
