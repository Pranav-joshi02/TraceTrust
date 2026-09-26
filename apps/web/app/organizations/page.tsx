'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockOrganizations, Organization } from '../../lib/data';
import { fetchOrganizations, createOrganization } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { Building2, Search, Plus, ShieldCheck, Globe, CheckCircle2, X } from 'lucide-react';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>(mockOrganizations);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [orgType, setOrgType] = useState<Organization['organizationType']>('SUPPLIER');
  const [country, setCountry] = useState('India');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchOrganizations().then((data) => setOrgs(data));
  }, []);

  const filtered = orgs.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.organizationCode.toLowerCase().includes(search.toLowerCase()) ||
      o.country.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || o.organizationType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      legalName: `${name} Private Ltd`,
      organizationCode: code.toUpperCase(),
      organizationType: orgType,
      registrationNumber: `REG-${Date.now().toString().slice(-6)}`,
      country,
      address: `${cityFromCountry(country)}, Trade District`,
      email: email || `contact@${code.toLowerCase()}.example`,
      phone: '+91-80-49201100',
      status: 'VERIFIED',
      fabricMspId: `${code.toUpperCase()}MSP`
    };

    setOrgs([newOrg, ...orgs]);
    setIsModalOpen(false);
    setName('');
    setCode('');
    setEmail('');

    await createOrganization(newOrg);
  };

  function cityFromCountry(c: string) {
    if (c === 'India') return 'Bengaluru, Karnataka';
    if (c === 'USA') return 'Seattle, WA';
    if (c === 'Germany') return 'Hamburg';
    return 'London';
  }

  return (
    <AppShell
      title="Consortium Organizations"
      description="Cryptographically credentialed supply chain participants with enrolled Hyperledger Fabric MSP identities."
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
        >
          <Plus className="h-4 w-4" />
          <span>Register Organization</span>
        </button>
      }
    >
      {/* Search and Role Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organization name or code..."
            className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-4 font-mono text-xs outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-muted mr-1">Role:</span>
          {['ALL', 'SUPPLIER', 'MANUFACTURER', 'LOGISTICS', 'WAREHOUSE', 'RETAILER', 'AUDITOR'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                typeFilter === t
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Organizations */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((org) => (
          <div key={org.id} className="rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] font-bold border border-line text-muted">
                  {org.organizationType}
                </span>
                <StatusPill status={org.status} />
              </div>

              <h3 className="mt-4 text-base font-bold text-ink">{org.name}</h3>
              <p className="font-mono text-xs text-muted">{org.organizationCode}</p>
              <p className="mt-2 text-xs text-muted line-clamp-2">{org.address}</p>

              <div className="mt-4 space-y-1.5 rounded-xl border border-line bg-paper/50 p-3 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted">Country:</span>
                  <span className="text-ink">{org.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Fabric MSP:</span>
                  <span className="text-ink font-semibold">{org.fabricMspId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Registry Reg:</span>
                  <span className="text-ink truncate max-w-[130px]">{org.registrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="font-mono text-[10px] text-muted">{org.email}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-verified">
                <CheckCircle2 className="h-3 w-3" /> X.509 Valid
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Organization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-ink" />
                <h3 className="text-base font-bold text-ink">Register Organization</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-muted hover:bg-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono font-medium text-ink">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Roasting Facility"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Organization Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANUF-002"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono uppercase outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Role / Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                >
                  <option value="SUPPLIER">SUPPLIER</option>
                  <option value="MANUFACTURER">MANUFACTURER</option>
                  <option value="LOGISTICS">LOGISTICS</option>
                  <option value="WAREHOUSE">WAREHOUSE</option>
                  <option value="RETAILER">RETAILER</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@organization.example"
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-line px-4 py-2 font-mono font-medium text-muted hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2 font-mono font-medium text-paper hover:bg-ink/90"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
