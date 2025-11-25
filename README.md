# FlashChain Games - Real Time On-chain Chess & Cards

## Demo
Live demo: https://yourdomain.example (Conway testnet)

## Tech
- Linera microchains (contract: `/contracts/game_contract`)
- React + TypeScript frontend (`/web`)
- AI agent (optional `/ai-agent`)

## Run locally (dev)
1. Start Linera local testnet or use Conway testnet
2. `cd web && npm install && npm run dev`
3. `cd contracts && cargo build`
4. For AI: `cd ai-agent && npm install && npm run start`

## Submission
- Contract path: `/contracts/game_contract`
- Live demo link: [Add Link Here]
- Wallets: [Add Wallet Addresses]
- Changelog: `CHANGELOG.md`

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS. Uses `chess.js` for game logic and `linera-client` for signing.
- **Smart Contract**: Rust. Manages game state, turn enforcement, and timeouts.
- **AI Agent**: Node.js service that listens to chain events and submits moves via signed transactions.
