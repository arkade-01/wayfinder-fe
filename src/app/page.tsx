import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-hidden">
      {/* Animated background - hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#d4a853]/10 rounded-full blur-[100px] sm:blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#1a3a5c]/30 rounded-full blur-[120px] sm:blur-[150px]" />
      </div>

      {/* Mobile background */}
      <div className="fixed inset-0 pointer-events-none sm:hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#d4a853]/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] hidden sm:block"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <CompassIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4a853]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight">Wayfinder</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/search" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
            Docs
          </Link>
          <Button asChild size="sm" className="bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628] font-semibold text-sm sm:text-base">
            <Link href="/search">Launch App</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <Badge className="mb-4 sm:mb-6 bg-[#d4a853]/10 text-[#d4a853] border-[#d4a853]/20 hover:bg-[#d4a853]/20 text-xs sm:text-sm">
              On-chain Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Navigate the
              <br />
              <span className="text-gradient-gold">unknown</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/50 mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
              Perform deep onchain research, unmask on-chain identities, trace cross-chain bridges, and assess risk — all from a single address. Your compass in the onchain wilderness.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628] font-semibold px-6 sm:px-8 glow-gold">
                <Link href="/search">Start Scanning</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-white/10 hover:bg-white/5 px-6 sm:px-8">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
          
          {/* Hero Visual - smaller on mobile */}
          <div className="flex-1 relative mt-8 lg:mt-0">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-[#d4a853]/20 animate-compass" />
              {/* Middle ring */}
              <div className="absolute inset-6 sm:inset-8 rounded-full border border-cyan-500/20 animate-compass" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
              {/* Inner glow */}
              <div className="absolute inset-12 sm:inset-16 rounded-full bg-gradient-to-br from-[#d4a853]/20 to-cyan-500/10 blur-xl" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#132240] border border-[#d4a853]/30 flex items-center justify-center glow-gold">
                  <CompassIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#d4a853]" />
                </div>
              </div>
              {/* Floating elements - hidden on very small screens */}
              <div className="absolute -top-2 sm:-top-4 right-4 sm:right-8 animate-float hidden sm:block">
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 glass rounded-full text-[10px] sm:text-xs font-mono text-[#d4a853]">0x1a2b...3c4d</div>
              </div>
              <div className="absolute -bottom-1 sm:-bottom-2 left-2 sm:left-4 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 glass rounded-full text-[10px] sm:text-xs font-mono text-cyan-400">vitalik.eth</div>
              </div>
              <div className="absolute top-1/2 -right-4 sm:-right-8 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 glass rounded-full text-[10px] sm:text-xs text-green-400">Low Risk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          <StatItem value="50+" label="Chains Supported" />
          <StatItem value="100M+" label="Addresses Indexed" />
          <StatItem value="<2s" label="Avg Scan Time" />
          <StatItem value="99.9%" label="Uptime" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <Badge className="mb-3 sm:mb-4 bg-white/5 text-white/60 border-white/10 text-xs sm:text-sm">Features</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Your on-chain toolkit</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm sm:text-base px-2">
            Everything you need to investigate, verify, and understand any wallet
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            icon={<SearchIcon />}
            title="Identity Search"
            description="ENS, Lens, Farcaster, and 20+ identity providers. Quick lookup or deep dive — your choice."
            color="gold"
          />
          <FeatureCard
            icon={<BridgeIcon />}
            title="Bridge Tracing"
            description="Track assets across chains. See where funds originated and where they're going."
            color="cyan"
          />
          <FeatureCard
            icon={<ShieldIcon />}
            title="Risk Scoring"
            description="Sanctions screening, mixer detection, and behavioral analysis in seconds."
            color="green"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-transparent via-[#0f1d32] to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-white/5 text-white/60 border-white/10 text-xs sm:text-sm">Process</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Three steps to clarity</h2>
          </div>
          
          <div className="relative">
            {/* Connection line - desktop only */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[#d4a853]/50 via-cyan-500/50 to-green-500/50" />
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
              <StepCard
                number="01"
                title="Paste Address"
                description="Enter any EVM wallet — EOA, contract, or ENS name."
                color="gold"
              />
              <StepCard
                number="02"
                title="Select Scan"
                description="Choose identity lookup, deep scan, or bridge tracing."
                color="cyan"
              />
              <StepCard
                number="03"
                title="Get Intel"
                description="Results in seconds. Export PDF reports."
                color="green"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center mx-auto glow-gold">
              <CompassIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4a853]" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Ready to explore?</h2>
          <p className="text-lg sm:text-xl text-white/50 mb-8 sm:mb-10 px-2">
            Paste an address. Get answers in seconds.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628] font-semibold px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg glow-gold">
            <Link href="/search">Launch Wayfinder</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-white/40">
            <CompassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Wayfinder</span>
          </div>
          <p className="text-xs sm:text-sm text-white/30">Navigate with confidence</p>
        </div>
      </footer>
    </main>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-gold mb-0.5 sm:mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-white/40">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: 'gold' | 'cyan' | 'green' }) {
  const colors = {
    gold: 'text-[#d4a853] bg-[#d4a853]/10 border-[#d4a853]/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  };
  
  return (
    <Card className="glass p-4 sm:p-6 hover:bg-white/[0.04] transition-colors group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors[color]} border flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{description}</p>
    </Card>
  );
}

function StepCard({ number, title, description, color }: { number: string; title: string; description: string; color: 'gold' | 'cyan' | 'green' }) {
  const colors = {
    gold: 'text-[#d4a853] border-[#d4a853]/30 bg-[#d4a853]/5',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    green: 'text-green-400 border-green-500/30 bg-green-500/5',
  };
  
  return (
    <div className="text-center">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ${colors[color]} border-2 flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
        <span className="text-xl sm:text-2xl font-bold">{number}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-white/50 text-sm">{description}</p>
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

function SearchIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
