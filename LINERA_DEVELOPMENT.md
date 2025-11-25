# Linera Blockchain Development Guide

## 1. Contract Architecture
FlashChain Games uses the **Microchain Pattern**.
- **Application ID**: One global ID for the Game Application code.
- **Chain ID**: Each match creates a *new* microchain (or uses a temporary one) to store its state. This ensures parallel scalability.

### Data Model (`lib.rs`)
```rust
pub struct GameState {
    pub board: String, // FEN string
    pub turn: Owner,
    pub status: GameStatus,
    pub history: Vec<String>,
}
```

## 2. Smart Contract Lifecycle
### Initialization
When a user calls `create_game(opponent_wallet)`:
1.  Contract initializes `GameState`.
2.  Sets `turn = White` (Creator).
3.  Emits `GameCreated` event.

### State Transitions (Moves)
When `make_move(from, to)` is called:
1.  **Check 1 (Auth)**: Is `message.sender == state.turn`?
2.  **Check 2 (Logic)**: Is the move legal on the current board? (Rust chess crate or simplified validation).
3.  **Update**: Apply move to FEN, switch turn, record history.
4.  **Event**: Emit `MoveMade(fen)`.

## 3. Frontend Integration
The React app communicates with the chain via **GraphQL**.

### Querying State
```graphql
query {
  chain(chainId: "...") {
    application(id: "...") {
      state {
        board
        turn
      }
    }
  }
}
```

### Submitting Transactions
```typescript
// Using @linera/client
await contract.mutation.makeMove({
  from: "e2",
  to: "e4"
});
```

## 4. Running Local Devnet
1.  Install Linera: `cargo install linera-service`
2.  Start Local Net: `linera-service net up`
3.  Deploy Contract: `linera publish-bytecode contracts/game_contract`
4.  Create Application: `linera create-application ...`
