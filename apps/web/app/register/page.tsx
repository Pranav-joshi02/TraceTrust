'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('SUPPLIER-001');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({ email, password, firstName, lastName, organizationCode: orgCode });
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4" role="main" aria-label="Registration page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Go to homepage">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-mono text-xl font-bold tracking-tight text-ink">TrustTrace</span>
          </Link>
          <p className="mt-3 text-sm text-muted">Create an account to join the consortium.</p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white p-8 shadow-sm"
          aria-label="Registration form"
        >
          <h1 className="text-xl font-bold text-ink">Create Account</h1>
          <p className="mt-1 text-xs text-muted">Register to access supply chain operations.</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-rejected/30 bg-rejected/5 px-3 py-2 text-xs text-rejected" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-ink mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Pranav"
                    required
                    className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                    aria-required="true"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-ink mb-1.5">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Joshi"
                  required
                  className="w-full rounded-xl border border-line bg-paper py-2.5 px-3 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-ink mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@organization.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                  aria-describedby="password-hint"
                />
              </div>
              <p id="password-hint" className="mt-1 text-[11px] text-muted">Must be at least 8 characters.</p>
            </div>

            <div>
              <label htmlFor="orgCode" className="block text-xs font-medium text-ink mb-1.5">Organization Code</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <select
                  id="orgCode"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
                  aria-label="Select your organization"
                >
                  <option value="SUPPLIER-001">Highland Organics Estate (Supplier)</option>
                  <option value="MANUFACTURER-001">Coorg Coffee Roasters (Manufacturer)</option>
                  <option value="LOGISTICS-001">TransGlobal ColdChain (Logistics)</option>
                  <option value="RETAILER-001">NatureFresh Markets (Retailer)</option>
                  <option value="AUDITOR-001">SGS Quality Assurance (Auditor)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !firstName || !lastName}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>

          <div className="mt-6 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-ink hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
