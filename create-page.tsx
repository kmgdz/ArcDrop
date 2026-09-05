'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import {
  CONTRACT_ADDRESS, USDC_ADDRESS, USDC_ABI, ARCDROP_ABI,
  ARC_TESTNET, parseUSDC, switchToArc, formatUSDC,
  shortAddr, explorerTx, generateCode, hashCode,
} from '@/lib/arc'

type Step = 'idle' | 'approving' | 'waiting' | 'mining' | 'done' | 'error'

interface Form {
  title: string; message: string
  slots: string; amountPerSlot: string; deadlineDays: string
}

interface Created {
  dropId: string; codes: string[]
  txHash: string; title: string
  slots: number; amountPerSlot: string
}

export default function CreatePage() {
  const [addr,    setAddr]    = useState('')
  const [prov,    setProv]    = useState<ethers.BrowserProvider | null>(null)
  const [onArc,   setOnArc]   = useState(false)
  const [balance, setBalance] = useState('')
  const [form,    setForm]    = useState<Form>({ title:'', message:'', slots:'5', amountPerSlot:'1', deadlineDays:'7' })
  const [step,    setStep]    = useState<Step>('idle')
  const [txHash,  setTxHash]  = useState('')
  const [error,   setError]   = useState('')
  const [created, setCreated] = useState<Created | null>(null)
  const [copied,  setCopied]  = useState<string | null>(null)

  useEffect(() => { detect() }, [])

  async function detect() {
    if (!window.ethereum) return
    const p = new ethers.BrowserProvider(window.ethereum)
    const accs = await p.listAccounts()
    if (accs.length) {
      const a = accs[0].address; setAddr(a); setProv(p)
      const net = await p.getNetwork()
      const ok = Number(net.chainId) === ARC_TESTNET.chainId
      setOnArc(ok)
      if (ok) {
        const u = new ethers.Contract(USDC_ADDRESS, USDC_ABI, p)
        const r: bigint = await u.balanceOf(a)
        setBalance(formatUSDC(r))
      }
    }
    window.ethereum?.on('accountsChanged', detect)
    window.ethereum?.on('chainChanged',    detect)
  }

  async function connect() {
    if (!window.ethereum) { alert('Install MetaMask'); return }
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    await switchToArc(); await detect()
  }

  const field = (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const totalUSDC = (Number(form.slots) || 0) * (Number(form.amountPerSlot) || 0)
  const insufficient = !!balance && Number(balance) < totalUSDC

  async function createDrop() {
    if (!prov) return
    setError(''); setTxHash(''); setCreated(null)
    try {
      const signer = await prov.getSigner()
      const net = await prov.getNetwork()
      if (Number(net.chainId) !== ARC_TESTNET.chainId) await switchToArc()
      const slots = Number(form.slots)
      const amountRaw = parseUSDC(Number(form.amountPerSlot))
      const totalRaw  = BigInt(slots) * amountRaw
      const deadline  = Math.floor(Date.now() / 1000) + Number(form.deadlineDays) * 86400

      // Generate codes
      const codes = Array.from({ length: slots }, () => generateCode(14))
      const hashed = await Promise.all(codes.map(c => hashCode(c)))

      // Approve
      setStep('approving')
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer)
      const allowed: bigint = await usdc.allowance(addr, CONTRACT_ADDRESS)
      if (allowed < totalRaw) {
        const aTx = await usdc.approve(CONTRACT_ADDRESS, ethers.MaxUint256)
        await aTx.wait(1)
      }

      // Create
      setStep('waiting')
      const c = new ethers.Contract(CONTRACT_ADDRESS, ARCDROP_ABI, signer)
      const tx = await c.createDrop(hashed, amountRaw, deadline, form.title, form.message)
      setTxHash(tx.hash)
      setStep('mining')
      const receipt = await tx.wait(1)

      // Parse dropId
      const iface = new ethers.Interface(ARCDROP_ABI)
      let dropId = '1'
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log)
          if (parsed?.name === 'DropCreated') { dropId = parsed.args[0].toString(); break }
        } catch {}
      }

      setCreated({ dropId, codes, txHash: tx.hash, title: form.title, slots, amountPerSlot: form.amountPerSlot })
      setStep('done')
      setForm({ title:'', message:'', slots:'5', amountPerSlot:'1', deadlineDays:'7' })
      const u = new ethers.Contract(USDC_ADDRESS, USDC_ABI, prov)
      const r: bigint = await u.balanceOf(addr)
      setBalance(formatUSDC(r))
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : 'Error'
      setError(m.includes('user rejected') ? 'Transaction cancelled by user' : m.slice(0, 200))
      setStep('error')
    }
  }

  function claimUrl(dropId: string, code: string) {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/claim/${dropId}/${code}`
  }

  function copyAll() {
    if (!created) return
    const text = created.codes.map((c, i) => `Slot ${i + 1}: ${claimUrl(created.dropId, c)}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied('all'); setTimeout(() => setCopied(null), 2000)
  }

  function copySingle(code: string) {
    if (!created) return
    navigator.clipboard.writeText(claimUrl(created.dropId, code))
    setCopied(code); setTimeout(() => setCopied(null), 2000)
  }

  const busy = ['approving','waiting','mining'].includes(step)
  const canCreate = !!form.title && Number(form.slots) >= 1 && Number(form.amountPerSlot) >= 0.1
    && !!addr && onArc && !busy && !insufficient

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <Link href="/" className="text-d-dim text-xs font-mono hover:text-d-gold transition-colors mb-2 block">
          ← Home
        </Link>
        <div className="text-[10px] font-mono text-d-gold uppercase tracking-[0.15em] mb-2">ArcDrop · Create</div>
        <h1 className="text-4xl font-black gradient-gold mb-2">Create a USDC Drop</h1>
        <p className="text-d-dim text-sm max-w-xl">
          Deposit USDC into the smart contract → get shareable claim links → share with anyone on Arc Testnet.
        </p>
      </div>

      {!created ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-4 animate-fade-up" style={{ animationDelay:'0.1s' }}>

            {/* Banners */}
            {!addr && (
              <div className="alert-gold">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-d-gold font-semibold text-sm mb-0.5">Wallet not connected</div>
                    <div className="text-d-dim text-xs">Connect MetaMask on Arc Testnet to create a drop</div>
                  </div>
                  <button onClick={connect} className="btn-gold text-sm">🔗 Connect Wallet</button>
                </div>
              </div>
            )}
            {addr && !onArc && (
              <div className="alert-gold">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-d-gold font-semibold text-sm">⚠ Wrong network — switch to Arc Testnet</div>
                  <button onClick={() => switchToArc().then(detect)} className="btn-gold text-sm">Switch to Arc</button>
                </div>
              </div>
            )}

            <div className="card p-7 space-y-6">
              <h2 className="font-bold text-d-text text-lg border-b border-d-border pb-4">Drop details</h2>

              <div>
                <label className="label">Drop title *</label>
                <input className="input" placeholder="e.g. Arc Community Reward 🎉"
                  value={form.title} onChange={field('title')} />
              </div>

              <div>
                <label className="label">Message to claimers</label>
                <textarea className="input min-h-[80px] resize-none"
                  placeholder="Thanks for being part of the Arc ecosystem! 🚀"
                  value={form.message} onChange={field('message')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Number of slots *</label>
                  <input className="input" type="number" min="1" max="100"
                    placeholder="5" value={form.slots} onChange={field('slots')} />
                  <p className="text-[10px] text-d-dim font-mono mt-1.5">
                    = {form.slots || '0'} unique claim links
                  </p>
                </div>
                <div>
                  <label className="label">USDC per slot *</label>
                  <div className="relative">
                    <input className="input pr-16" type="number" min="0.1" step="0.1"
                      placeholder="1.00" value={form.amountPerSlot} onChange={field('amountPerSlot')} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-mono"
                      style={{ color:'#2775CA' }}>USDC</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Drop expires in</label>
                <select className="input" value={form.deadlineDays} onChange={field('deadlineDays')}>
                  {[['1','1 day'],['3','3 days'],['7','7 days'],['14','14 days'],['30','30 days']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <p className="text-[10px] text-d-dim font-mono mt-1.5">
                  Unclaimed USDC refunded to you after this date.
                </p>
              </div>

              {/* Total summary */}
              {totalUSDC > 0 && (
                <div className="card-gold p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="stat-label mb-1">Total you deposit</div>
                      <div className="text-3xl font-black font-mono gradient-gold">
                        ${totalUSDC.toFixed(2)} USDC
                      </div>
                      <div className="text-[10px] text-d-dim font-mono mt-1">
                        {form.slots} slots × ${Number(form.amountPerSlot).toFixed(2)} USDC each
                      </div>
                    </div>
                    <div className="text-right">
                      {balance && (
                        <div className={`text-xs font-mono ${insufficient ? 'text-d-red' : 'text-d-green'}`}>
                          {insufficient ? `⚠ Need $${(totalUSDC - Number(balance)).toFixed(2)} more` : '✓ Sufficient balance'}
                        </div>
                      )}
                      {balance && <div className="text-[10px] text-d-dim font-mono">Balance: ${balance}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* TX status */}
              {busy && (
                <div className="alert-blue">
                  <div className="flex items-center gap-3 text-d-blue text-sm">
                    <span className="animate-spin text-xl">⟳</span>
                    <div>
                      <div className="font-semibold">
                        {step === 'approving' ? 'Approving USDC spend…'
                          : step === 'waiting' ? 'Confirm transaction in MetaMask…'
                          : `Creating drop on Arc Testnet…`}
                      </div>
                      <div className="text-[10px] text-d-dim mt-0.5">
                        {step === 'approving' ? 'One-time permission — you only do this once'
                          : step === 'mining' ? 'Waiting for block confirmation on Arc' : ''}
                      </div>
                    </div>
                  </div>
                  {txHash && (
                    <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-mono text-d-gold hover:underline mt-2 block">
                      Track transaction on ArcScan →
                    </a>
                  )}
                </div>
              )}

              {error && (
                <div className="alert-red">
                  <div className="text-d-red font-semibold text-sm mb-1">⚠ Error</div>
                  <div className="text-d-dim text-xs font-mono">{error}</div>
                </div>
              )}

              <button onClick={createDrop} disabled={!canCreate}
                className="btn-gold w-full py-4 text-base font-bold">
                {busy
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⟳</span>
                      {step === 'approving' ? 'Approving USDC…'
                        : step === 'waiting' ? 'Waiting for MetaMask…'
                        : 'Creating drop on Arc…'}
                    </span>
                  : `🎁 Create Drop · Deposit $${totalUSDC.toFixed(2)} USDC`
                }
              </button>

              {!addr && (
                <p className="text-center text-[11px] text-d-dim font-mono">
                  Connect wallet above to create a drop
                </p>
              )}
              {addr && onArc && (
                <p className="text-center text-[11px] text-d-dim font-mono">
                  Need USDC?{' '}
                  <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                    className="text-d-gold hover:underline">Get free testnet USDC →</a>
                </p>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay:'0.15s' }}>

            {/* Wallet */}
            <div className="card p-5">
              <div className="stat-label mb-4">Your Wallet</div>
              {addr ? (
                <div className="space-y-3">
                  <div className="stat">
                    <span className="stat-label">Address</span>
                    <a href={`https://testnet.arcscan.app/address/${addr}`}
                      target="_blank" rel="noopener noreferrer"
                      className="stat-value text-d-green text-sm hover:underline">{shortAddr(addr)}</a>
                  </div>
                  <div className="stat">
                    <span className="stat-label">USDC Balance</span>
                    <span className="text-2xl font-black font-mono neon-gold">${balance || '0.00'}</span>
                  </div>
                  <div className={onArc ? 'badge-green' : 'badge-gold'}>
                    {onArc ? <><span className="w-1.5 h-1.5 rounded-full bg-d-green" /> Arc Testnet · 5042002</> : '⚠ Wrong network'}
                  </div>
                </div>
              ) : (
                <div className="text-d-dim text-sm">Not connected</div>
              )}
            </div>

            {/* Process */}
            <div className="card p-5">
              <div className="stat-label mb-4">What happens</div>
              <div className="space-y-4">
                {[
                  { n:'1', t:'Approve USDC',  d:'One-time permission for the contract to move your USDC.' },
                  { n:'2', t:'Lock in escrow', d:`$${totalUSDC.toFixed(2)} USDC locked in ArcDrop.sol trustlessly.` },
                  { n:'3', t:'Get links',      d:`${form.slots} unique claim links generated instantly.` },
                  { n:'4', t:'Share',          d:'Send links to anyone — they claim USDC in one click.' },
                  { n:'5', t:'Auto refund',    d:'After deadline, unclaimed USDC returned to you.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0"
                      style={{ background:'#F5A62318', color:'#F5A623', border:'1px solid #F5A62328' }}>
                      {s.n}
                    </div>
                    <div>
                      <div className="text-d-text text-xs font-semibold">{s.t}</div>
                      <div className="text-d-dim text-[11px] leading-relaxed">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract */}
            <div className="card p-5">
              <div className="stat-label mb-3">On-Chain</div>
              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex justify-between"><span className="text-d-dim">Network</span><span className="text-d-green">Arc Testnet</span></div>
                <div className="flex justify-between"><span className="text-d-dim">Chain ID</span><span className="text-d-gold">5042002</span></div>
                <div className="flex justify-between"><span className="text-d-dim">Min amount</span><span className="text-d-text">0.1 USDC/slot</span></div>
                <div className="flex justify-between"><span className="text-d-dim">Max slots</span><span className="text-d-text">1000</span></div>
                <div className="pt-2 border-t border-d-border">
                  <a href="https://testnet.arcscan.app/address/0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169"
                    target="_blank" rel="noopener noreferrer"
                    className="text-d-gold hover:underline block">View ArcDrop.sol ↗</a>
                </div>
              </div>
            </div>
          </div>
        </div>

      ) : (
        /* ── Success ── */
        <div className="max-w-2xl mx-auto space-y-5 animate-scale-in">
          <div className="card-gold p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 hero-glow opacity-60" />
            <div className="relative">
              <div className="text-7xl mb-5 animate-bounce-in">🎉</div>
              <h2 className="text-3xl font-black gradient-gold mb-2">Drop #{created.dropId} is Live!</h2>
              <p className="text-d-dim text-sm mb-4">
                <span className="font-bold text-d-text">{created.slots} claim links</span> ready ·{' '}
                <span className="font-bold text-d-gold">${Number(created.amountPerSlot).toFixed(2)} USDC</span> each
              </p>
              <a href={explorerTx(created.txHash)} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-mono text-d-gold hover:underline">
                View transaction on ArcScan →
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={copyAll} className="btn-gold flex-1 py-3 font-bold">
              {copied === 'all' ? '✓ All links copied!' : '📋 Copy all links'}
            </button>
            <Link href="/drops" className="btn-ghost py-3 px-6">View Drop →</Link>
          </div>

          <div className="card p-6 space-y-3">
            <div className="stat-label mb-1">Claim Links — share one per person</div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {created.codes.map((code, i) => (
                <div key={code} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background:'#03050B', border:'1px solid #1A2C44' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background:'#F5A62318', color:'#F5A623' }}>{i + 1}</div>
                  <div className="flex-1 min-w-0 font-mono text-[10px] text-d-dim truncate">
                    /claim/{created.dropId}/{code}
                  </div>
                  <button onClick={() => copySingle(code)}
                    className="text-[10px] font-mono flex-shrink-0 px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      background: copied === code ? '#10B98118' : '#F5A62310',
                      color: copied === code ? '#10B981' : '#F5A623',
                      border: `1px solid ${copied === code ? '#10B98128' : '#F5A62328'}`,
                    }}>
                    {copied === code ? '✓' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setCreated(null); setStep('idle') }} className="btn-ghost w-full py-3">
            + Create Another Drop
          </button>
        </div>
      )}
    </div>
  )
}
