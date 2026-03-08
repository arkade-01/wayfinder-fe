'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ScanMode = 'quick' | 'full';

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

export default function BulkScanPage() {
  const [addresses, setAddresses] = useState('');
  const [mode, setMode] = useState<ScanMode>('quick');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<BulkJobStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const parseAddresses = (text: string): string[] => {
    return text
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => /^0x[0-9a-fA-F]{40}$/i.test(a));
  };

  const addressList = parseAddresses(addresses);
  const validCount = addressList.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setAddresses(text);
    };
    reader.readAsText(file);
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/scan/bulk/${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch job status');
      const data = await res.json();
      setJob(data);

      if (data.status === 'RUNNING') {
        pollRef.current = setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validCount === 0) return;
    if (validCount > 50) {
      setError('Maximum 50 addresses per batch');
      return;
    }

    setLoading(true);
    setError('');
    setJob(null);

    try {
      const res = await fetch('/api/scan/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: addressList, mode }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create bulk job');
      }

      const data = await res.json();
      setJob({ 
        jobId: data.jobId, 
        status: 'RUNNING', 
        progress: 0, 
        total: data.total,
        completed: 0,
        failed: 0,
        mode: data.mode,
        scans: [],
      });

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
        <Link href="/search" className="text-sm text-white/50 hover:text-white transition-colors">
          Single Scan →
        </Link>
      </nav>

      <div className="relative z-10 px-4 py-4 sm:py-8 max-w-4xl mx-auto">
        <Card className="glass p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Bulk Scan</h1>
            <p className="text-white/50 text-sm sm:text-base">Scan multiple wallets at once</p>
          </div>

          {!job ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Addresses Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-white/70">
                    Wallet Addresses
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#d4a853] hover:text-[#e8c878] transition-colors"
                  >
                    Upload CSV
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                  placeholder="Paste addresses here, one per line or comma-separated&#10;&#10;0x889D...&#10;0xd8dA...&#10;0xe9b3..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#d4a853]/50 focus:ring-1 focus:ring-[#d4a853]/50 text-white placeholder-white/30 font-mono text-xs sm:text-sm resize-none transition-colors"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                  <span>{validCount} valid address{validCount !== 1 ? 'es' : ''} detected</span>
                  <span>Max 50 per batch</span>
                </div>
              </div>

              {/* Scan Mode */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">
                  Scan Mode
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('quick')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      mode === 'quick'
                        ? 'border-[#d4a853]/50 bg-[#d4a853]/10 text-[#d4a853]'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    Quick (Identity)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('full')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      mode === 'full'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    Deep (+ Bridges)
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={validCount === 0 || loading}
                className="w-full py-5 sm:py-6 bg-[#d4a853] hover:bg-[#e8c878] disabled:bg-white/10 disabled:text-white/30 text-[#0a1628] font-semibold text-sm sm:text-base rounded-xl transition-all"
              >
                {loading ? 'Starting...' : `Scan ${validCount} Wallet${validCount !== 1 ? 's' : ''}`}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {job.status === 'COMPLETE' ? 'Complete' : 'Scanning...'}
                  </span>
                  <span className="text-sm text-white/50">
                    {job.completed}/{job.total}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#d4a853] transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {/* Results */}
              {job.scans.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {job.scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="font-mono text-xs text-white/70 truncate flex-1 mr-3">
                        {scan.address}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                        {scan.status === 'COMPLETE' && (
                          <Link
                            href={`/scan/${scan.id}`}
                            className="text-xs text-[#d4a853] hover:text-[#e8c878]"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {job.status === 'COMPLETE' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setJob(null);
                      setAddresses('');
                    }}
                    variant="outline"
                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5"
                  >
                    New Batch
                  </Button>
                  <Button
                    onClick={() => {
                      const csv = ['address,status,ens,twitter']
                        .concat(job.scans.map(s => {
                          const ens = s.result?.identity?.ens || '';
                          const twitter = s.result?.identity?.twitter || '';
                          return `${s.address},${s.status},${ens},${twitter}`;
                        }))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `wayfinder-bulk-${job.jobId.slice(0, 8)}.csv`;
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
        </Card>
      </div>
    </main>
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
