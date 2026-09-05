import Link from 'next/link'

const CONTRACT = '0x3CE894fEc38999c39Bb1e1c0C00B8A7164E88169'

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at 50% 100%, #060A12 0%, transparent 65%)' }} />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none animate-float"
          style={{ background:'radial-gradient(circle, #F5A62306, transparent)', animationDelay:'0s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full pointer-events-none animate-float"
          style={{ background:'radial-gradient(circle, #2775CA06, transparent)', animationDelay:'2s' }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center w-full">

          {/* Network pill */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-[11px] font-mono
                          border border-d-border bg-d-surface/60 backdrop-blur-sm text-d-dim animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-d-green animate-pulse" />
            Live on Arc Testnet · Chain 5042002 ·
            <a href={`https://testnet.arcscan.app/address/${CONTRACT}`}
              target="_blank" rel="noopener noreferrer"
              className="text-d-gold hover:underline">
              Verify Contract ↗
            </a>
          </div>

          {/* Floating logo */}
          <div className="flex justify-center mb-8 animate-fade-up" style={{ animationDelay:'0.05s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="ArcDrop"
              className="w-32 h-32 animate-float drop-shadow-2xl"
              style={{ filter:'drop-shadow(0 0 30px #F5A62330)' }} />
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-3 animate-fade-up"
            style={{ animationDelay:'0.08s' }}>
            <span className="gradient-gold">ArcDrop</span>
          </h1>
          <div className="text-d-dim text-sm sm:text-base font-mono uppercase tracking-[0.25em] mb-8 animate-fade-up"
            style={{ animationDelay:'0.12s' }}>
            USDC Airdrops · Arc Testnet · On-Chain
          </div>

          {/* Tagline */}
          <p className="text-d-dim text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up"
            style={{ animationDelay:'0.16s' }}>
            Deposit <span className="neon-gold font-bold">USDC</span> into a smart contract.
            Get shareable claim links.
            Recipients claim their{' '}
            <span className="neon-gold font-bold">USDC instantly</span>{' '}
            in one click — no sign-up, no KYC.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up"
            style={{ animationDelay:'0.2s' }}>
            <Link href="/create" className="btn-gold btn-lg text-base font-bold">
              🎁 Create a Drop
            </Link>
            <Link href="/drops" className="btn-ghost btn-lg text-base">
              📋 Browse All Drops
            </Link>
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
              className="btn-ghost btn-lg text-base">
              💧 Get Testnet USDC
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up"
            style={{ animationDelay:'0.24s' }}>
            {[
              { v:'1-click',  u:'to claim',      l:'No friction' },
              { v:'100%',     u:'on-chain',       l:'Trustless' },
              { v:'USDC',     u:'Arc native',     l:'Currency' },
              { v:'Auto',     u:'refund',         l:'After deadline' },
              { v:'< 1s',     u:'finality',       l:'Arc speed' },
            ].map(s => (
              <div key={s.l} className="card px-5 py-3 text-center min-w-[100px]">
                <div className="font-extrabold font-mono gradient-gold text-xl">{s.v}</div>
                <div className="text-d-dim text-[10px] font-mono">{s.u}</div>
                <div className="text-d-muted text-[9px] uppercase tracking-wider mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-[10px] font-mono text-d-gold uppercase tracking-[0.15em] mb-3">How it works</div>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Three steps. Real USDC.</h2>
          <p className="text-d-dim text-sm max-w-md mx-auto">Everything happens on Arc Testnet. Every transaction verifiable on ArcScan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {[
            {
              n:'01', icon:'🎁', color:'#F5A623',
              title:'Create a Drop',
              desc:'Choose number of slots, USDC per slot, a deadline, and a title. The contract locks your USDC trustlessly.',
              tag:'arcdrop.vercel.app/create',
            },
            {
              n:'02', icon:'🔗', color:'#2775CA',
              title:'Share Claim Links',
              desc:'Get a unique claim link for each slot. Share on Twitter, Discord, Telegram — anywhere. Each link works once.',
              tag:'arcdrop.vercel.app/claim/1/XYZ',
            },
            {
              n:'03', icon:'⚡', color:'#10B981',
              title:'Instant Claim',
              desc:'Recipients open the link, connect MetaMask, and receive USDC in one transaction. Confirmed in under 1 second on Arc.',
              tag:'1 USDC → wallet instantly',
            },
          ].map((f, i) => (
            <div key={f.n} className="card-hover p-7 group animate-fade-up"
              style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-mono text-d-muted tracking-widest">{f.n}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background:`${f.color}18`, color:f.color, border:`1px solid ${f.color}30` }}>
                  {i + 1}
                </div>
              </div>
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-d-dim text-sm leading-relaxed mb-4">{f.desc}</p>
              <div className="font-mono text-[10px] px-3 py-2 rounded-lg text-d-dim truncate"
                style={{ background:'#03050B', border:'1px solid #1A2C44' }}>
                {f.tag}
              </div>
            </div>
          ))}
        </div>

        {/* Refund note */}
        <div className="card p-5 flex items-center gap-4">
          <div className="text-3xl flex-shrink-0">🔁</div>
          <div>
            <div className="font-semibold text-d-text text-sm mb-1">Auto-Refund After Deadline</div>
            <div className="text-d-dim text-xs leading-relaxed">
              If some claim links are never used, the creator can call <span className="font-mono text-d-gold">refund()</span> after the deadline expires.
              Unclaimed USDC is returned in full, in one transaction. Zero risk for creators.
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <div className="text-[10px] font-mono text-d-gold uppercase tracking-[0.15em] mb-3">Use Cases</div>
          <h2 className="text-3xl font-bold gradient-text">Built for real rewards</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon:'🏆', color:'#F5A623', title:'Hackathon Prizes',   desc:'Distribute prize money to winners on-chain instantly. No PayPal. No delays.' },
            { icon:'🎪', color:'#2775CA', title:'Community Rewards',  desc:'Reward active Discord or Twitter members with real USDC.' },
            { icon:'🎂', color:'#10B981', title:'USDC Gifts',         desc:'Birthday, holiday, or just-because gifts in USDC. No bank needed.' },
            { icon:'📣', color:'#8B5CF6', title:'Marketing Drops',    desc:'Run USDC giveaways to grow your protocol or community.' },
          ].map(f => (
            <div key={f.title} className="card-hover p-6 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <div className="font-semibold text-d-text mb-2" style={{ color: f.color }}>{f.title}</div>
              <div className="text-d-dim text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Protocol info ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          <div className="lg:col-span-3 card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.03] -translate-y-20 translate-x-20 pointer-events-none"
              style={{ background:'radial-gradient(circle, #F5A623, transparent)' }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-3xl">⛓️</div>
                <div>
                  <h3 className="font-bold text-d-text text-lg">Fully On-Chain Protocol</h3>
                  <div className="text-d-dim text-xs font-mono">ArcDrop.sol · Arc Testnet</div>
                </div>
              </div>
              <p className="text-d-dim leading-relaxed text-sm mb-6">
                ArcDrop is a smart contract deployed at a fixed address on Arc Testnet.
                USDC is held in the contract — no one can steal it, not even the creator.
                Every drop creation, every claim, every refund is a verifiable on-chain transaction.
                No backend. No database. Pure blockchain.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat">
                  <span className="stat-label">Contract</span>
                  <a href={`https://testnet.arcscan.app/address/${CONTRACT}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-d-gold hover:underline">
                    0x3CE8…8169
                  </a>
                </div>
                <div className="stat">
                  <span className="stat-label">USDC Token</span>
                  <span className="text-xs font-mono text-d-blue">0x3600…0000</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Network</span>
                  <span className="text-xs font-mono text-d-green">Arc Testnet</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Chain ID</span>
                  <span className="text-xs font-mono text-d-gold">5042002</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {[
              { icon:'🔒', color:'#F5A623', title:'Trustless Escrow',  desc:'USDC locked in contract. Nobody controls it. Winner pays automatically.' },
              { icon:'⚡', color:'#10B981', title:'Instant Settlement', desc:'Arc finalizes in under 1 second. Claims hit wallets immediately.' },
              { icon:'🌍', color:'#2775CA', title:'Anyone Can Claim',  desc:'Any wallet on Arc Testnet. No sign-up. No KYC. Just connect and claim.' },
              { icon:'🔁', color:'#8B5CF6', title:'Auto Refund',       desc:'After deadline, unclaimed USDC returned to creator in one transaction.' },
            ].map(f => (
              <div key={f.title} className="card-hover p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: f.color }}>{f.title}</div>
                  <div className="text-d-dim text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="card-gold p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 hero-glow opacity-70" />
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt=""
              className="w-24 h-24 mx-auto mb-6 animate-float"
              style={{ filter:'drop-shadow(0 0 24px #F5A62344)' }} />
            <h2 className="text-4xl font-black gradient-gold mb-4">Start your first drop</h2>
            <p className="text-d-dim max-w-lg mx-auto mb-10 leading-relaxed">
              Deposit USDC · Generate claim links · Share anywhere.
              Recipients claim in one click. Fully on Arc Testnet. Zero fees for claimers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create" className="btn-gold btn-lg font-bold text-base">
                🎁 Create a Drop Now
              </Link>
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                className="btn-ghost btn-lg text-base">
                💧 Get Testnet USDC First
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
