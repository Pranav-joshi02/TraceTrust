'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/auth-store';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push(redirect);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4" role="main" aria-label="Login page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Go to homepage">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-mono text-xl font-bold tracking-tight text-ink">TrustTrace</span>
          </Link>
          <p className="mt-3 text-sm text-muted">Sign in to access the operations console.</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white p-8 shadow-sm"
          aria-label="Login form"
        >
          <h1 className="text-xl font-bold text-ink">Sign In</h1>
          <p className="mt-1 text-xs text-muted">Enter your credentials to continue.</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-rejected/30 bg-rejected/5 px-3 py-2 text-xs text-rejected" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="admin@trusttrace.local"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  minLength={8}
                  className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>

          <div className="mt-6 text-center text-xs text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-ink hover:underline">
              Create Account
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted">
          Protected by TrustTrace Consortium Authentication.
        </p>
      </div>
    </main>
  );
}
