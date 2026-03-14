'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ScanType = 'quick' | 'full' | 'bridge';
type ScanMode = 'single' | 'bulk';

interface Limits {
  betaMode?: boolean;
  quick: { used: number; limit: number; resetsAt: string };
  full: { used: number; limit: number; resetsAt: string };
  bridge: { used: number; limit: number; resetsAt: string };
  bulk: { used: number; limit: number; resetsAt: string };
}

interface BulkJobStatus {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  progress: number;
  total: number;
  completed: number;
  failed: number;
  mode: string;
  scans: Array<{
    id: string;
    address: string;
    status: string;
    result?: any;
    error?: string;
  }>;
}

export default function SearchPage() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<ScanMode>('single');
  const [address, setAddress] = useState('');
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [scanType, setScanType] = useState<ScanType>('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limits, setLimits] = useState<Limits | null>(null);
  const [bulkJob, setBulkJob] = useState<BulkJobStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const isValidAddress =
    /^0x[0-9a-fA-F]{40}$/.test(address) ||
    /^[a-zA-Z0-9][a-zA-Z0-9-]*\.eth$/.test(address.trim());

  const parseAddresses = (text: string): string[] => {
    return text
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => /^0x[0-9a-fA-F]{40}$/i.test(a) || /^[a-zA-Z0-9][a-zA-Z0-9-]*\.eth$/i.test(a));
  };

  const addressList = parseAddresses(bulkAddresses);
  const validCount = addressList.length;

  // Fetch limits
  const fetchLimits = () => {
    fetch('/api/limits', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setLimits(data.limits))
      .catch(() => {});
  };

  useEffect(() => {
    fetchLimits();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const getRemaining = (type: ScanType): number => {
    if (!limits) return 999;
    const l = limits[type];
    return l.limit - l.used;
  };

  const isLimitReached = (type: ScanType): boolean => {
    if (limits?.betaMode) return false;
    return getRemaining(type) <= 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBulkAddresses(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/scan/bulk/${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch job status');
      const data = await res.json();
      setBulkJob(data);
      if (data.status === 'RUNNING') {
        pollRef.current = setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAddress) return;
    if (isLimitReached(scanType)) {
      setError(`Daily limit reached for this scan type. Resets at midnight UTC.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
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
      fetchLimits();
      router.push(`/scan/${data.scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validCount === 0) return;
    if (validCount > 50) {
      setError('Maximum 50 addresses per batch');
      return;
    }

    const bulkMode = scanType === 'bridge' ? 'bridge' : scanType;

    setLoading(true);
    setError('');
    setBulkJob(null);

    try {
      const res = await fetch('/api/scan/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: addressList, mode: bulkMode }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create bulk job');
      }

      const data = await res.json();
      setBulkJob({
        jobId: data.jobId,
        status: 'RUNNING',
        progress: 0,
        total: data.total,
        completed: 0,
        failed: 0,
        mode: data.mode,
        scans: [],
      });
      fetchLimits();
      pollJobStatus(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'RUNNING': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-white/10 text-white/50 border-white/20';
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Background */}
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
            <p className="text-white/50 text-sm sm:text-base">Enter an address or ENS name to begin investigation</p>
          </div>

          {/* Rate Limits */}
          {limits && (
            <div className="flex justify-center gap-2 sm:gap-4 mb-5 sm:mb-6">
              {limits.betaMode ? (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#d4a853]/10 text-[#d4a853] border border-[#d4a853]/20">
                  🚀 Beta — Unlimited Scans
                </span>
              ) : (
                <>
                  <LimitBadge label="Basic" remaining={getRemaining('quick')} limit={limits.quick.limit} />
                  <LimitBadge label="Deep" remaining={getRemaining('full')} limit={limits.full.limit} />
                  <LimitBadge label="Bridge" remaining={getRemaining('bridge')} limit={limits.bridge.limit} />
                </>
              )}
            </div>
          )}

          {/* Input Section with Mode Tabs */}
          {!bulkJob && (
            <form onSubmit={scanMode === 'single' ? handleSingleSubmit : handleBulkSubmit} className="space-y-4 sm:space-y-6">
              <div>
                {/* Tabs on Input */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setScanMode('single'); setError(''); }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        scanMode === 'single' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => { setScanMode('bulk'); setError(''); }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        scanMode === 'bulk' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      Bulk
                    </button>
                  </div>
                  {scanMode === 'bulk' && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#d4a853] hover:text-[#e8c878] transition-colors"
                      >
                        Upload CSV
                      </button>
                      <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                    </>
                  )}
                </div>

                {/* Single Input */}
                {scanMode === 'single' && (
                  <>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="0x... or vitalik.eth"
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#d4a853]/50 focus:ring-1 focus:ring-[#d4a853]/50 text-white placeholder-white/30 font-mono text-xs sm:text-sm transition-colors"
                    />
                    {address && !isValidAddress && (
                      <p className="text-red-400 text-sm mt-2">⚠️ Enter a valid address (0x…) or ENS name (.eth)</p>
                    )}
                  </>
                )}

                {/* Bulk Input */}
                {scanMode === 'bulk' && (
                  <>
                    <textarea
                      value={bulkAddresses}
                      onChange={(e) => setBulkAddresses(e.target.value)}
                      placeholder="Paste addresses or ENS names, one per line...&#10;0x889D...&#10;vitalik.eth"
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#d4a853]/50 text-white placeholder-white/30 font-mono text-xs sm:text-sm resize-none transition-colors"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                      <span>{validCount} valid address{validCount !== 1 ? 'es' : ''}</span>
                      <span>Max 50</span>
                    </div>
                  </>
                )}
              </div>

              {/* Scan Type - only for single mode, bulk uses quick/full toggle */}
              {scanMode === 'single' ? (
                <ScanTypeSelector scanType={scanType} setScanType={setScanType} getRemaining={getRemaining} limits={limits} />
              ) : (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">Scan Mode</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setScanType('quick')}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        scanType === 'quick' ? 'border-[#d4a853]/50 bg-[#d4a853]/10 text-[#d4a853]' : 'border-white/10 text-white/50 hover:border-white/20'
                      }`}
                    >
                      Quick
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanType('full')}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        scanType === 'full' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-white/50 hover:border-white/20'
                      }`}
                    >
                      Deep
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={scanMode === 'single' ? (!isValidAddress || loading || isLimitReached(scanType)) : (validCount === 0 || loading)}
                className="w-full py-5 sm:py-6 bg-[#d4a853] hover:bg-[#e8c878] disabled:bg-white/10 disabled:text-white/30 text-[#0a1628] font-semibold text-sm sm:text-base rounded-xl transition-all"
              >
                {loading ? 'Processing...' : 
                  scanMode === 'single' 
                    ? (isLimitReached(scanType) ? 'Limit Reached' : 'Scan Wallet')
                    : `Scan ${validCount} Wallet${validCount !== 1 ? 's' : ''}`
                }
              </Button>
            </form>
          )}

          {/* Bulk Job Progress */}
          {bulkJob && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{bulkJob.status === 'COMPLETE' ? 'Complete' : 'Scanning...'}</span>
                  <span className="text-sm text-white/50">{bulkJob.completed}/{bulkJob.total}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4a853] transition-all duration-500" style={{ width: `${bulkJob.progress}%` }} />
                </div>
              </div>

              {bulkJob.scans.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bulkJob.scans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="font-mono text-xs text-white/70 truncate flex-1 mr-3">{scan.address}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(scan.status)}>{scan.status}</Badge>
                        {scan.status === 'COMPLETE' && (
                          <Link href={`/scan/${scan.id}`} className="text-xs text-[#d4a853] hover:text-[#e8c878]">View →</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bulkJob.status === 'COMPLETE' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setBulkJob(null); setBulkAddresses(''); setScanMode('bulk'); }}
                    variant="outline"
                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5"
                  >
                    New Batch
                  </Button>
                  <Button
                    onClick={() => {
                      const csv = ['address,status,ens,twitter']
                        .concat(bulkJob.scans.map(s => {
                          const ens = s.result?.identity?.ens || '';
                          const twitter = s.result?.identity?.twitter || '';
                          return `${s.address},${s.status},${ens},${twitter}`;
                        }))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `wayfinder-bulk-${bulkJob.jobId.slice(0, 8)}.csv`;
                      a.click();
                    }}
                    className="flex-1 bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628]"
                  >
                    Export CSV
                  </Button>
                </div>
              )}
            </div>
          )}

          {!limits?.betaMode && (
            <p className="text-center text-white/30 text-[10px] sm:text-xs mt-4 sm:mt-6">
              Limits reset daily at midnight UTC
            </p>
          )}
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

function ScanTypeSelector({ scanType, setScanType, getRemaining, limits }: {
  scanType: ScanType;
  setScanType: (type: ScanType) => void;
  getRemaining: (type: ScanType) => number;
  limits: Limits | null;
}) {
  const isLimitReached = (type: ScanType) => !limits?.betaMode && getRemaining(type) <= 0;

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2 sm:mb-3">Scan Type</label>
      <div className="space-y-2">
        <ScanOption selected={scanType === 'quick'} onClick={() => setScanType('quick')} title="Identity (Basic)" description="Quick identity lookup — ENS, socials, labels" color="gold" remaining={getRemaining('quick')} limit={limits?.quick.limit || 3} disabled={isLimitReached('quick')} betaMode={limits?.betaMode} />
        <ScanOption selected={scanType === 'full'} onClick={() => setScanType('full')} title="Identity (Deep)" description="Full scan — identity + bridges + exit wallets" color="cyan" remaining={getRemaining('full')} limit={limits?.full.limit || 1} disabled={isLimitReached('full')} recommended betaMode={limits?.betaMode} />
        <ScanOption selected={scanType === 'bridge'} onClick={() => setScanType('bridge')} title="Bridge Exit Trace" description="Track cross-chain transfers and destinations" color="green" remaining={getRemaining('bridge')} limit={limits?.bridge.limit || 1} disabled={isLimitReached('bridge')} betaMode={limits?.betaMode} />
      </div>
    </div>
  );
}

function ScanOption({ selected, onClick, title, description, color, remaining, limit, recommended, disabled, betaMode }: {
  selected: boolean; onClick: () => void; title: string; description: string;
  color: 'gold' | 'cyan' | 'green'; remaining: number; limit: number; recommended?: boolean; disabled?: boolean; betaMode?: boolean;
}) {
  const colors = {
    gold: { selected: 'border-[#d4a853]/50 bg-[#d4a853]/10', ring: 'border-[#d4a853] bg-[#d4a853]' },
    cyan: { selected: 'border-cyan-500/50 bg-cyan-500/10', ring: 'border-cyan-400 bg-cyan-400' },
    green: { selected: 'border-green-500/50 bg-green-500/10', ring: 'border-green-400 bg-green-400' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
        disabled ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
        : selected ? colors[color].selected : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm sm:text-base">{title}</p>
            {recommended && !disabled && <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-cyan-500/20 text-cyan-400 rounded">Recommended</span>}
            {!betaMode && <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${remaining === 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'}`}>{remaining}/{limit}</span>}
          </div>
          <p className="text-xs sm:text-sm text-white/40 mt-0.5">{description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${disabled ? 'border-white/10' : selected ? colors[color].ring : 'border-white/20'}`}>
          {selected && !disabled && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}
