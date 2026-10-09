'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SiteNav, PageBackground } from '@/components/SiteNav';
import { SolanaScanView } from '@/components/SolanaScanView';

export default function SolanaScanPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="min-h-screen text-white" style={{ background: 'var(--navy)' }}>
      <PageBackground />
      <SiteNav />
      <div className="relative z-10 px-4 py-4 sm:py-8 max-w-3xl mx-auto">
        <Link href="/search" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs sm:text-sm mb-4 sm:mb-6 transition-colors"
          style={{ fontFamily: 'var(--font-jetbrains)' }}>
          ← Back to search
        </Link>
        <SolanaScanView scanId={id} />
      </div>
    </main>
  );
}
