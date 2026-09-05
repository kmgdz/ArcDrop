'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import {
  CONTRACT_ADDRESS, ARCDROP_ABI, ARC_TESTNET,
  formatUSDC, shortAddr, explorerAddr, timeAgo, timeLeft,
} from '@/lib/arc'

interface Drop {
  id: string; creator: string; title: string; message: string
  amountPerSlot: string; totalSlots: number; claimedSlots: number
  deadline: number; createdAt: number; expired: boolean; refunded: boolean
}

type Filter = 'all' | 'active' | 'expired'

export default function DropsPage() {
  const [drops,   setDrops]   = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<Filter>('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const p = new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl)
      const c = new ethers.Contract(CONTRACT_ADDRESS, ARCDROP_ABI, p)
      const raw = await c.getAllDrops()
      const now = Math.floor(Date.now() / 1000)
      const parsed: Drop[] = raw
        .filter((d: { id: bigint }) => Number(d.id) > 0)
        .map((d: {
          id: bigint; creator: string; title: string; message: string
          amountPerSlot: bigint; totalSlots: bigint; claimedSlots: bigint
          deadline: bigint; createdAt: bigint; refunded: boolean
        }) => ({
          id:            d.id.toString(),
          creator:       d.creator,
          title:         d.title || 'Untitled Drop',
          message:       d.message,
          amountPerSlot: formatUSDC(d.amountPerSlot),
          totalSlots:    Number(d.totalSlots),
          claimedSlots:  Number(d.claimedSlots),
          deadline:      Number(d.deadline),
          createdAt:     Number(d.createdAt),
          expired:       now > Number(d.deadline),
          refunded:      d.refunded,
        }))
        .reverse()
      setDrops(parsed)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = drops.filter(d => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? !d.expired && d.claimedSlots < d.totalSlots :
      d.expired || d.claimedSlots >= d.totalSlots
    const matchSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.id === search ||
      d.creator.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalClaims = drops.reduce((a, d) => a + d.claimedSlots, 0)
  const totalUSDCSent = drops.reduce((a, d) => a + d.claimedSlots * Number(d.amountPerSlot), 0)
  const activeDrops = drops.filter(d => !d.expired && d.claimedSlots < d.totalSlots).length

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10 animate-fade-up">
        <div className="text-[10px] font-mono text-d-gold uppercase tracking-[0.15em] mb-2">ArcDrop · Browse</div>
        <h1 className="text-4xl font-black gradient-gold mb-3">All Drops</h1>
        <p className="text-d-dim text-sm max-w-md mx-auto">
          Every USDC airdrop on Arc Testnet. Every drop is a smart contract. Every claim is on-chain.
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fade-up" style={{ animationDelay:'0.05s' }}>
        {[
          { label:'Total Drops',    value: drops.length.toString(),          color:'text-d-text' },
          { label:'Active Now',     value: activeDrops.toString(),           color:'neon-green' },
          { label:'Total Claims',   value: totalClaims.toString(),           color:'text-d-text' },
          { label:'USDC Sent',      value: `$${totalUSDCSent.toFixed(2)}`,   color:'neon-gold' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="stat-label mb-1">{s.label}</div>
            <div className={`font-black font-mono text-2xl ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay:'0.1s' }}>
        <div className="flex gap-1 p-1 rounded-2xl flex-shrink-0"
          style={{ background:'#0A1020', border:'1px solid #1A2C44' }}>
          {(['all','active','expired'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-semibold capitalize transition-all ${
                filter === f ? 'text-d-void' : 'text-d-dim hover:text-d-text'
              }`}
              style={filter === f
                ? { background:'linear-gradient(135deg,#FFD060,#F5A623)', boxShadow:'0 0 16px #F5A62340' }
                : {}}>
              {f === 'active' ? '● Active' : f === 'expired' ? '○ Expired' : 'All'}
            </button>
          ))}
        </div>
        <input
          className="input flex-1 text-sm"
          placeholder="Search by title, creator address, or drop ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="card h-36 shimmer" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card p-20 text-center animate-scale-in">
          <div className="text-6xl mb-5">🎁</div>
          <h3 className="text-xl font-bold text-d-text mb-2">
            {search ? 'No drops match your search' : 'No drops yet'}
          </h3>
          <p className="text-d-dim text-sm mb-8">
            {search ? 'Try a different search term' : 'Be the first to create a USDC drop on Arc!'}
          </p>
          <Link href="/create" className="btn-gold btn-sm">🎁 Create First Drop →</Link>
        </div>
      )}

      {/* Drops list */}
      <div className="space-y-4">
        {filtered.map((drop, idx) => {
          const pct       = Math.round((drop.claimedSlots / drop.totalSlots) * 100)
          const remaining = drop.totalSlots - drop.claimedSlots
          const totalVal  = drop.totalSlots * Number(drop.amountPerSlot)
          const isActive  = !drop.expired && remaining > 0

          return (
            <div key={drop.id}
              className={`card p-6 transition-all duration-200 animate-fade-up ${isActive ? 'card-hover' : 'opacity-75'}`}
              style={{ animationDelay: `${0.05 * idx}s` }}>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-bold text-d-text text-lg leading-tight">{drop.title}</h3>
                    <span className="text-[10px] font-mono text-d-muted">#{drop.id}</span>
                    {isActive ? (
                      <span className="badge-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-d-green animate-pulse" />
                        Live
                      </span>
                    ) : drop.refunded ? (
                      <span className="badge-gold">Refunded</span>
                    ) : (
                      <span className="badge-red">Ended</span>
                    )}
                  </div>
                  {drop.message && (
                    <p className="text-d-dim text-xs italic mb-2 line-clamp-1">"{drop.message}"</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-d-muted flex-wrap">
                    <span>by</span>
                    <a href={explorerAddr(drop.creator)} target="_blank" rel="noopener noreferrer"
                      className="text-d-gold hover:underline">{shortAddr(drop.creator)}</a>
                    <span>·</span>
                    <span>{timeAgo(drop.createdAt)}</span>
                    <span>·</span>
                    <span className={drop.expired ? 'text-d-red' : 'text-d-gold'}>
                      {timeLeft(drop.deadline)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black font-mono gradient-gold leading-none">
                    ${drop.amountPerSlot}
                  </div>
                  <div className="text-[10px] text-d-dim font-mono mt-0.5">USDC per slot</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-[10px] font-mono text-d-dim">
                  <span>{drop.claimedSlots} of {drop.totalSlots} slots claimed</span>
                  <span className="font-bold text-d-text">{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width:`${pct}%` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-4 text-[10px] font-mono text-d-dim flex-wrap">
                  <span>
                    Total:{' '}
                    <span className="text-d-gold font-bold">${totalVal.toFixed(2)} USDC</span>
                  </span>
                  <span>
                    Remaining:{' '}
                    <span className="text-d-text font-bold">{remaining} slots</span>
                  </span>
                  <span>
                    Claimed:{' '}
                    <span className="text-d-green font-bold">${(drop.claimedSlots * Number(drop.amountPerSlot)).toFixed(2)} USDC</span>
                  </span>
                </div>
                {isActive && (
                  <div className="badge-gold text-[10px] font-bold">
                    🎁 ${drop.amountPerSlot} USDC available
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-center gap-4 mt-12">
        <button onClick={load} className="btn-ghost text-sm">↻ Refresh from Arc</button>
        <Link href="/create" className="btn-gold btn-sm font-bold">🎁 Create a Drop</Link>
      </div>
    </div>
  )
}
