# FlashChain Games - Product Requirements Document (PRD)

## 1. Overview
**FlashChain Games** is a real-time, on-chain gaming platform leveraging Linera's microchain architecture to deliver instant-finality gameplay. The flagship title is a decentralized Chess application where every move is a signed transaction verified on-chain, featuring an AI opponent powered by an off-chain agent.

## 2. Problem Statement
Traditional blockchain games suffer from:
- **High Latency**: Waiting for block confirmations ruins turn-based flow.
- **High Gas Costs**: Paying per move on L1s is prohibitively expensive.
- **Centralization**: Many "Web3" games are just Web2 databases with a token tacked on.

## 3. Solution: Linera Microchains
By assigning a dedicated **microchain** to each game instance:
- **Zero Latency**: Player interactions update their game chain instantly.
- **Infinite Scalability**: Parallel chains mean network congestion doesn't affect individual matches.
- **Verifiable Fairness**: Game logic (rules, turns, outcomes) is enforced by Rust smart contracts.

## 4. Core Features (MVP)
### 4.1 Gameplay
- **Instant Game Creation**: Spawns a new game microchain.
- **Player vs AI**:
  - User plays White.
  - AI Agent plays Black (submits signed moves via backend service).
- **Move Validation**:
  - Client-side: Optimistic UI updates via `chess.js`.
  - On-chain: Contract verifies legality, turn order, and timestamps.

### 4.2 User Interface
- **Cyberpunk/Deep Space Aesthetic**: Immersive design using TailwindCSS + Glassmorphism.
- **Real-time Board**: Drag-and-drop interface with `react-chessboard`.
- **Wallet Integration**: Simulated connection for signing moves.
- **Move History**: Standard algebraic notation log.

### 4.3 Technical Architecture
1.  **Frontend (React)**:
    *   Manages game state display.
    *   Signs user actions.
    *   Polls/Subscribes to chain events.
2.  **Smart Contract (Rust)**:
    *   Stores canonical `GameState` (FEN string).
    *   Validates `Action::MakeMove`.
    *   Emits `Event::MoveApplied`.
3.  **AI Agent (Node.js)**:
    *   Listens for player moves.
    *   Calculates response (Minimax/Stockfish).
    *   Submits counter-move transaction.

## 5. Future Scope
- **PvP Multiplayer**: Direct wallet-to-wallet challenges.
- **Wager Matches**: Lock tokens in the game contract; winner takes all.
- **NFT Minting**: Mint game replay as an NFT (PGN on-chain).
- **More Games**: Checkers, Poker (using zk-proofs for hidden info).
