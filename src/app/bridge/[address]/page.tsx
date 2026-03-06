'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BridgeTransfer {
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  sourceChain: string;
  destChain: string;
  timestamp: string;
  crossWallet?: boolean;
}

interface ExitWallet {
  address: string;
  chain: string;
  identity?: {
    ens?: string;
    labels?: string[];
  };
  totalReceived?: string;
}

interface BridgeData {
  address: string;
  bridges: {
    transfers: BridgeTransfer[];
    totalVolume?: string;
  };
  exits: ExitWallet[];
  tracedAt: string;
}

export default function BridgeResultPage() {
  const params = useParams();
  const address = params.address as string;

  const [data, setData] = useState<BridgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBridge = async () => {
      try {
        const res = await fetch(`/api/bridge/${address}`);
        if (!res.ok) throw new Error('Failed to fetch bridge data');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBridge();
  }, [address]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 animate-ping absolute" />
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <span className="text-white/60">Tracing bridges...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center p-4">
        <Card className="glass p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <Button asChild variant="outline" className="border-white/10">
            <Link href="/search">← Back to search</Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d4a853]/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <CompassIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a853]" />
          <span className="text-base sm:text-lg font-bold tracking-tight">Wayfinder</span>
        </Link>
      </nav>

      <div className="relative z-10 px-4 py-4 sm:py-8 max-w-5xl mx-auto">
        <Link href="/search" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs sm:text-sm mb-4 sm:mb-6 transition-colors">
          <span>←</span> Back to search
        </Link>

        {/* Header */}
        <Card className="glass p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <BridgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <h1 className="text-lg sm:text-xl font-bold">Bridge Exit Trace</h1>
          </div>
          <p className="text-white/40 font-mono text-xs sm:text-sm break-all">{address}</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="glass p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-white/40 mb-1 sm:mb-2">Transfers Found</p>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{data?.bridges.transfers.length || 0}</p>
          </Card>
          <Card className="glass p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-white/40 mb-1 sm:mb-2">Exit Wallets</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#d4a853]">{data?.exits.length || 0}</p>
          </Card>
        </div>

        {/* Exit Wallets */}
        {data?.exits && data.exits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
              Exit Wallets
            </h2>
            <div className="space-y-3">
              {data.exits.map((exit, i) => (
                <Card key={i} className="glass p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm break-all text-white/80">{exit.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-white/10 text-white/60 border-white/10">
                          {exit.chain}
                        </Badge>
                        {exit.identity?.ens && (
                          <Badge className="bg-[#d4a853]/10 text-[#d4a853] border-[#d4a853]/20">
                            {exit.identity.ens}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {exit.totalReceived && (
                      <div className="text-right shrink-0">
                        <p className="text-sm text-white/40">Received</p>
                        <p className="font-semibold">{exit.totalReceived}</p>
                      </div>
                    )}
                  </div>
                  {exit.identity?.labels && exit.identity.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                      {exit.identity.labels.map((label, j) => (
                        <Badge key={j} variant="outline" className="text-xs border-white/10 text-white/50">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transfers */}
        {data?.bridges.transfers && data.bridges.transfers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Bridge Transfers
            </h2>
            <div className="space-y-3">
              {data.bridges.transfers.map((tx, i) => (
                <Card key={i} className="glass p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white/10 text-white/70 border-white/10">
                        {tx.sourceChain}
                      </Badge>
                      <span className="text-cyan-400">→</span>
                      <Badge className="bg-white/10 text-white/70 border-white/10">
                        {tx.destChain}
                      </Badge>
                    </div>
                    {tx.crossWallet && (
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                        Cross-wallet
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      {tx.amount} <span className="text-white/50">{tx.token}</span>
                    </span>
                    <span className="text-sm text-white/40">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-white/30 mt-3 break-all">{tx.hash}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {data?.bridges.transfers.length === 0 && data?.exits.length === 0 && (
          <Card className="glass p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <BridgeIcon className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/40 mb-4">No bridge activity found for this wallet.</p>
            <Button asChild className="bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628]">
              <Link href="/search">Try Another Address</Link>
            </Button>
          </Card>
        )}
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

function BridgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
