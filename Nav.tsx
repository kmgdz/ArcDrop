'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ethers } from 'ethers'
import { ARC_TESTNET, USDC_ADDRESS, USDC_ABI, switchToArc, shortAddr, formatUSDC } from '@/lib/arc'

export default function Nav() {
  const path = usePathname()
  const [addr,     setAddr]     = useState('')
  const [onArc,    setOnArc]    = useState(false)
  const [balance,  setBalance]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    detect()
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    window.ethereum?.on('accountsChanged', detect)
    window.ethereum?.on('chainChanged',    detect)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.ethereum?.removeListener('accountsChanged', detect)
      window.ethereum?.removeListener('chainChanged',    detect)
    }
  }, [])

  async function detect() {
    if (!window.ethereum) return
    try {
      const p = new ethers.BrowserProvider(window.ethereum)
      const accs = await p.listAccounts()
      if (accs.length) {
        const a = accs[0].address; setAddr(a)
        const net = await p.getNetwork()
        const ok = Number(net.chainId) === ARC_TESTNET.chainId
        setOnArc(ok)
        if (ok) {
          const u = new ethers.Contract(USDC_ADDRESS, USDC_ABI, p)
          const r: bigint = await u.balanceOf(a)
          setBalance(formatUSDC(r))
        }
      } else { setAddr(''); setOnArc(false); setBalance('') }
    } catch {}
  }

  async function connect() {
    if (!window.ethereum) { alert('Install MetaMask'); return }
    setLoading(true)
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await switchToArc(); await detect()
    } finally { setLoading(false) }
  }

  const links = [
    { href: '/',       label: 'Home',         icon: '⬡' },
    { href: '/create', label: 'Create Drop',  icon: '🎁' },
    { href: '/drops',  label: 'All Drops',    icon: '📋' },
  ]

  return (
    <header className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(6,10,18,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1A2C44' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ArcDrop"
            className="w-10 h-10 group-hover:scale-105 transition-transform duration-200 drop-shadow-lg" />
          <div className="hidden sm:block">
            <div className="font-bold text-d-text text-sm leading-tight tracking-tight">ArcDrop</div>
            <div className="text-d-dim text-[9px] font-mono leading-tight">USDC Airdrops · Arc Testnet</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                path === l.href
                  ? 'text-d-gold bg-d-gdim border border-d-gold/20'
                  : 'text-d-dim hover:text-d-text hover:bg-d-raised'
              }`}>
              <span className="text-xs">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Wallet + mobile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!addr ? (
            <button onClick={connect} disabled={loading} className="btn-gold btn-sm">
              {loading
                ? <span className="flex items-center gap-1"><span className="animate-spin">⟳</span></span>
                : '🔗 Connect'}
            </button>
          ) : !onArc ? (
            <button onClick={() => switchToArc().then(detect)}
              className="btn-danger btn-sm animate-pulse text-xs">
              ⚠ Switch to Arc
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {balance && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono"
                  style={{ background:'#F5A62310', border:'1px solid #F5A62328', color:'#F5A623' }}>
                  💰 ${balance} USDC
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono"
                style={{ background:'#10B98110', border:'1px solid #10B98128', color:'#10B981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-d-green" />
                {shortAddr(addr)}
              </div>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost btn-sm px-2">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-d-border px-4 py-3 space-y-1"
          style={{ background: 'rgba(6,10,18,0.98)' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                path === l.href ? 'text-d-gold bg-d-gdim' : 'text-d-dim hover:text-d-text hover:bg-d-raised'
              }`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
