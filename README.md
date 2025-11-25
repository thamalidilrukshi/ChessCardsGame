# FlashChain Games

**Real-Time On-Chain Chess powered by Linera Microchains.**

> ⚡ **Instant Finality** | 🤖 **Play vs AI** | 🛡️ **Fully Decentralized**

## Overview
FlashChain Games demonstrates the power of **Linera's Microchain Architecture** by putting a real-time strategy game fully on-chain. Unlike traditional blockchains where gameplay is slow and expensive, FlashChain offers a lag-free experience where every move is a signed transaction on a dedicated microchain.

## 🎮 Play Now (Demo)
1.  Click **Connect Wallet** (Simulated).
2.  Click **New Game** to spawn a match.
3.  Play as **White** against the **FlashChain AI Agent**.
4.  Experience instant optimistic updates backed by "chain" simulations.

## 🚀 Tech Stack
-   **Frontend**: React 18, TypeScript, TailwindCSS, Framer Motion.
-   **Game Engine**: `chess.js` (Logic), `react-chessboard` (UI).
-   **Blockchain**: Linera Protocol (Rust Smart Contracts).
-   **AI Agent**: Node.js off-chain service.

## 📂 Project Structure
-   `/client`: React Frontend Application.
-   `/contracts`: Rust Smart Contracts for Linera.
-   `/ai-agent`: Node.js Bot Service.
-   `PRD.md`: Product Requirements.
-   `ROADMAP.md`: Future development plans.
-   `LINERA_DEVELOPMENT.md`: Technical guide for on-chain logic.

## 🛠️ Local Development
1.  Install dependencies: `npm install`
2.  Start Frontend: `npm run dev:client`
3.  Start Backend (Optional): `npm run dev`

## 🏆 Hackathon Submission
-   **Wave**: 2
-   **Focus**: Real-time interactions on microchains.
-   **Status**: MVP Operational (Simulated Chain Layer).
