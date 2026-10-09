import Link from 'next/link';

export function CompassIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteNav() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <CompassIcon className="w-6 h-6" style={{ color: 'var(--gold)' }} />
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Wayfinder</span>
      </Link>
      <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'var(--font-jetbrains)' }}>
        <Link href="/search" className="text-white/50 hover:text-white transition-colors">Scan</Link>
        <Link href="/og" className="text-white/50 hover:text-white transition-colors">OG Finder</Link>
      </div>
    </nav>
  );
}

export function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(201,147,62,0.05)' }} />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[100px]" style={{ background: 'rgba(34,211,238,0.04)' }} />
    </div>
  );
}
