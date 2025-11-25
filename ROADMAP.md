# FlashChain Games - Roadmap

## Phase 1: Prototype (Current Status)
- [x] **Frontend UI**: Cyberpunk aesthetic, responsive board, move history.
- [x] **Game Logic**: Client-side validation with `chess.js`.
- [x] **AI Integration**: Basic "Random/Simple" AI agent responding to player moves.
- [x] **Simulation Layer**: Mock `gameService` simulating Linera microchain latency and transactions.
- [x] **Persistence**: LocalStorage support for game state recovery.

## Phase 2: Linera Testnet Integration (Next Steps)
- [ ] **Smart Contract Deployment**:
    - Deploy `game_contract` to Linera Conway Testnet.
    - Implement strict FEN parsing and move validation in Rust.
- [ ] **Client SDK Hookup**:
    - Replace `MOCK_GAMES` with actual `linera-client` GraphQL subscriptions.
    - Implement real wallet signing (Linera Extension / JSON-RPC).
- [ ] **AI Agent Service**:
    - Dockerize the Node.js agent.
    - Give the Agent a funded wallet to pay for its moves on testnet.

## Phase 3: Enhanced Gameplay & Security
- [ ] **Strict Turn Timers**: On-chain clock enforcement (lose on timeout).
- [ ] **Cheat Detection**: Verify move legality deeply on-chain (prevent invalid FEN injection).
- [ ] **State Channels**: Explore using Linera's multi-owner chains for even faster P2P updates.

## Phase 4: Mainnet & Expansion
- [ ] **Mainnet Launch**: Deploy contracts to Linera Mainnet.
- [ ] **Token Integration**: Add wagering (LIN or custom tokens).
- [ ] **Leaderboards**: Indexer service to track wins/losses globally.
