 # ArcDrop 🎁

> USDC airdrop protocol on Arc Testnet. Create claim links. Share with anyone. Recipients claim instantly on-chain.

**Contract:** `0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169`  
**Network:** Arc Testnet · Chain ID 5042002  
**Explorer:** https://testnet.arcscan.app/address/0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169

## How it works

1. Creator deposits USDC → contract splits into N claim slots
2. Creator gets N unique shareable links
3. Anyone opens a link → connects MetaMask → receives USDC instantly
4. After deadline → unclaimed USDC refunded to creator

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/create` | Create a drop |
| `/claim/[id]/[code]` | Claim USDC with a link |
| `/drops` | Browse all drops |

## Setup

```bash
npm install
npm run dev
```

No env vars needed — contract hardcoded in `lib/arc.ts`.

## Deploy

```bash
vercel deploy
```

## Arc Testnet

| | |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| USDC | `0x3600000000000000000000000000000000000000` |
| Contract | `0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169` |
| Explorer | `https://testnet.arcscan.app` |
| Faucet | `https://faucet.circle.com` |

Built for Arc House Hackathon 2026.
