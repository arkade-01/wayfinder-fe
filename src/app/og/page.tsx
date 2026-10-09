'use client';

import { useState } from 'react';
import { SiteNav, PageBackground } from '@/components/SiteNav';
import { OgSearchResult, OgToken, fmtDate, fmtUsd, shortAddr, solscan } from '@/lib/solana';

const mono = { fontFamily: 'var(--font-jetbrains)' } as const;
const syne = { fontFamily: 'var(--font-syne)' } as const;

export default function OgFinderPage() {
  const [q, setQ] = useState('');
  const [minLiquidity, setMinLiquidity] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OgSearchResult | null>(null);

  const search = async (query: string) => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const params = new URLSearchParams({ q: query.trim(), minLiquidity: String(minLiquidity) });
      const res = await fetch(`/api/solana/og/search?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || body.error || 'Search failed');
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const copycats = data?.results.filter((r) => !r.isOg) ?? [];

  return (
    <main className="min-h-screen text-white" style={{ background: 'var(--navy)' }}>
      <PageBackground />
      <SiteNav />

      <div className="relative z-10 px-4 pt-4 sm:pt-8 pb-16 max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-5 sm:p-8 shadow-md mb-6">
          <p className="section-label mb-2">Solana</p>
          <h1 className="text-xl sm:text-2xl mb-1.5" style={{ ...syne, fontWeight: 700 }}>OG Token Finder</h1>
          <p className="text-sm mb-5" style={{ ...mono, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            Find the original mint behind a ticker — ranked by when the mint was created on-chain, not when its pool launched.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); search(q); }} className="flex flex-col sm:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="bonk, $WIF, popcat…"
              className="scan-input flex-1 px-4 py-3 text-sm"
              maxLength={40}
            />
            <button type="submit" disabled={loading || q.trim().length < 2} className="btn-gold px-6 py-3 rounded-xl text-sm">
              {loading ? 'Searching…' : 'Find OG'}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]" style={{ ...mono, color: 'rgba(255,255,255,0.4)' }}>
            <span>Min liquidity:</span>
            {[0, 1000, 10000, 100000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMinLiquidity(v)}
                className="px-2 py-0.5 rounded-md border transition-all"
                style={{
                  borderColor: minLiquidity === v ? 'rgba(201,147,62,0.5)' : 'rgba(255,255,255,0.1)',
                  color: minLiquidity === v ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {v === 0 ? 'Any' : fmtUsd(v)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg border text-sm text-center"
              style={{ ...mono, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-10">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
            <span className="text-sm text-white/60" style={mono}>Checking mint creation dates…</span>
          </div>
        )}

        {data && !loading && (
          <>
            {data.og ? (
              <div className="mb-6">
                <p className="section-label mb-2">The original</p>
                <TokenCard token={data.og} highlight />
              </div>
            ) : (
              <p className="text-center text-sm text-white/50 py-8" style={mono}>{data.note ?? 'No original found.'}</p>
            )}

            {copycats.length > 0 && (
              <div>
                <p className="section-label mb-2">Later mints using this name ({copycats.length})</p>
                <div className="space-y-2">
                  {copycats.map((t) => <TokenCard key={t.mint} token={t} />)}
                </div>
              </div>
            )}

            <p className="text-[11px] text-white/30 mt-6 leading-relaxed" style={mono}>
              “Oldest” means oldest on-chain mint among tokens that match and pass the liquidity filter. A squatter can mint a name first — check liquidity, holders and verification before trusting it.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function TokenCard({ token: t, highlight }: { token: OgToken; highlight?: boolean }) {
  const poolLag =
    t.mintCreatedAt && t.firstPoolAt
      ? Math.round((Date.parse(t.firstPoolAt) - Date.parse(t.mintCreatedAt)) / 86_400_000)
      : null;

  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? 'shadow-gold' : ''}`}
      style={{
        background: highlight ? 'rgba(201,147,62,0.06)' : 'rgba(255,255,255,0.03)',
        borderColor: highlight ? 'rgba(201,147,62,0.35)' : 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-start gap-3">
        {t.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.icon} alt="" className="w-10 h-10 rounded-full flex-shrink-0 bg-white/5" />
        ) : (
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-white/5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold" style={{ fontFamily: 'var(--font-syne)' }}>{t.name || t.symbol}</span>
            <span className="text-xs text-white/50" style={mono}>${t.symbol}</span>
            {t.isOg && <Pill color="gold">OG</Pill>}
            {t.verified && <Pill color="green">Verified</Pill>}
            {t.matchType === 'partial' && <Pill color="muted">Partial match</Pill>}
          </div>
          <a href={solscan.token(t.mint)} target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-white/40 hover:text-white break-all transition-colors" style={mono}>
            {t.mint}
          </a>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-[11px]" style={mono}>
            <Stat label="Mint created" value={fmtDate(t.mintCreatedAt)} />
            <Stat label="First pool" value={fmtDate(t.firstPoolAt)} hint={poolLag && poolLag > 1 ? `+${poolLag}d after mint` : undefined} />
            <Stat label="Liquidity" value={fmtUsd(t.liquidityUsd)} />
            <Stat label="Market cap" value={fmtUsd(t.marketCapUsd)} />
            <Stat label="Holders" value={t.holders != null ? t.holders.toLocaleString() : '—'} />
            <Stat
              label="Creator"
              value={t.creator ? shortAddr(t.creator) : '—'}
              href={t.creator ? `/search?address=${t.creator}` : undefined}
            />
            {t.creationSignature && (
              <Stat label="Creation tx" value={shortAddr(t.creationSignature, 6)} href={solscan.tx(t.creationSignature)} external />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, href, external }: { label: string; value: string; hint?: string; href?: string; external?: boolean }) {
  return (
    <div>
      <div className="text-white/30 uppercase tracking-wider text-[9px]">{label}</div>
      {href ? (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
          className="hover:underline" style={{ color: 'var(--gold)' }}>{value}</a>
      ) : (
        <div className="text-white/80">{value}</div>
      )}
      {hint && <div className="text-white/30 text-[10px]">{hint}</div>}
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: 'gold' | 'green' | 'muted' }) {
  const c = {
    gold: { bg: 'rgba(201,147,62,0.15)', fg: 'var(--gold)' },
    green: { bg: 'rgba(52,211,153,0.12)', fg: 'var(--green)' },
    muted: { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.5)' },
  }[color];
  return (
    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded" style={{ ...mono, background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}
