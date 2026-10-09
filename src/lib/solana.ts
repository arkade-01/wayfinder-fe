// Shared types + helpers for the Solana features (OG finder, linked wallets).
// Shapes mirror wayfinder-api src/modules/solana/*.

export const isSolanaAddress = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.trim());

export const shortAddr = (a: string, n = 4) => (a.length > 2 * n + 3 ? `${a.slice(0, n)}…${a.slice(-n)}` : a);

export const solscan = {
  account: (a: string) => `https://solscan.io/account/${a}`,
  token: (a: string) => `https://solscan.io/token/${a}`,
  tx: (s: string) => `https://solscan.io/tx/${s}`,
};

export type SignalType = 'FEE_PAYER' | 'FUNDED_CHILD' | 'SHARED_FUNDER' | 'FUNDED_BY' | 'SWEEP_OUT' | 'SWEEP_IN';

export const SIGNAL_LABELS: Record<SignalType, string> = {
  FEE_PAYER: 'Paid its fees',
  FUNDED_CHILD: 'Funded by target',
  SHARED_FUNDER: 'Same first funder',
  FUNDED_BY: 'First funder',
  SWEEP_OUT: 'Receives sweeps',
  SWEEP_IN: 'Sends sweeps',
};

export interface Evidence { signal: SignalType; signatures: string[]; detail: string }
export interface Candidate { address: string; score: number; evidence: Evidence[]; tags?: string[] }

export interface WalletGraphResult {
  address: string;
  funder: { address: string; signature: string; sol: number; excluded: boolean; label?: string } | null;
  candidates: Candidate[];
  excluded: { address: string; reason: string }[];
  stats: { txsScanned: number; candidatesChecked: number };
  depth: number;
  version?: number;
  scannedAt: string;
}

export interface SolWalletScan {
  id: string;
  address: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  result?: WalletGraphResult | null;
  error?: string | null;
  createdAt: string;
}

export interface OgToken {
  mint: string;
  name: string;
  symbol: string;
  icon: string | null;
  mintCreatedAt: string | null;
  firstPoolAt: string | null;
  creationSignature: string | null;
  creator: string | null;
  liquidityUsd: number;
  marketCapUsd: number;
  holders: number | null;
  verified: boolean;
  matchType: 'exact' | 'partial';
  isOg: boolean;
}

export interface OgSearchResult { query: string; og: OgToken | null; results: OgToken[]; note?: string }

export const fmtUsd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
