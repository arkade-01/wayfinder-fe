'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ScanType = 'quick' | 'full' | 'bridge';

interface Limits {
  quick: { used: number; limit: number; resetsAt: string };
  full: { used: number; limit: number; resetsAt: string };
  bridge: { used: number; limit: number; resetsAt: string };
}

export default function SearchPage() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [scanType, setScanType] = useState<ScanType>('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limits, setLimits] = useState<Limits | null>(null);

  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(address);

  // Fetch limits
  const fetchLimits = () => {
    fetch('/api/limits', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setLimits(data.limits))
      .catch(() => {});
  };

  // Fetch on mount
  useEffect(() => {
    fetchLimits();
  }, []);

  const getRemaining = (type: ScanType): number => {
    if (!limits) return 999;
    const l = limits[type];
    return l.limit - l.used;
  };

  const isLimitReached = (type: ScanType): boolean => {
    return getRemaining(type) <= 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAddress) return;
    if (isLimitReached(scanType)) {
      setError(`Daily limit reached for this scan type. Resets at midnight UTC.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (scanType === 'bridge') {
        const res = await fetch(`/api/bridge/${address.toLowerCase()}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to trace bridges');
        }
        fetchLimits(); // Refresh limits after scan
        router.push(`/bridge/${address.toLowerCase()}`);
      } else {
        const res = await fetch(`/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, mode: scanType }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to queue scan');
        }

        const data = await res.json();
        fetchLimits(); // Refresh limits after scan
        router.push(`/scan/${data.scanId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#d4a853]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <CompassIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a853]" />
          <span className="text-base sm:text-lg font-bold tracking-tight">Wayfinder</span>
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-4 pt-4 sm:pt-8 pb-12 sm:pb-20">
        <Card className="w-full max-w-lg glass p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CompassIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a853]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Scan Wallet</h1>
            <p className="text-white/50 text-sm sm:text-base">Enter an address to begin investigation</p>
          </div>

          {/* Rate Limits Display */}
          {limits && (
            <div className="flex justify-center gap-2 sm:gap-4 mb-5 sm:mb-6">
              <LimitBadge label="Basic" remaining={getRemaining('quick')} limit={limits.quick.limit} />
              <LimitBadge label="Deep" remaining={getRemaining('full')} limit={limits.full.limit} />
              <LimitBadge label="Bridge" remaining={getRemaining('bridge')} limit={limits.bridge.limit} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Wallet Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1.5 sm:mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x... or ENS name"
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#d4a853]/50 focus:ring-1 focus:ring-[#d4a853]/50 text-white placeholder-white/30 font-mono text-xs sm:text-sm transition-colors"
              />
              {address && !isValidAddress && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> Invalid address format
                </p>
              )}
            </div>

            {/* Scan Type Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2 sm:mb-3">
                Scan Type
              </label>
              <div className="space-y-2">
                <ScanOption
                  selected={scanType === 'quick'}
                  onClick={() => setScanType('quick')}
                  icon={<SearchIcon />}
                  title="Identity Search (Basic)"
                  description="Quick identity lookup — ENS, socials, labels"
                  color="gold"
                  remaining={getRemaining('quick')}
                  limit={limits?.quick.limit || 3}
                  disabled={isLimitReached('quick')}
                />
                <ScanOption
                  selected={scanType === 'full'}
                  onClick={() => setScanType('full')}
                  icon={<RadarIcon />}
                  title="Identity Search (Deep)"
                  description="Full scan — identity + bridges + exit wallets"
                  color="cyan"
                  remaining={getRemaining('full')}
                  limit={limits?.full.limit || 1}
                  disabled={isLimitReached('full')}
                  recommended
                />
                <ScanOption
                  selected={scanType === 'bridge'}
                  onClick={() => setScanType('bridge')}
                  icon={<BridgeIcon />}
                  title="Bridge Exit Trace"
                  description="Track cross-chain transfers and destinations"
                  color="green"
                  remaining={getRemaining('bridge')}
                  limit={limits?.bridge.limit || 1}
                  disabled={isLimitReached('bridge')}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValidAddress || loading || isLimitReached(scanType)}
              className="w-full py-5 sm:py-6 bg-[#d4a853] hover:bg-[#e8c878] disabled:bg-white/10 disabled:text-white/30 text-[#0a1628] font-semibold text-sm sm:text-base rounded-xl transition-all glow-gold disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLimitReached(scanType) ? (
                'Limit Reached'
              ) : (
                'Scan Wallet'
              )}
            </Button>
          </form>

          <p className="text-center text-white/30 text-[10px] sm:text-xs mt-4 sm:mt-6">
            Limits reset daily at midnight UTC
          </p>
        </Card>
      </div>
    </main>
  );
}

function LimitBadge({ label, remaining, limit }: { label: string; remaining: number; limit: number }) {
  const color = remaining === 0 ? 'text-red-400 bg-red-500/10 border-red-500/20' 
              : remaining <= 1 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
              : 'text-green-400 bg-green-500/10 border-green-500/20';
  
  return (
    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs ${color}`}>
      <span className="font-medium">{label}:</span> {remaining}/{limit}
    </div>
  );
}

function ScanOption({
  selected,
  onClick,
  icon,
  title,
  description,
  color,
  remaining,
  limit,
  recommended,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'gold' | 'cyan' | 'green';
  remaining: number;
  limit: number;
  recommended?: boolean;
  disabled?: boolean;
}) {
  const colors = {
    gold: {
      selected: 'border-[#d4a853]/50 bg-[#d4a853]/10',
      icon: 'text-[#d4a853] bg-[#d4a853]/10',
      ring: 'border-[#d4a853] bg-[#d4a853]',
    },
    cyan: {
      selected: 'border-cyan-500/50 bg-cyan-500/10',
      icon: 'text-cyan-400 bg-cyan-500/10',
      ring: 'border-cyan-400 bg-cyan-400',
    },
    green: {
      selected: 'border-green-500/50 bg-green-500/10',
      icon: 'text-green-400 bg-green-500/10',
      ring: 'border-green-400 bg-green-400',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
        disabled 
          ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
          : selected
            ? colors[color].selected
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${colors[color].icon} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="font-medium text-sm sm:text-base">{title}</p>
            {recommended && !disabled && (
              <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide bg-cyan-500/20 text-cyan-400 rounded hidden sm:inline">
                Recommended
              </span>
            )}
            <span className={`px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium rounded ${
              remaining === 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'
            }`}>
              {remaining}/{limit}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/40 mt-0.5 line-clamp-2">{description}</p>
        </div>
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            disabled ? 'border-white/10' : selected ? colors[color].ring : 'border-white/20'
          }`}
        >
          {selected && !disabled && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
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
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 18h.01" />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
      <circle cx="12" cy="12" r="2" />
      <path d="m13.41 10.59 5.66-5.66" />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
