'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface XResult {
  username: string;
  name: string;
  followers: number;
  bio: string;
  score: number;
  tweetUrl: string;
}

interface WebResult {
  title: string;
  link: string;
  snippet: string;
}

interface ScanResult {
  scanId: string;
  address: string;
  identity?: {
    ens?: string | null;
    twitter?: string | null;
    lens?: string | null;
    farcaster?: string | null;
    web?: WebResult[];
    xResults?: XResult[];
  };
  onchain?: {
    balanceEth: number;
    balanceUsd: number;
    txCount: number;
    lastActive: string;
    tokens: string[];
    nfts: string[];
    topContacts: string[];
  };
  bridges?: {
    totalBridgedUsd: number;
    bridgesUsed: string[];
    destChains: string[];
    transfers: unknown[];
  };
  exits?: unknown[];
  risk?: {
    crossWalletExits: number;
    unknownExits: number;
    phishingContact: boolean;
    mixerContact: boolean;
    highValueBridge: boolean;
  };
  cachedAt?: string;
}

interface ScanData {
  id: string;
  address: string;
  status: 'PENDING' | 'PROCESSING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  mode: string;
  result?: ScanResult;
  createdAt: string;
}

export default function ScanResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [scan, setScan] = useState<ScanData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const res = await fetch(`/api/scan/${id}`);
        if (!res.ok) throw new Error('Scan not found');
        const data = await res.json();
        setScan(data);

        if (data.status === 'PENDING' || data.status === 'PROCESSING' || data.status === 'RUNNING') {
          setTimeout(fetchScan, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan');
      }
    };

    fetchScan();
  }, [id]);

  const downloadPdf = () => {
    window.open(`/api/scan/${id}/report`, '_blank');
  };

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

  if (!scan) {
    return (
      <main className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60">Loading...</span>
        </div>
      </main>
    );
  }

  const isPending = scan.status === 'PENDING' || scan.status === 'PROCESSING' || scan.status === 'RUNNING';
  const result = scan.result;
  const identity = result?.identity;
  const onchain = result?.onchain;
  const risk = result?.risk;

  // Calculate risk score from flags
  const riskScore = risk ? 
    (risk.phishingContact ? 40 : 0) + 
    (risk.mixerContact ? 30 : 0) + 
    (risk.highValueBridge ? 10 : 0) + 
    (risk.crossWalletExits * 5) + 
    (risk.unknownExits * 5) : 0;

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d4a853]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <CompassIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#d4a853]" />
          <span className="text-base sm:text-lg font-bold tracking-tight">Wayfinder</span>
        </Link>
      </nav>

      <div className="relative z-10 px-4 py-4 sm:py-8 max-w-3xl mx-auto">
        <Link href="/search" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs sm:text-sm mb-4 sm:mb-6 transition-colors">
          <span>←</span> Back to search
        </Link>

        {/* Header */}
        <Card className="glass p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold">Scan Results</h1>
                <StatusBadge status={scan.status} />
              </div>
              <p className="text-white/40 font-mono text-xs sm:text-sm break-all">{scan.address}</p>
            </div>
            {scan.status === 'COMPLETE' && (
              <Button onClick={downloadPdf} className="w-full sm:w-auto bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628] font-semibold text-sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </Card>

        {isPending && (
          <Card className="glass p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a853]/20 animate-ping absolute" />
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a853] border-t-transparent animate-spin" />
              </div>
              <p className="text-white/60">Scanning wallet...</p>
              <p className="text-white/30 text-sm">This may take a few seconds</p>
            </div>
          </Card>
        )}

        {scan.status === 'COMPLETE' && result && (
          <div className="space-y-4 sm:space-y-6">
            {/* Risk Score */}
            <Card className="glass p-4 sm:p-6">
              <h2 className="text-xs sm:text-sm font-medium text-white/40 mb-3 sm:mb-4">Risk Assessment</h2>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <svg className="w-20 h-20 sm:w-28 sm:h-28 -rotate-90">
                    <circle cx="40" cy="40" r="34" className="sm:hidden" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle cx="56" cy="56" r="48" className="hidden sm:block" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34" className="sm:hidden" fill="none"
                      stroke={getRiskColor(riskScore)}
                      strokeWidth="6"
                      strokeDasharray={`${(riskScore / 100) * 213.6} 213.6`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="56" cy="56" r="48" className="hidden sm:block" fill="none"
                      stroke={getRiskColor(riskScore)}
                      strokeWidth="8"
                      strokeDasharray={`${(riskScore / 100) * 301.6} 301.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl sm:text-3xl font-bold ${getRiskTextColor(riskScore)}`}>{riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className={`text-base sm:text-lg font-semibold ${getRiskTextColor(riskScore)}`}>{getRiskLabel(riskScore)}</p>
                  <p className="text-white/40 text-xs sm:text-sm mt-1">Based on on-chain activity</p>
                </div>
              </div>
              {risk && (risk.phishingContact || risk.mixerContact) && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  {risk.phishingContact && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <span>⚠️</span> Phishing contact detected
                    </div>
                  )}
                  {risk.mixerContact && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <span>⚠️</span> Mixer interaction detected
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Identity */}
            {identity && (
              <Card className="glass p-4 sm:p-6">
                <h2 className="text-xs sm:text-sm font-medium text-white/40 mb-3 sm:mb-4">Identity</h2>
                <div className="space-y-3">
                  {identity.ens && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/50">ENS</span>
                      <span className="font-medium text-[#d4a853]">{identity.ens}</span>
                    </div>
                  )}
                  {identity.lens && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/50">Lens</span>
                      <span className="font-medium text-green-400">{identity.lens}</span>
                    </div>
                  )}
                  {identity.farcaster && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/50">Farcaster</span>
                      <span className="font-medium text-purple-400">{identity.farcaster}</span>
                    </div>
                  )}
                  {identity.twitter && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/50">Twitter</span>
                      <span className="font-medium text-cyan-400">@{identity.twitter}</span>
                    </div>
                  )}
                  
                  {/* X/Twitter Results */}
                  {identity.xResults && identity.xResults.length > 0 && (
                    <div className="pt-3">
                      <p className="text-white/50 text-sm mb-3">Potential X Matches</p>
                      <div className="space-y-2">
                        {identity.xResults.map((x, i) => (
                          <a
                            key={i}
                            href={x.tweetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{x.name}</span>
                                <span className="text-white/40 ml-2">@{x.username}</span>
                              </div>
                              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                {x.followers} followers
                              </Badge>
                            </div>
                            {x.bio && <p className="text-white/40 text-sm mt-1">{x.bio}</p>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* On-chain Activity */}
            {onchain && (
              <Card className="glass p-4 sm:p-6">
                <h2 className="text-xs sm:text-sm font-medium text-white/40 mb-3 sm:mb-4">On-chain Activity</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/40 text-sm">Balance</p>
                    <p className="font-semibold">{onchain.balanceEth.toFixed(4)} ETH</p>
                    <p className="text-white/40 text-sm">${onchain.balanceUsd.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/40 text-sm">Transactions</p>
                    <p className="font-semibold">{onchain.txCount}</p>
                    <p className="text-white/40 text-sm">Last: {onchain.lastActive}</p>
                  </div>
                </div>
                
                {onchain.tokens.length > 0 && (
                  <div className="mb-3">
                    <p className="text-white/50 text-sm mb-2">Tokens</p>
                    <div className="flex flex-wrap gap-2">
                      {onchain.tokens.map((token, i) => (
                        <Badge key={i} className="bg-white/10 text-white/70 border-white/10">{token}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {onchain.nfts.length > 0 && (
                  <div>
                    <p className="text-white/50 text-sm mb-2">NFTs</p>
                    <div className="flex flex-wrap gap-2">
                      {onchain.nfts.map((nft, i) => (
                        <Badge key={i} className="bg-purple-500/10 text-purple-400 border-purple-500/20">{nft}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Web Results */}
            {identity?.web && identity.web.length > 0 && (
              <Card className="glass p-4 sm:p-6">
                <h2 className="text-xs sm:text-sm font-medium text-white/40 mb-3 sm:mb-4">Web Presence</h2>
                <div className="space-y-3">
                  {identity.web.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-medium text-[#d4a853] truncate">{item.title}</p>
                      <p className="text-white/40 text-sm mt-1 line-clamp-2">{item.snippet}</p>
                      <p className="text-white/30 text-xs mt-2 truncate">{item.link}</p>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {scan.status === 'FAILED' && (
          <Card className="glass p-8 text-center border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✕</span>
            </div>
            <p className="text-red-400 mb-4">Scan failed. Please try again.</p>
            <Button asChild className="bg-[#d4a853] hover:bg-[#e8c878] text-[#0a1628]">
              <Link href="/search">New Scan</Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    PROCESSING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    RUNNING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    COMPLETE: 'bg-green-500/10 text-green-400 border-green-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <Badge className={`${styles[status] || 'bg-white/10'} border`}>
      {status}
    </Badge>
  );
}

function getRiskColor(score: number): string {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#eab308';
  return '#22c55e';
}

function getRiskTextColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

function getRiskLabel(score: number): string {
  if (score >= 70) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  return 'Low Risk';
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
