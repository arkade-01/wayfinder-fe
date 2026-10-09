'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Candidate, SIGNAL_LABELS, SolWalletScan, shortAddr, solscan } from '@/lib/solana';

const mono = { fontFamily: 'var(--font-jetbrains)' } as const;
const syne = { fontFamily: 'var(--font-syne)' } as const;

const PENDING = new Set(['PENDING', 'RUNNING']);

/** Polls a Solana linked-wallet scan and renders its status + results. */
export function SolanaScanView({
  scanId,
  showPermalink,
  onNewScan,
}: {
  scanId: string;
  showPermalink?: boolean;
  /** Called with the new scan id after a forced rescan. Defaults to navigating to /sol/<id>. */
  onNewScan?: (id: string) => void;
}) {
  const [scan, setScan] = useState<SolWalletScan | null>(null);
  const [error, setError] = useState('');
  const [rescanning, setRescanning] = useState(false);

  const rescan = async () => {
    if (!scan) return;
    setRescanning(true);
    try {
      const res = await fetch(`/api/solana/wallets/${scan.address}/scan?force=true`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Rescan failed');
      if (onNewScan) onNewScan(data.scanId);
      else window.location.href = `/sol/${data.scanId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rescan failed');
    } finally {
      setRescanning(false);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const cacheKey = `wayfinder_sol_scan_${scanId}`;
    setScan(null);
    setError('');

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as SolWalletScan;
        if (parsed.status === 'COMPLETE') {
          setScan(parsed);
          return;
        }
      }
    } catch {}

    const poll = async () => {
      try {
        const res = await fetch(`/api/solana/wallets/scans/${scanId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Scan not found');
        const data: SolWalletScan = await res.json();
        if (cancelled) return;
        setScan(data);
        if (data.status === 'COMPLETE') {
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
        }
        if (PENDING.has(data.status)) timer = setTimeout(poll, 2500);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load scan');
      }
    };
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [scanId]);

  if (error) return <div className="glass rounded-2xl p-8 text-center text-red-400" style={mono}>{error}</div>;
  if (!scan) return <Spinner label="Loading…" />;

  return (
    <>
      <div className="glass rounded-2xl p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h2 className="text-lg sm:text-xl" style={{ ...syne, fontWeight: 700 }}>Linked Wallets</h2>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded" style={{ ...mono, background: 'rgba(153,69,255,0.15)', color: '#b98aff' }}>Solana</span>
          <StatusPill status={scan.status} />
          <div className="ml-auto flex items-center gap-3">
            {(scan.status === 'COMPLETE' || scan.status === 'FAILED') && (
              <button
                type="button"
                onClick={rescan}
                disabled={rescanning}
                className="text-[11px] px-2 py-1 rounded-md border transition-colors hover:bg-white/5 disabled:opacity-50"
                style={{ ...mono, borderColor: 'rgba(201,147,62,0.35)', color: 'var(--gold)' }}
              >
                {rescanning ? 'Starting…' : '↻ Rescan'}
              </button>
            )}
            {showPermalink && (
              <Link href={`/sol/${scanId}`} target="_blank" className="text-[11px] text-white/40 hover:text-white transition-colors" style={mono}>
                Share link ↗
              </Link>
            )}
          </div>
        </div>
        <a href={solscan.account(scan.address)} target="_blank" rel="noopener noreferrer"
          className="text-white/40 hover:text-white text-xs sm:text-sm break-all transition-colors" style={mono}>
          {scan.address}
        </a>
      </div>

      {PENDING.has(scan.status) && (
        <div className="glass rounded-2xl p-8">
          <Spinner label="Walking the funding graph — usually under a minute" />
        </div>
      )}

      {scan.status === 'FAILED' && (
        <div className="glass rounded-2xl p-6 text-center text-sm" style={{ ...mono, color: '#f87171' }}>
          Scan failed{scan.error ? `: ${scan.error}` : ''}
        </div>
      )}

      {scan.status === 'COMPLETE' && scan.result && <Results scan={scan} />}
    </>
  );
}

function Results({ scan }: { scan: SolWalletScan }) {
  const r = scan.result!;
  const [showExcluded, setShowExcluded] = useState(false);

  return (
    <div className="space-y-5">
      {/* Funder */}
      <div className="glass rounded-2xl p-5">
        <p className="section-label mb-2">First funded by</p>
        {r.funder ? (
          <div className="flex items-center justify-between gap-3 flex-wrap text-sm" style={mono}>
            <a href={solscan.account(r.funder.address)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color: 'var(--gold)' }}>
              {r.funder.label ?? r.funder.address}
            </a>
            <span className="text-white/50 text-xs">
              {r.funder.sol.toFixed(3)} SOL ·{' '}
              <a href={solscan.tx(r.funder.signature)} target="_blank" rel="noopener noreferrer" className="hover:text-white">tx ↗</a>
            </span>
            {r.funder.excluded && (
              <p className="w-full text-[11px] text-white/40">
                Excluded from linking — looks like an exchange, program or high-traffic hub, so sharing it proves nothing.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/40" style={mono}>No SOL funding found in early history.</p>
        )}
      </div>

      {/* Candidates */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="section-label">Likely linked wallets ({r.candidates.length})</p>
          <span className="text-[10px] text-white/30" style={mono}>{r.stats.txsScanned} txs scanned</span>
        </div>
        {r.candidates.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-white/50" style={mono}>
            No linked wallets found. Wallets funded via an exchange withdrawal or bridge often look unlinked.
          </div>
        ) : (
          <div className="space-y-2">
            {r.candidates.map((c) => <CandidateRow key={c.address} c={c} />)}
          </div>
        )}
      </div>

      {/* Excluded */}
      {r.excluded.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <button onClick={() => setShowExcluded((v) => !v)} className="w-full flex justify-between text-xs text-white/50 hover:text-white transition-colors" style={mono}>
            <span>Filtered out ({r.excluded.length})</span>
            <span>{showExcluded ? '−' : '+'}</span>
          </button>
          {showExcluded && (
            <div className="mt-3 space-y-1.5">
              {r.excluded.map((e) => (
                <div key={e.address} className="flex justify-between gap-3 text-[11px]" style={mono}>
                  <a href={solscan.account(e.address)} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">{shortAddr(e.address, 6)}</a>
                  <span className="text-white/35 text-right">{e.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-white/30 leading-relaxed" style={mono}>
        Scores combine on-chain signals and are probabilistic — a link is a lead, not proof of common ownership.
      </p>
    </div>
  );
}

function CandidateRow({ c }: { c: Candidate }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(c.score * 100);
  const tone = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'rgba(255,255,255,0.5)';

  return (
    <div className="rounded-xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
        className="w-full text-left p-3 sm:p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm truncate" style={mono}>{c.address}</span>
            <CopyButton text={c.address} />
          </div>
          <span className="text-sm font-semibold flex-shrink-0" style={{ ...mono, color: tone }}>{pct}%</span>
        </div>
        <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {c.tags?.map((t) => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded" style={{ ...mono, background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)' }}>
              {t}
            </span>
          ))}
          {c.evidence.map((e) => (
            <span key={e.signal} className="px-1.5 py-0.5 text-[10px] rounded" style={{ ...mono, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
              {SIGNAL_LABELS[e.signal] ?? e.signal}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <div className="px-3 sm:px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {c.evidence.map((e) => (
            <div key={e.signal} className="pt-3 text-[11px]" style={mono}>
              <div className="text-white/80">{e.detail}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {e.signatures.map((s) => (
                  <a key={s} href={solscan.tx(s)} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white">
                    {shortAddr(s, 6)} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-1 text-[11px]" style={mono}>
            <a href={solscan.account(c.address)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>Solscan ↗</a>
            <Link href={`/search?address=${c.address}`} style={{ color: 'var(--gold)' }}>Scan this wallet →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={copied ? 'Copied' : 'Copy address'}
      aria-label="Copy address"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="flex-shrink-0 p-1 rounded-md transition-colors hover:bg-white/10"
      style={{ color: copied ? 'var(--green)' : 'rgba(255,255,255,0.45)' }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      )}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = {
    COMPLETE: ['rgba(52,211,153,0.15)', '#34d399'],
    FAILED: ['rgba(239,68,68,0.15)', '#f87171'],
    RUNNING: ['rgba(34,211,238,0.15)', '#22d3ee'],
    PENDING: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.5)'],
  }[status] ?? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.5)'];
  return <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded" style={{ ...mono, background: s[0], color: s[1] }}>{status}</span>;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
      <span className="text-sm text-white/60" style={mono}>{label}</span>
    </div>
  );
}
