import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function LandingPage() {
  return (
    <main className="min-h-screen noise-overlay" style={{ background: 'var(--navy)' }}>

      {/* === ATMOSPHERIC BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {/* Radial glow blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(201,147,62,0.07) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)', transform: 'translate(30%, 30%)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(17,30,51,0.6) 0%, transparent 70%)' }} />
        {/* Dot grid on hero area */}
        <div className="absolute inset-0 dot-grid opacity-100" />
      </div>

      {/* === NAV === */}
      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto">
        <div className="animate-reveal-0 flex items-center gap-2.5">
          <CompassIcon className="w-6 h-6 text-[var(--gold)]" />
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Wayfinder</span>
        </div>
        <div className="animate-reveal-0 flex items-center gap-4">
          <Link href="/search">
            <button className="btn-gold px-5 py-2 rounded-lg text-sm">
              Launch App
            </button>
          </Link>
        </div>
      </nav>

      {/* === HERO — ASYMMETRIC === */}
      <section className="relative z-10 px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-8 items-center">

          {/* Left: copy */}
          <div>
            <div className="animate-reveal-0">
              <span className="section-label">On-chain Intelligence</span>
            </div>
            <h1 className="animate-reveal-1 mt-4 mb-6 leading-[1.05] tracking-tight"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              Navigate the<br />
              <span className="text-gold-gradient">unknown</span>
            </h1>
            <p className="animate-reveal-2 text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300 }}>
              Perform deep onchain research, unmask on-chain identities, trace cross-chain bridges, and assess risk — all from a single address. Your compass in the onchain wilderness.
            </p>
            <div className="animate-reveal-3 flex flex-col sm:flex-row gap-3">
              <Link href="/search">
                <button className="btn-gold px-7 py-3.5 rounded-xl text-base w-full sm:w-auto">
                  Start Scanning
                </button>
              </Link>
              <a href="#features"
                className="px-7 py-3.5 rounded-xl text-sm border text-center transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
                Explore Features
              </a>
            </div>

            {/* Floating address tags — below buttons on mobile */}
            <div className="animate-reveal-fade mt-8 flex flex-wrap gap-2 lg:hidden">
              <span className="address-tag" style={{ color: 'var(--gold)' }}>0x1a2b...3c4d</span>
              <span className="address-tag" style={{ color: 'var(--cyan)' }}>vitalik.eth</span>
              <span className="address-tag" style={{ color: 'var(--green)' }}>Low Risk ✓</span>
            </div>
          </div>

          {/* Right: compass visual */}
          <div className="animate-reveal-fade relative flex items-center justify-center lg:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border animate-compass"
                style={{ borderColor: 'rgba(201,147,62,0.15)' }} />
              {/* Middle ring */}
              <div className="absolute inset-8 rounded-full border animate-compass-reverse"
                style={{ borderColor: 'rgba(34,211,238,0.12)' }} />
              {/* Inner glow */}
              <div className="absolute inset-16 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(201,147,62,0.15) 0%, rgba(34,211,238,0.06) 100%)' }} />
              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-gold"
                  style={{ background: 'var(--navy-3)', border: '1px solid rgba(201,147,62,0.25)' }}>
                  <CompassIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--gold)]" />
                </div>
              </div>
              {/* Floating tags — desktop only */}
              <div className="absolute -top-2 right-4 animate-float hidden lg:block">
                <span className="address-tag" style={{ color: 'var(--gold)' }}>0x1a2b...3c4d</span>
              </div>
              <div className="absolute -bottom-2 left-0 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
                <span className="address-tag" style={{ color: 'var(--cyan)' }}>vitalik.eth</span>
              </div>
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
                <span className="address-tag" style={{ color: 'var(--green)' }}>Low Risk ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === STATS BAR === */}
      <section className="relative z-10 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--navy-2)' }}>
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            <StatItem value="50+" label="Chains Supported" />
            <StatItem value="100M+" label="Addresses Indexed" />
            <StatItem value="&lt;2s" label="Avg Scan Time" />
            <StatItem value="99.9%" label="Uptime" />
          </div>
        </ScrollReveal>
      </section>

      {/* === FEATURES — BENTO GRID === */}
      <section id="features" className="relative z-10 px-5 sm:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-12 sm:mb-16">
            <span className="section-label">Features</span>
            <h2 className="mt-3" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
              Your on-chain toolkit
            </h2>
          </div>
        </ScrollReveal>

        {/* Bento: 1 wide + 2 stacked on desktop */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          <ScrollReveal className="lg:col-span-2 lg:row-span-1" delay={0}>
            <BentoCard
              icon={<SearchIcon className="w-6 h-6" />}
              title="Identity Search"
              description="ENS, Lens, Farcaster, and 20+ identity providers. Quick lookup or deep dive — your choice."
              color="gold"
              wide
            />
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <BentoCard
              icon={<BridgeIcon className="w-6 h-6" />}
              title="Bridge Tracing"
              description="Track assets across chains. See where funds originated and where they're going."
              color="cyan"
            />
          </ScrollReveal>
          <ScrollReveal className="sm:col-span-2 lg:col-span-1" delay={160}>
            <BentoCard
              icon={<ShieldIcon className="w-6 h-6" />}
              title="Risk Scoring"
              description="Sanctions screening, mixer detection, and behavioral analysis in seconds."
              color="green"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* === HOW IT WORKS — varied background === */}
      <section className="relative z-10 py-20 sm:py-32" style={{ background: 'var(--navy-2)' }}>
        <div className="px-5 sm:px-8 max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-14 sm:mb-20">
            <span className="section-label">Process</span>
            <h2 className="mt-3" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Three steps to clarity
            </h2>
          </ScrollReveal>

          <div className="relative grid sm:grid-cols-3 gap-10 sm:gap-6">
            {/* Connector line desktop */}
            <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(201,147,62,0.4), rgba(34,211,238,0.4), rgba(52,211,153,0.4))' }} />
            <ScrollReveal delay={0}><StepCard number="01" title="Paste Address" description="Enter any EVM wallet — EOA, contract, or ENS name." color="gold" /></ScrollReveal>
            <ScrollReveal delay={100}><StepCard number="02" title="Select Scan" description="Choose identity lookup, deep scan, or bridge tracing." color="cyan" /></ScrollReveal>
            <ScrollReveal delay={200}><StepCard number="03" title="Get Intel" description="Results in seconds. Export PDF reports." color="green" /></ScrollReveal>
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="relative z-10 px-5 sm:px-8 py-24 sm:py-36 text-center" style={{ background: 'var(--navy)' }}>
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-gold"
              style={{ background: 'var(--navy-3)', border: '1px solid rgba(201,147,62,0.2)' }}>
              <CompassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--gold)]" />
            </div>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1 }}>
              Ready to explore?
            </h2>
            <p className="mb-10 text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300 }}>
              Paste an address. Get answers in seconds.
            </p>
            <Link href="/search">
              <button className="btn-gold px-10 py-4 rounded-xl text-lg">
                Launch Wayfinder
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* === FOOTER === */}
      <footer className="relative z-10 px-5 sm:px-8 py-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'var(--navy-2)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <CompassIcon className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '0.85rem' }}>Wayfinder</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jetbrains)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            Navigate with confidence
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ==============================
   COMPONENTS
============================== */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-gold-gradient mb-1"
        style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        dangerouslySetInnerHTML={{ __html: value }} />
      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jetbrains)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function BentoCard({ icon, title, description, color, wide }: {
  icon: React.ReactNode; title: string; description: string;
  color: 'gold' | 'cyan' | 'green'; wide?: boolean;
}) {
  const colorMap = {
    gold: { icon: 'var(--gold)', iconBg: 'rgba(201,147,62,0.1)', iconBorder: 'rgba(201,147,62,0.2)' },
    cyan: { icon: 'var(--cyan)', iconBg: 'rgba(34,211,238,0.1)', iconBorder: 'rgba(34,211,238,0.2)' },
    green: { icon: 'var(--green)', iconBg: 'rgba(52,211,153,0.1)', iconBorder: 'rgba(52,211,153,0.2)' },
  };
  const c = colorMap[color];

  return (
    <div className="card-hover glass rounded-2xl p-6 sm:p-8 h-full shadow-md group cursor-default">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: c.iconBg, border: `1px solid ${c.iconBorder}`, color: c.icon }}>
        {icon}
      </div>
      <h3 className="mb-2" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: wide ? '1.35rem' : '1.1rem' }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, color }: {
  number: string; title: string; description: string; color: 'gold' | 'cyan' | 'green';
}) {
  const colorMap = {
    gold: { border: 'rgba(201,147,62,0.3)', bg: 'rgba(201,147,62,0.06)', text: 'var(--gold)' },
    cyan: { border: 'rgba(34,211,238,0.3)', bg: 'rgba(34,211,238,0.06)', text: 'var(--cyan)' },
    green: { border: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.06)', text: 'var(--green)' },
  };
  const c = colorMap[color];

  return (
    <div className="text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ border: `2px solid ${c.border}`, background: c.bg }}>
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.2rem', color: c.text }}>{number}</span>
      </div>
      <h3 className="mb-2" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

// Icons
function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function BridgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
