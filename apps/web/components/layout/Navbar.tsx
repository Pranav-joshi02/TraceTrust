'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, GitBranch, Terminal, Layers, BookOpen, FileText, ArrowRight } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-mono text-base font-bold tracking-tight">TrustTrace</span>
          <span className="rounded-full border border-line bg-white px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
            v1.0 • Fabric & Supabase
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link
            href="/trace"
            className={`flex items-center gap-1.5 transition hover:text-ink ${pathname === '/trace' ? 'font-medium text-ink' : ''}`}
          >
            <GitBranch className="h-3.5 w-3.5" /> Trace Explorer
          </Link>
          <Link
            href="/architecture"
            className={`flex items-center gap-1.5 transition hover:text-ink ${pathname === '/architecture' ? 'font-medium text-ink' : ''}`}
          >
            <Layers className="h-3.5 w-3.5" /> Architecture
          </Link>
          <Link
            href="/research"
            className={`flex items-center gap-1.5 transition hover:text-ink ${pathname === '/research' ? 'font-medium text-ink' : ''}`}
          >
            <FileText className="h-3.5 w-3.5" /> Research
          </Link>
          <Link
            href="/docs"
            className={`flex items-center gap-1.5 transition hover:text-ink ${pathname === '/docs' ? 'font-medium text-ink' : ''}`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-1 font-mono text-xs text-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-verified animate-pulse"></span>
            <span>Ledger: Active</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
          >
            <span>Operations Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
