'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, GitBranch, Terminal, Layers, BookOpen, FileText, ArrowRight, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../lib/auth-store';
import { fetchNetworkStatus } from '../../lib/api';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loadSession } = useAuthStore();
  const [networkMode, setNetworkMode] = useState<'LIVE' | 'SIMULATED'>('SIMULATED');

  useEffect(() => {
    loadSession();
    fetchNetworkStatus().then((s) => {
      if (s?.mode) setNetworkMode(s.mode);
    });
  }, [loadSession]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md" role="banner">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight" aria-label="TrustTrace Home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-mono text-base font-bold tracking-tight">TrustTrace</span>
          <span className="rounded-full border border-line bg-white px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
            v1.0 • Fabric & Supabase
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex" aria-label="Main Navigation">
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
          {/* Honest Blockchain Mode Indicator */}
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs sm:flex ${
              networkMode === 'LIVE'
                ? 'border-verified/30 bg-verified/5 text-verified'
                : 'border-pending/40 bg-pending/5 text-pending'
            }`}
            title={
              networkMode === 'LIVE'
                ? 'Hyperledger Fabric network is active and connected'
                : 'DEMO / SIMULATED: Hyperledger Fabric network is not connected; transactions are locally simulated.'
            }
            role="status"
            aria-label={`Blockchain Ledger Status: ${networkMode === 'LIVE' ? 'Active Fabric' : 'Simulated Demo'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                networkMode === 'LIVE' ? 'bg-verified animate-pulse' : 'bg-pending'
              }`}
            />
            <span>{networkMode === 'LIVE' ? 'Ledger: Active' : 'Ledger: Simulated'}</span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
              >
                <span>Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-full border border-line bg-white p-2 text-muted transition hover:bg-paper hover:text-ink"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/80"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
