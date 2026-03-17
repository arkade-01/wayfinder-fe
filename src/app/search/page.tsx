'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
    result?: unknown;
    error?: string;
  }>;
}

export default function SearchPage() {
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
      window.open(`/scan/${data.scanId}`, '_blank');
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
    <main className="min-h-screen text-white" style={{ background: 'var(--navy)' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(201,147,62,0.05)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'rgba(34,211,238,0.04)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <CompassIcon className="w-6 h-6" style={{ color: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Wayfinder</span>
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-4 pt-4 sm:pt-8 pb-12 sm:pb-20">
        <div className="w-full max-w-lg glass rounded-2xl p-5 sm:p-8 shadow-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-gold"
              style={{ background: 'var(--navy-3)', border: '1px solid rgba(201,147,62,0.2)' }}>
              <CompassIcon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--gold)' }} />
            </div>
            <h1 className="text-xl sm:text-2xl mb-1.5 sm:mb-2"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}>Scan Wallet</h1>
            <p className="text-sm sm:text-base"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300 }}>
              Enter an address or ENS name to begin investigation
            </p>
          </div>

          {/* Rate Limits */}
          {limits && (
            <div className="flex justify-center gap-2 sm:gap-4 mb-5 sm:mb-6">
              {limits.betaMode ? (
                <span className="px-3 py-1 text-xs font-medium rounded-full border"
                  style={{ background: 'rgba(201,147,62,0.1)', color: 'var(--gold)', borderColor: 'rgba(201,147,62,0.2)', fontFamily: 'var(--font-jetbrains)' }}>
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
                {/* Mode tabs */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setScanMode('single'); setError(''); }}
                      className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: scanMode === 'single' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: scanMode === 'single' ? 'white' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => { setScanMode('bulk'); setError(''); }}
                      className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                      style={{
                        background: scanMode === 'bulk' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: scanMode === 'bulk' ? 'white' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Bulk
                    </button>
                  </div>
                  {scanMode === 'bulk' && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs transition-colors"
                        style={{ color: 'var(--gold)', fontFamily: 'var(--font-jetbrains)' }}
                        onMouseOver={e => (e.currentTarget.style.color = 'var(--gold-light)')}
                        onMouseOut={e => (e.currentTarget.style.color = 'var(--gold)')}
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
                      className="scan-input w-full px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm"
                    />
                    {address && !isValidAddress && (
                      <p className="text-red-400 text-sm mt-2" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                        ⚠️ Enter a valid address (0x…) or ENS name (.eth)
                      </p>
                    )}
                    {/* Example wallets */}
                    <div className="mt-3">
                      <p className="text-[10px] mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-jetbrains)' }}>Try an example</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '🟢 Low Risk', addr: 'vitalik.eth' },
                          { label: '🟡 Medium Risk', addr: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
                          { label: '🔴 High Risk', addr: '0x3BC4DF8D4e1D0E8f367Af05c84fF7e6B73ffa96D' },
                        ].map(({ label, addr }) => (
                          <button
                            key={addr}
                            type="button"
                            onClick={() => setAddress(addr)}
                            className="px-2 py-1 rounded-md border text-[10px] transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-jetbrains)', background: 'rgba(255,255,255,0.03)' }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
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
                      className="scan-input w-full px-4 py-3 text-xs sm:text-sm resize-none"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs"
                      style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains)' }}>
                      <span>{validCount} valid address{validCount !== 1 ? 'es' : ''}</span>
                      <span>Max 50</span>
                    </div>
                  </>
                )}
              </div>

              {/* Scan Type */}
              {scanMode === 'single' ? (
                <ScanTypeSelector scanType={scanType} setScanType={setScanType} getRemaining={getRemaining} limits={limits} />
              ) : (
                <div>
                  <p className="section-label mb-2">Scan Mode</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setScanType('quick')}
                      className="flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all"
                      style={{
                        borderColor: scanType === 'quick' ? 'rgba(201,147,62,0.5)' : 'rgba(255,255,255,0.1)',
                        background: scanType === 'quick' ? 'rgba(201,147,62,0.1)' : 'transparent',
                        color: scanType === 'quick' ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Quick
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanType('full')}
                      className="flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all"
                      style={{
                        borderColor: scanType === 'full' ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)',
                        background: scanType === 'full' ? 'rgba(34,211,238,0.1)' : 'transparent',
                        color: scanType === 'full' ? 'var(--cyan)' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Deep
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg border text-sm text-center"
                  style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171', fontFamily: 'var(--font-jetbrains)' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={scanMode === 'single' ? (!isValidAddress || loading || isLimitReached(scanType)) : (validCount === 0 || loading)}
                className="btn-gold w-full py-3.5 sm:py-4 rounded-xl text-sm sm:text-base"
              >
                {loading ? 'Processing...' :
                  scanMode === 'single'
                    ? (isLimitReached(scanType) ? 'Limit Reached' : 'Scan Wallet')
                    : `Scan ${validCount} Wallet${validCount !== 1 ? 's' : ''}`
                }
              </button>
            </form>
          )}

          {/* Bulk Job Progress */}
          {bulkJob && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-syne)' }}>
                    {bulkJob.status === 'COMPLETE' ? 'Complete' : 'Scanning...'}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-jetbrains)' }}>
                    {bulkJob.completed}/{bulkJob.total}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bulkJob.progress}%`, background: 'var(--gold)' }} />
                </div>
              </div>

              {bulkJob.scans.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bulkJob.scans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                      <span className="truncate flex-1 mr-3 text-xs"
                        style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.6)' }}>
                        {scan.address}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(scan.status)}>{scan.status}</Badge>
                        {scan.status === 'COMPLETE' && (
                          <Link href={`/scan/${scan.id}`} target="_blank" rel="noopener noreferrer" className="text-xs transition-colors"
                            style={{ color: 'var(--gold)', fontFamily: 'var(--font-jetbrains)' }}>
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bulkJob.status === 'COMPLETE' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setBulkJob(null); setBulkAddresses(''); setScanMode('bulk'); }}
                    className="flex-1 py-2.5 rounded-xl border text-sm transition-all hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-syne)' }}
                  >
                    New Batch
                  </button>
                  <button
                    onClick={() => {
                      const csv = ['address,status,ens,twitter']
                        .concat(bulkJob.scans.map(s => {
                          const result = s.result as { identity?: { ens?: string; twitter?: string } } | undefined;
                          const ens = result?.identity?.ens || '';
                          const twitter = result?.identity?.twitter || '';
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
                    className="btn-gold flex-1 py-2.5 rounded-xl text-sm"
                  >
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {!limits?.betaMode && (
            <p className="text-center mt-4 sm:mt-6 text-[10px] sm:text-xs"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.05em' }}>
              Limits reset daily at midnight UTC
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function LimitBadge({ label, remaining, limit }: { label: string; remaining: number; limit: number }) {
  const color = remaining === 0
    ? { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' }
    : remaining <= 1
    ? { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.2)' }
    : { bg: 'rgba(52,211,153,0.1)', text: '#34d399', border: 'rgba(52,211,153,0.2)' };

  return (
    <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs"
      style={{ background: color.bg, color: color.text, borderColor: color.border, fontFamily: 'var(--font-jetbrains)' }}>
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
      <p className="section-label mb-2 sm:mb-3">Scan Type</p>
      <div className="space-y-2">
        <ScanOption selected={scanType === 'full'} onClick={() => setScanType('full')} title="Identity (Deep)" description="Full scan — identity + bridges + exit wallets" color="cyan" remaining={getRemaining('full')} limit={limits?.full.limit || 1} disabled={isLimitReached('full')} recommended betaMode={limits?.betaMode} />
        <ScanOption selected={scanType === 'quick'} onClick={() => setScanType('quick')} title="Identity (Basic)" description="Quick identity lookup — ENS, socials, labels" color="gold" remaining={getRemaining('quick')} limit={limits?.quick.limit || 3} disabled={isLimitReached('quick')} betaMode={limits?.betaMode} />
        <ScanOption selected={scanType === 'bridge'} onClick={() => setScanType('bridge')} title="Bridge Exit Trace" description="Track cross-chain transfers and destinations" color="green" remaining={getRemaining('bridge')} limit={limits?.bridge.limit || 1} disabled={isLimitReached('bridge')} betaMode={limits?.betaMode} />
      </div>
    </div>
  );
}

function ScanOption({ selected, onClick, title, description, color, remaining, limit, recommended, disabled, betaMode }: {
  selected: boolean; onClick: () => void; title: string; description: string;
  color: 'gold' | 'cyan' | 'green'; remaining: number; limit: number; recommended?: boolean; disabled?: boolean; betaMode?: boolean;
}) {
  const colorVars = {
    gold: { selectedBorder: 'rgba(201,147,62,0.5)', selectedBg: 'rgba(201,147,62,0.1)', ringBorder: 'var(--gold)', text: 'var(--gold)' },
    cyan: { selectedBorder: 'rgba(34,211,238,0.5)', selectedBg: 'rgba(34,211,238,0.1)', ringBorder: 'var(--cyan)', text: 'var(--cyan)' },
    green: { selectedBorder: 'rgba(52,211,153,0.5)', selectedBg: 'rgba(52,211,153,0.1)', ringBorder: 'var(--green)', text: 'var(--green)' },
  };
  const c = colorVars[color];

  const borderColor = disabled ? 'rgba(255,255,255,0.05)' : selected ? c.selectedBorder : 'rgba(255,255,255,0.09)';
  const bgColor = disabled ? 'rgba(255,255,255,0.01)' : selected ? c.selectedBg : 'transparent';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-3 sm:p-4 rounded-xl border transition-all"
      style={{
        borderColor,
        background: bgColor,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm sm:text-base" style={{ fontFamily: 'var(--font-syne)' }}>{title}</p>
            {recommended && !disabled && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded"
                style={{ background: 'rgba(34,211,238,0.2)', color: 'var(--cyan)', fontFamily: 'var(--font-jetbrains)' }}>
                Recommended
              </span>
            )}
            {!betaMode && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                style={{
                  background: remaining === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
                  color: remaining === 0 ? '#f87171' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-jetbrains)',
                }}>
                {remaining}/{limit}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains)', fontWeight: 300 }}>
            {description}
          </p>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 flex-shrink-0 transition-all"
          style={{ borderColor: disabled ? 'rgba(255,255,255,0.1)' : selected ? c.ringBorder : 'rgba(255,255,255,0.2)' }}>
          {selected && !disabled && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

function CompassIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}
