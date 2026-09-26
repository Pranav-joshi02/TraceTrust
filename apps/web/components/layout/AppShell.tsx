'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Activity,
  GitBranch,
  ShieldCheck,
  FileCheck2,
  Award,
  AlertTriangle,
  History,
  Scale,
  Building2,
  Settings,
  ShieldAlert,
  Search,
  ChevronRight,
  Database,
  ExternalLink
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/batches', label: 'Batches', icon: Layers },
  { href: '/events', label: 'Trace Events', icon: Activity },
  { href: '/trace', label: 'Provenance Explorer', icon: GitBranch },
  { href: '/verification', label: 'Trust Verification', icon: ShieldCheck },
  { href: '/evidence', label: 'Evidence Store', icon: FileCheck2 },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/recalls', label: 'Recall Center', icon: AlertTriangle },
  { href: '/audits', label: 'Technical Audits', icon: History },
  { href: '/disputes', label: 'Disputes', icon: Scale },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/admin', label: 'Admin Console', icon: ShieldAlert }
];

export function AppShell({ children, title, description, action }: AppShellProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-white md:flex md:flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-mono text-base font-bold tracking-tight">TrustTrace</span>
          </Link>
          <Link
            href="/"
            title="View public landing"
            className="rounded p-1 text-muted transition hover:bg-paper hover:text-ink"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Database & Ledger Connection Pill */}
        <div className="p-3">
          <div className="rounded-xl border border-line bg-paper/70 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted">
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-verified" />
                <span>Supabase DB</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-verified">
                <span className="h-1.5 w-1.5 rounded-full bg-verified"></span>
                Connected
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-verified" />
                <span>Fabric Ledger</span>
              </span>
              <span className="font-mono text-[10px]">Synced</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-ink text-paper font-semibold shadow-sm'
                    : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-paper' : 'text-muted'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-paper/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-paper/50 p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
              PJ
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-xs font-medium">Pranav Joshi</p>
              <p className="truncate font-mono text-[10px] text-muted">Highland Organics (Admin)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-6 backdrop-blur-md">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, batches, events (e.g. BATCH-2026-001)..."
                className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-4 font-mono text-xs outline-none transition focus:border-ink"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/verify/BATCH-2026-001"
              className="hidden rounded-full border border-line px-3 py-1 text-muted transition hover:bg-paper hover:text-ink sm:block"
            >
              Public QR View
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 font-mono text-[11px] text-muted">
              <span>Tenant:</span>
              <strong className="text-ink">SUPPLIER-001</strong>
            </div>
          </div>
        </header>

        {/* Page Header */}
        {(title || action) && (
          <div className="border-b border-line bg-white px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>}
                {description && <p className="mt-1 text-xs text-muted">{description}</p>}
              </div>
              {action && <div>{action}</div>}
            </div>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
