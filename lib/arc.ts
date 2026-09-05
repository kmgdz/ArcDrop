// ─── Arc Testnet ──────────────────────────────────────────────────────────────
export const ARC_TESTNET = {
  chainId:    5042002,
  chainIdHex: '0x4D0052',
  name:       'Arc Testnet',
  rpcUrl:     'https://rpc.testnet.arc.network',
  explorer:   'https://testnet.arcscan.app',
  faucet:     'https://faucet.circle.com',
  currency:   { name: 'USDC', symbol: 'USDC', decimals: 18 },
}

// ─── Contracts — hardcoded ────────────────────────────────────────────────────
export const USDC_ADDRESS     = '0x3600000000000000000000000000000000000000'
export const USDC_DECIMALS    = 6
export const CONTRACT_ADDRESS = '0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169'

// ─── ABIs ─────────────────────────────────────────────────────────────────────
export const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
] as const

export const ARCDROP_ABI = [
  'function createDrop(bytes32[] hashedCodes, uint256 amountPerSlot, uint256 deadline, string title, string message) returns (uint256)',
  'function claim(uint256 dropId, string claimCode)',
  'function refund(uint256 dropId)',
  'function getDrop(uint256 dropId) view returns (tuple(uint256 id, address creator, uint256 amountPerSlot, uint256 totalSlots, uint256 claimedSlots, uint256 deadline, string title, string message, bool refunded, uint256 createdAt))',
  'function getCreatorDrops(address creator) view returns (uint256[])',
  'function getClaimerHistory(address claimer) view returns (tuple(uint256 dropId, uint256 amount, uint256 timestamp)[])',
  'function isCodeClaimed(uint256 dropId, string claimCode) view returns (bool)',
  'function getDropStats(uint256 dropId) view returns (uint256 total, uint256 claimed, uint256 remaining, uint256 totalUSDC, bool expired)',
  'function getAllDrops() view returns (tuple(uint256 id, address creator, uint256 amountPerSlot, uint256 totalSlots, uint256 claimedSlots, uint256 deadline, string title, string message, bool refunded, uint256 createdAt)[])',
  'function dropCount() view returns (uint256)',
  'event DropCreated(uint256 indexed dropId, address indexed creator, uint256 totalSlots, uint256 amountPerSlot, uint256 deadline, string title)',
  'event Claimed(uint256 indexed dropId, address indexed claimer, uint256 amount)',
  'event Refunded(uint256 indexed dropId, address indexed creator, uint256 amount)',
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const parseUSDC   = (n: number): bigint => BigInt(Math.round(n * 10 ** USDC_DECIMALS))
export const formatUSDC  = (raw: bigint | number | string): string => (Number(raw) / 10 ** USDC_DECIMALS).toFixed(2)
export const shortAddr   = (a: string): string => `${a.slice(0, 6)}…${a.slice(-4)}`
export const explorerTx  = (h: string): string => `${ARC_TESTNET.explorer}/tx/${h}`
export const explorerAddr= (a: string): string => `${ARC_TESTNET.explorer}/address/${a}`

export const timeAgo = (ts: number): string => {
  const s = Math.floor(Date.now() / 1000) - ts
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export const timeLeft = (deadline: number): string => {
  const s = deadline - Math.floor(Date.now() / 1000)
  if (s <= 0) return 'Expired'
  if (s < 3600) return `${Math.floor(s / 60)}m left`
  if (s < 86400) return `${Math.floor(s / 3600)}h left`
  return `${Math.floor(s / 86400)}d left`
}

export function generateCode(len = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function hashCode(code: string): Promise<string> {
  const { ethers } = await import('ethers')
  return ethers.keccak256(ethers.toUtf8Bytes(code))
}

export async function switchToArc(): Promise<boolean> {
  if (!window.ethereum) return false
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET.chainIdHex }] })
    return true
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{ chainId: ARC_TESTNET.chainIdHex, chainName: ARC_TESTNET.name, nativeCurrency: ARC_TESTNET.currency, rpcUrls: [ARC_TESTNET.rpcUrl], blockExplorerUrls: [ARC_TESTNET.explorer] }],
        })
        return true
      } catch { return false }
    }
    return false
  }
}
