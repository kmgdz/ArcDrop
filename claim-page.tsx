'use client'

import { useState, useEffect, use } from 'react'
import { ethers } from 'ethers'
import {
  CONTRACT_ADDRESS, ARCDROP_ABI, ARC_TESTNET,
  formatUSDC, shortAddr, explorerTx, switchToArc, timeLeft,
} from '@/lib/arc'

type Phase = 'loading' | 'ready' | 'connecting' | 'claiming' | 'done' | 'error' | 'already' | 'expired' | 'notfound'

interface DropInfo {
  id: string; title: string; message: string
  amountPerSlot: string; claimed: number; total: number
  deadline: number; expired: boolean; creator: string
}

export default function ClaimPage({ params }: { params: Promise<{ dropId: string; code: string }> }) {
  const { dropId, code } = use(params)
  const [drop,   setDrop]   = useState<DropInfo | null>(null)
  const [phase,  setPhase]  = useState<Phase>('loading')
  const [addr,   setAddr]   = useState('')
  const [txHash, setTxHash] = useState('')
  const [error,  setError]  = useState('')

  useEffect(() => { loadDrop() }, [])

  async function loadDrop() {
    try {
      const p = new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl)
      const c = new ethers.Contract(CONTRACT_ADDRESS, ARCDROP_ABI, p)
      const d = await c.getDrop(Number(dropId))
      const [,,remaining,,expired] = await c.getDropStats(Number(dropId))
      const isClaimed = await c.isCodeClaimed(Number(dropId), code)

      const info: DropInfo = {
        id: dropId, title: d.title, message: d.message,
        amountPerSlot: formatUSDC(d.amountPerSlot),
        claimed: Number(d.claimedSlots), total: Number(d.totalSlots),
        deadline: Number(d.deadline), expired,
        creator: d.creator,
      }
      setDrop(info)

      if (isClaimed)              { setPhase('already'); return }
      if (expired)                { setPhase('expired'); return }
      if (Number(remaining) === 0){ setPhase('expired'); return }
      setPhase('ready')
    } catch { setPhase('notfound') }
  }

  async function connectAndClaim() {
    if (!window.ethereum) { alert('Install MetaMask'); return }
    setPhase('connecting')
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await switchToArc()
      const p = new ethers.BrowserProvider(window.ethereum)
      const net = await p.getNetwork()
      if (Number(net.chainId) !== ARC_TESTNET.chainId) {
        setError('Please switch to Arc Testnet (Chain 5042002)')
        setPhase('error'); return
      }
      const accs = await p.listAccounts()
      setAddr(accs[0].address)
      await claimDrop(p)
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Error'
      setError(m.includes('user rejected') ? 'Connection cancelled' : m.slice(0, 200))
      setPhase('error')
    }
  }

  async function claimDrop(p: ethers.BrowserProvider) {
    setPhase('claiming')
    try {
      const signer = await p.getSigner()
      const c = new ethers.Contract(CONTRACT_ADDRESS, ARCDROP_ABI, signer)
      const tx = await c.claim(Number(dropId), code)
      setTxHash(tx.hash)
      await tx.wait(1)
      setPhase('done')
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Error'
      setError(
        m.includes('user rejected') ? 'Transaction cancelled' :
        m.includes('AlreadyClaimed') ? 'This code was already claimed' :
        m.includes('InvalidCode') ? 'Invalid or wrong claim code' :
        m.includes('DropExpired') ? 'This drop has expired' :
        m.slice(0, 200)
      )
      setPhase('error')
    }
  }

  const pct = drop ? Math.round((drop.claimed / drop.total) * 100) : 0

  // ── Render states ──────────────────────────────────────────────────────────

  if (phase === 'loading') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-16 text-center max-w-sm w-full">
        <div className="text-6xl mb-5 animate-float">🎁</div>
        <div className="text-d-dim font-mono text-sm animate-pulse">Loading your drop…</div>
      </div>
    </div>
  )

  if (phase === 'notfound') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-16 text-center max-w-sm w-full animate-scale-in">
        <div className="text-6xl mb-5">❌</div>
        <h2 className="text-xl font-bold text-d-text mb-2">Drop not found</h2>
        <p className="text-d-dim text-sm mb-6">This link is invalid or the drop doesn't exist on Arc Testnet.</p>
        <a href="/" className="btn-gold btn-sm">Go Home</a>
      </div>
    </div>
  )

  if (phase === 'already') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-16 text-center max-w-sm w-full animate-scale-in">
        <div className="text-6xl mb-5">✅</div>
        <h2 className="text-xl font-bold text-d-text mb-2">Already claimed</h2>
        <p className="text-d-dim text-sm mb-6">This claim link has already been used. Each link works only once.</p>
        <a href="/create" className="btn-gold btn-sm">Create your own drop</a>
      </div>
    </div>
  )

  if (phase === 'expired') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-16 text-center max-w-sm w-full animate-scale-in">
        <div className="text-6xl mb-5">⏰</div>
        <h2 className="text-xl font-bold text-d-text mb-2">Drop expired</h2>
        <p className="text-d-dim text-sm mb-6">This drop has expired or all slots have been claimed.</p>
        <a href="/drops" className="btn-gold btn-sm">Browse active drops</a>
      </div>
    </div>
  )

  if (phase === 'done') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-5 animate-scale-in">
        {/* Success */}
        <div className="card-gold p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 hero-glow" />
          <div className="relative">
            <div className="text-8xl mb-6 animate-bounce-in">🎉</div>
            <h1 className="text-3xl font-black gradient-gold mb-3">
              You got ${drop?.amountPerSlot} USDC!
            </h1>
            <p className="text-d-dim text-sm mb-2">
              Sent to{' '}
              <span className="font-mono text-d-text font-semibold">{shortAddr(addr)}</span>
            </p>
            <p className="text-[10px] text-d-dim font-mono mb-4">on Arc Testnet · Chain 5042002</p>
            {txHash && (
              <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-d-gold hover:underline
                           px-4 py-2 rounded-xl border border-d-gold/20 bg-d-gdim">
                View on ArcScan ↗
              </a>
            )}
          </div>
        </div>

        {/* What now */}
        <div className="card p-6 space-y-3">
          <div className="stat-label">What's next?</div>
          <div className="space-y-2">
            <a href="/create" className="btn-gold w-full py-3 font-bold block text-center">
              🎁 Create your own drop
            </a>
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
              className="btn-ghost w-full py-3 text-sm block text-center">
              💧 Get more testnet USDC
            </a>
            <a href="/drops" className="btn-ghost w-full py-3 text-sm block text-center">
              📋 Browse all drops
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] text-d-muted font-mono">
          ArcDrop Protocol · Arc Testnet · Chain 5042002
        </p>
      </div>
    </div>
  )

  // Ready / connecting / claiming / error
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-4">

        {/* Drop gift card */}
        {drop && (
          <div className="card-gold p-8 text-center relative overflow-hidden animate-fade-up">
            <div className="absolute inset-0 hero-glow opacity-50" />
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="ArcDrop" className="w-16 h-16 mx-auto mb-5 animate-float"
                style={{ filter:'drop-shadow(0 0 16px #F5A62340)' }} />
              <div className="text-[10px] font-mono text-d-dim uppercase tracking-[0.15em] mb-2">
                You received a USDC drop
              </div>
              <h1 className="text-xl font-bold text-d-text mb-2">{drop.title}</h1>
              {drop.message && (
                <p className="text-d-dim text-sm italic mb-3">"{drop.message}"</p>
              )}
              <div className="text-[10px] font-mono text-d-muted">
                Drop #{drop.id} · Arc Testnet
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        {drop && (
          <div className="card p-6 text-center animate-fade-up" style={{ animationDelay:'0.05s' }}>
            <div className="stat-label mb-2">Your reward</div>
            <div className="text-6xl font-black font-mono gradient-gold mb-1">
              ${drop.amountPerSlot}
            </div>
            <div className="text-d-blue font-mono text-sm font-semibold">USDC on Arc Testnet</div>
          </div>
        )}

        {/* Drop progress */}
        {drop && (
          <div className="card p-5 space-y-3 animate-fade-up" style={{ animationDelay:'0.1s' }}>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-d-dim">Drop progress</span>
              <span className="text-d-text font-bold">{drop.claimed} / {drop.total} claimed</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width:`${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-d-dim">{drop.total - drop.claimed} slots remaining</span>
              <span className={drop.expired ? 'text-d-red' : 'text-d-gold'}>
                {timeLeft(drop.deadline)}
              </span>
            </div>
          </div>
        )}

        {/* Action area */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay:'0.15s' }}>

          {phase === 'ready' && drop && (
            <>
              <button onClick={connectAndClaim}
                className="btn-gold w-full py-5 text-base font-bold animate-pulse-gold">
                🔗 Connect & Claim ${drop.amountPerSlot} USDC
              </button>
              <div className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">ℹ️</div>
                  <div className="text-[11px] text-d-dim leading-relaxed">
                    <span className="text-d-text font-semibold block mb-1">How to claim</span>
                    Connect your MetaMask wallet on Arc Testnet (Chain 5042002).
                    Confirm one transaction. USDC arrives in your wallet in under 1 second.
                    No gas fees for you — USDC covers it all.
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-d-muted font-mono">
                Requires MetaMask · Arc Testnet · Chain 5042002 ·{' '}
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                  className="text-d-gold hover:underline">Get USDC for gas</a>
              </p>
            </>
          )}

          {phase === 'connecting' && (
            <div className="alert-blue">
              <div className="flex items-center gap-3 text-d-blue">
                <span className="animate-spin text-2xl">⟳</span>
                <div>
                  <div className="font-semibold text-sm">Connecting your wallet…</div>
                  <div className="text-[10px] text-d-dim mt-0.5">Approve in MetaMask — switching to Arc Testnet</div>
                </div>
              </div>
            </div>
          )}

          {phase === 'claiming' && drop && (
            <div className="space-y-3">
              <div className="alert-blue">
                <div className="flex items-center gap-3 text-d-blue">
                  <span className="animate-spin text-2xl">⟳</span>
                  <div>
                    <div className="font-semibold text-sm">Claiming ${drop.amountPerSlot} USDC…</div>
                    <div className="text-[10px] text-d-dim mt-0.5">Confirm the transaction in MetaMask</div>
                  </div>
                </div>
              </div>
              {txHash && (
                <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-d-gold hover:underline">
                  Track on ArcScan →
                </a>
              )}
            </div>
          )}

          {phase === 'error' && (
            <div className="space-y-3">
              <div className="alert-red">
                <div className="text-d-red font-semibold text-sm mb-1">⚠ Error</div>
                <div className="text-d-dim text-[11px] font-mono">{error}</div>
              </div>
              <button onClick={() => setPhase('ready')} className="btn-ghost w-full py-3 text-sm">
                ↩ Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
