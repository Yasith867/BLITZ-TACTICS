# BLITZ TACTICS - Real-Time Strategy Card Battler

## Project Overview
A real-time strategy card game built on Linera Microchains for the "Build Real-Time Onchain Apps" buildathon. This project demonstrates the full power of Linera's sub-0.5s finality, cross-chain messaging, and microchain architecture.

## Current State
✅ **MVP Complete** - Fully functional game with:
- Player microchain system
- AI vs Player battles
- Real-time card game UI
- Instant counter mechanics (<0.5s)
- GraphQL API layer
- Premium gaming design

## Project Structure
```
/
├── blitz-tactics/
│   ├── backend/          # Linera smart contracts (Rust)
│   └── frontend/         # React UI (TypeScript)
├── README.md             # Complete setup guide
├── ARCHITECTURE.md       # Technical deep-dive
└── BUILDATHON.md        # Judging criteria alignment
```

## Tech Stack
- **Backend**: Linera SDK 0.15.3, Rust, GraphQL
- **Frontend**: React 18.3, TypeScript, Vite, TailwindCSS, Framer Motion
- **Blockchain**: Linera Microchains

## Running the Project
The frontend development server is configured to run automatically on port 5000.

Access the game at: http://localhost:5000

## Linera Features Used
1. ⛓️ Microchains - Player chains + Match chains
2. 📬 Cross-Chain Messaging - Card plays, combat, rewards
3. 📊 GraphQL Services - Real-time queries
4. 📡 Event Streams - Spectator mode foundation
5. 🤖 Native Oracles - AI opponents
6. ⚡ Sub-0.5s Finality - Instant counters
7. 💾 Blob Storage - Card assets

## User Preferences
- **Design**: Electric Blue (#0EA5E9) + Neon Purple (#A855F7) gaming theme
- **Goal**: Win buildathon by showcasing ALL Linera features
- **Priority**: Fully functional, polished demo

## Recent Changes
- October 27, 2025: Initial MVP completed
  - Implemented player microchains
  - Created match microchains structure
  - Built React frontend with gaming theme
  - Added GraphQL service layer
  - Configured development workflow

## Next Steps
1. Deploy to Linera Testnet Conway
2. Implement PvP matchmaking
3. Add tournament system
4. Create NFT card marketplace

## Architecture Highlights
- **Player Microchain**: Permanent chain storing cards, stats, ranking
- **Match Microchain**: Temporary shared chain for each game (3-5 min lifetime)
- **Cross-Chain Flow**: Player→Match→Player for all game actions
- **Real-Time Updates**: GraphQL polling at 100ms intervals
- **AI System**: Oracle-based strategy using external APIs

## Contact
Built for Linera Buildathon - Wave 1 (October 20-29, 2025)
