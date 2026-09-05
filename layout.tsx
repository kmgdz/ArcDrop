import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'ArcDrop 🎁 — USDC Airdrops on Arc Testnet',
  description: 'Create USDC airdrops. Share claim links. Recipients claim instantly on Arc Testnet. Trustless. On-chain. Instant.',
  icons: {
    icon:     [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple:    '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title:       'ArcDrop 🎁 — USDC Airdrops on Arc',
    description: 'Deposit USDC → share claim links → anyone claims instantly on Arc Testnet.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-d-bg text-d-text antialiased">

        {/* Top bar */}
        <div className="border-b border-d-border px-4 py-2 flex items-center justify-between text-[11px] font-mono"
          style={{ background:'rgba(6,10,18,0.9)' }}>
          <div className="flex items-center gap-2 text-d-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-d-green animate-pulse" />
            Arc Testnet · Chain 5042002 · USDC Native
          </div>
          <div className="flex items-center gap-4">
            <a href="https://testnet.arcscan.app/address/0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169"
              target="_blank" rel="noopener noreferrer"
              className="text-d-gold hover:underline hidden sm:block">Contract ↗</a>
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
              className="text-d-blue hover:underline">Get USDC →</a>
          </div>
        </div>

        <Nav />
        <main>{children}</main>

        <footer className="border-t border-d-border mt-24 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg" alt="ArcDrop" className="w-10 h-10" />
                  <div>
                    <div className="font-bold text-d-text">ArcDrop</div>
                    <div className="text-d-dim text-[10px] font-mono">v1.0.0</div>
                  </div>
                </div>
                <p className="text-d-dim text-xs leading-relaxed">USDC airdrops on Arc Testnet. Trustless. Instant. On-chain.</p>
              </div>
              <div>
                <div className="text-[10px] font-mono text-d-dim uppercase tracking-widest mb-3">Protocol</div>
                <div className="space-y-2 text-xs font-mono">
                  <a href="https://testnet.arcscan.app/address/0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169"
                    target="_blank" rel="noopener noreferrer"
                    className="block text-d-dim hover:text-d-gold transition-colors">Contract ↗</a>
                  <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
                    className="block text-d-dim hover:text-d-gold transition-colors">ArcScan ↗</a>
                  <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                    className="block text-d-dim hover:text-d-gold transition-colors">Faucet ↗</a>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-d-dim uppercase tracking-widest mb-3">Network</div>
                <div className="space-y-2 text-xs font-mono text-d-dim">
                  <div>Chain ID: <span className="text-d-gold">5042002</span></div>
                  <div>Currency: <span className="text-d-blue">USDC</span></div>
                  <div>Finality: <span className="text-d-green">&lt; 1s</span></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-d-dim uppercase tracking-widest mb-3">Arc Ecosystem</div>
                <div className="space-y-2 text-xs font-mono">
                  <a href="https://arc.network" target="_blank" rel="noopener noreferrer"
                    className="block text-d-dim hover:text-d-gold transition-colors">Arc Network ↗</a>
                  <a href="https://community.arc.io" target="_blank" rel="noopener noreferrer"
                    className="block text-d-dim hover:text-d-gold transition-colors">Arc House ↗</a>
                </div>
              </div>
            </div>
            <div className="border-t border-d-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] font-mono text-d-muted">Built for Arc House Hackathon 2026 · Independent builder</p>
              <p className="text-[11px] font-mono text-d-muted">ArcDrop Protocol · Arc Testnet · Chain 5042002</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
