# 🏗️ BLITZ TACTICS - Technical Architecture

This document provides a comprehensive technical overview of how BLITZ TACTICS leverages Linera's microchain architecture to deliver a real-time gaming experience.

---

## 🎯 Core Architecture Principles

### 1. Microchain-First Design
Every entity in the game gets its own microchain:
- **Players** = Personal microchains
- **Matches** = Temporary shared microchains  
- **Tournaments** = Public microchains

### 2. Asynchronous Cross-Chain Communication
All interactions between chains happen via message passing:
- No shared global state
- Fully parallelizable
- Scales horizontally with user count

### 3. Real-Time State Synchronization
GraphQL services provide live updates:
- Client polls every 100ms
- Push notifications for critical events
- Optimistic UI updates

---

## 🔧 System Components

### Backend (Linera Smart Contracts)

#### **1. State Management (`state.rs`)**

Uses `linera-views` for efficient storage:

```rust
#[derive(RootView)]
pub struct BlitzTacticsState {
    // Map player wallets to their stats
    pub players: MapView<AccountOwner, PlayerStats>,
    
    // Active games indexed by player
    pub active_matches: MapView<AccountOwner, GameState>,
    
    // Card database (shared immutable data)
    pub card_database: RegisterView<Vec<Card>>,
    
    // Global statistics
    pub total_games_played: RegisterView<u64>,
}
```

**Key Features:**
- `MapView` - Key-value storage with lazy loading
- `RegisterView` - Single value storage
- Automatic serialization/deserialization
- Optimized for microchain state size

#### **2. Contract (`contract.rs`)**

Handles write operations:

```rust
impl Contract for BlitzTacticsContract {
    async fn execute_operation(&mut self, operation: Operation) {
        match operation {
            Operation::CreatePlayerProfile => {
                // Initialize player microchain
                let owner = self.runtime.authenticated_signer()?;
                self.state.create_player(owner).await?;
            }
            
            Operation::PlayCard { card_id } => {
                // Validate move, update game state
                // Send cross-chain message to match microchain
            }
            
            Operation::InstantCounter { card_id, target_card } => {
                // Sub-0.5s response to opponent action
                // Showcases Linera's speed advantage
            }
        }
    }
}
```

**Transaction Flow:**
1. User signs operation with wallet
2. Operation submitted to player's microchain
3. Microchain validates and executes
4. Cross-chain messages sent if needed
5. Certificate generated (<0.5s)

#### **3. Service (`service.rs`)**

Provides GraphQL API:

```rust
#[Object]
impl QueryRoot {
    async fn player_stats(&self, owner: String) -> Option<PlayerStats> {
        // Read-only access to state
        self.state.get_player_stats(&owner).await
    }
    
    async fn card_database(&self) -> Vec<Card> {
        // Shared immutable card data
        self.state.card_database.get().clone()
    }
}
```

**API Endpoints:**
- `playerStats(owner)` - Get player profile
- `cardDatabase()` - List all available cards
- `totalGames()` - Global statistics
- `activeMatch(player)` - Current game state

---

## ⛓️ Microchain Types

### 1. Player Microchain (Personal)

**Purpose**: Store player assets and stats

**Schema**:
```rust
pub struct PlayerStats {
    pub owner: AccountOwner,      // Wallet address
    pub wins: u32,                 // Total victories
    pub losses: u32,               // Total defeats
    pub draws: u32,                // Tied games
    pub ranking: u32,              // ELO-style rating
    pub total_matches: u32,        // Games played
    pub cards_owned: Vec<u32>,     // Card IDs in collection
}
```

**Lifetime**: Permanent (while player is active)

**Operations**:
- `CreatePlayerProfile` - Initialize new player
- `UpdateStats` - Record match results
- `AddCard` - Acquire new card
- `TransferCard` - Trade with other players

---

### 2. Match Microchain (Temporary Shared)

**Purpose**: Isolated game instance for 1v1 battles

**Schema**:
```rust
pub struct GameState {
    pub player1: PlayerInGame,
    pub player2: PlayerInGame,
    pub current_turn: u8,          // 1 or 2
    pub turn_timer: Timestamp,     // 5-second countdown
    pub game_phase: GamePhase,     // WaitingForPlayers | Playing | Finished
    pub winner: Option<u8>,        // None while ongoing
}

pub struct PlayerInGame {
    pub owner: AccountOwner,
    pub health: i32,               // 20 starting HP
    pub mana: u32,                 // Resource for cards
    pub hand: Vec<Card>,           // Cards in hand
    pub deck: Vec<u32>,            // Remaining cards
    pub field: Vec<Card>,          // Creatures in play
    pub graveyard: Vec<u32>,       // Discarded cards
}
```

**Lifetime**: 3-5 minutes (duration of match)

**Operations**:
- `PlayCard` - Play card from hand
- `AttackPlayer` - Direct damage
- `AttackCreature` - Combat between creatures
- `InstantCounter` - React to opponent (<0.5s)
- `EndTurn` - Pass priority

**Creation Flow**:
```
Player 1 Microchain
    ├─> CreateMatch { opponent: Player2 }
    │
    └─> Validator creates new Match Microchain
            │
            ├─> Add Player1 as owner
            ├─> Add Player2 as owner
            ├─> Initialize game state
            │
            └─> Send MatchCreated messages to both players
```

**Destruction Flow**:
```
Match Microchain
    ├─> Game ends (winner determined)
    │
    ├─> Send GameFinished messages to player microchains
    │       ├─> Update Player1 stats (win/loss)
    │       └─> Update Player2 stats (win/loss)
    │
    └─> Match microchain archived (can be pruned later)
```

---

### 3. Tournament Microchain (Public)

**Purpose**: Manage competitive events

**Schema** (Roadmap):
```rust
pub struct Tournament {
    pub id: u64,
    pub name: String,
    pub participants: Vec<AccountOwner>,
    pub bracket: TournamentBracket,
    pub prize_pool: Amount,
    pub status: TournamentStatus,
}
```

**Lifetime**: Hours to days

**Managed by**: Validators using leader election

---

## 📬 Cross-Chain Messaging

### Message Types

```rust
pub enum Message {
    // Match creation notification
    MatchCreated {
        match_chain: ChainId,
        player1: AccountOwner,
        player2: AccountOwner,
    },
    
    // Card played in match
    CardPlayed {
        player: AccountOwner,
        card: Card,
    },
    
    // Turn ended
    TurnEnded {
        next_player: AccountOwner,
    },
    
    // Game finished
    GameFinished {
        winner: Option<AccountOwner>,
        rewards: Amount,
    },
    
    // Instant counter activated (<0.5s)
    CounterActivated {
        player: AccountOwner,
        counter_card: Card,
        target_card: u32,
    },
}
```

### Message Flow Example

**Scenario**: Player 1 plays Lightning Bolt, Player 2 counters with Nullify

```
1. Player1 Microchain
   └─> PlayCard { card_id: 1 (Lightning Bolt) }
       │
       └─> Message to Match Microchain

2. Match Microchain (receives message at T=0ms)
   └─> Validate: Player1's turn? Has mana? Card in hand?
       └─> Update game state
           └─> Broadcast CardPlayed to Player2 Microchain

3. Player2 Microchain (receives at T=50ms)
   └─> UI shows "Lightning Bolt incoming!"
       └─> Player2 clicks Nullify (at T=200ms)
           │
           └─> InstantCounter { card_id: 4, target_card: 1 }
               │
               └─> Message to Match Microchain

4. Match Microchain (receives at T=250ms)
   └─> Validate: Counter is instant? Player2 has card? Has mana?
       └─> Cancel Lightning Bolt effect
           └─> Broadcast CounterActivated to both players

5. Both Player Microchains (receive at T=450ms)
   └─> UI updates: "Lightning Bolt countered!"

Total time: 450ms (<0.5s) ✅
```

**Key Insight**: This speed is impossible on traditional blockchains due to:
- Mempool delays (seconds to minutes)
- Block production time (12s on Ethereum)
- Finality delays (epochs on PoS chains)

---

## 🤖 AI Opponent System

### Oracle Integration

Linera's native oracle support allows contracts to:
1. Make HTTP requests to external APIs
2. Perform non-deterministic computations
3. Access real-time data

**AI Implementation**:

```rust
Operation::RequestAIMove => {
    // Call external AI API via oracle
    let game_state = self.state.get_current_game()?;
    
    // Non-deterministic oracle call
    let ai_decision = self.runtime.query_oracle(
        "https://ai-api.example.com/get-move",
        json!({
            "game_state": game_state,
            "difficulty": "medium",
        })
    ).await?;
    
    // Execute AI's chosen move
    self.execute_ai_move(ai_decision).await?;
}
```

**AI Decision Factors**:
- Current health differential
- Mana efficiency
- Board control
- Threat assessment
- Win condition proximity

---

## 📊 GraphQL Real-Time Updates

### Frontend Polling Strategy

```typescript
// Apollo Client setup
const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  pollInterval: 100, // Poll every 100ms
  cache: new InMemoryCache(),
})

// Query game state
const { data, loading } = useQuery(GAME_STATE_QUERY, {
  variables: { playerId: currentPlayer },
  pollInterval: 100,
})
```

### Event Streams (Linera Native)

Replace polling with push notifications:

```rust
// Contract emits events
self.runtime.emit_event(GameEvent::CardPlayed {
    player: owner,
    card: card.clone(),
});

// Frontend subscribes
subscription {
  gameEvents(matchId: "...") {
    ... on CardPlayedEvent {
      player
      card {
        name
        attack
        defense
      }
    }
  }
}
```

**Benefits**:
- Zero polling overhead
- Instant updates
- Lower bandwidth usage

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Header (navigation)
├── Router
    ├── HomePage (landing + matchmaking)
    ├── GameBoard (main game UI)
    │   ├── OpponentArea
    │   │   └── HealthBar
    │   ├── TurnTimer
    │   ├── PlayerField
    │   │   └── Card (multiple)
    │   ├── PlayerHand
    │   │   └── Card (multiple)
    │   └── GameInfo
    ├── Dashboard (stats and history)
    │   ├── StatCard (multiple)
    │   ├── MatchHistory
    │   └── Achievements
    └── Collection (card catalog)
        └── Card (multiple)
```

### State Management

Using Zustand for global state:

```typescript
interface GameStore {
  playerHealth: number
  opponentHealth: number
  playerMana: number
  hand: Card[]
  field: Card[]
  isPlayerTurn: boolean
  
  playCard: (card: Card) => void
  endTurn: () => void
  updateFromChain: (state: GameState) => void
}

const useGameStore = create<GameStore>((set) => ({ ... }))
```

---

## 🔐 Security Considerations

### 1. Move Validation
All moves validated on-chain:
- Client cannot cheat
- Server enforces rules
- Cryptographic proofs

### 2. Turn Timing
Enforced by blockchain timestamps:
- No manual timer manipulation
- Automatic turn timeout
- Provable game history

### 3. Card Ownership
NFT-based card system (roadmap):
- Provable scarcity
- Verifiable ownership
- Secure trading

---

## 📈 Scalability Analysis

### Theoretical Limits

**Traditional Blockchain**:
- 1 global chain
- 15 TPS (Ethereum)
- 1000 concurrent games = 66ms per game update
- **Bottleneck**: Shared state

**Linera Microchains**:
- Unlimited microchains
- Unlimited TPS
- 1,000,000 concurrent games = <0.5s per game update
- **No bottleneck**: Isolated state

### Cost Analysis

**Per Match**:
- Create match microchain: 1 transaction
- Card plays: ~20 transactions
- End match: 1 transaction
- Total: ~22 transactions per match

**At Scale**:
- 10,000 concurrent matches = 220,000 TPS
- Linera validators scale elastically
- No congestion or gas wars

---

## 🚀 Deployment

### Local Development

```bash
# Start local Linera network
linera net up --with-faucet --faucet-port 8080

# Initialize wallet
linera wallet init --faucet http://localhost:8080

# Build contracts
cd backend
cargo build --release --target wasm32-unknown-unknown

# Deploy
linera publish-and-create \
  target/wasm32-unknown-unknown/release/blitz_tactics_{contract,service}.wasm \
  --json-argument "{}"

# Start service
linera service --port 8080
```

### Testnet Deployment

```bash
# Connect to Testnet Conway
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# Request test chain
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Deploy (same as local)
linera publish-and-create ...
```

---

## 🔮 Future Enhancements

### Phase 2
- **EVM Compatibility**: Solidity contracts
- **Mobile Client**: Native iOS/Android apps
- **Wallet Connect**: External wallet integration

### Phase 3
- **ZK Proofs**: Private hand contents
- **Walrus Integration**: Decentralized asset storage
- **Geographic Sharding**: Regional latency optimization

---

## 📚 References

- [Linera Developer Docs](https://linera.dev)
- [Linera Whitepaper](https://linera.io)
- [linera-sdk Documentation](https://docs.rs/linera-sdk)
- [Microchains Explained](https://linera.io/news/microchains-in-linera)

---

**Last Updated**: October 2025  
**Linera SDK Version**: 0.15.3  
**Testnet**: Conway (Testnet #3)
