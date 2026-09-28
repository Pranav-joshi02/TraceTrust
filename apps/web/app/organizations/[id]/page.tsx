'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusPill } from '../../../components/ui/StatusPill';
import { mockOrganizations, Organization, mockProducts, mockCertificates } from '../../../lib/data';
import { fetchOrganizationById, fetchOrganizations, fetchProducts, fetchCertificates } from '../../../lib/api';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ShieldCheck,
  Package,
  Award,
  ExternalLink,
  Calendar,
  Lock,
} from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [org, setOrg] = useState<Organization | null>(() => {
    return mockOrganizations.find((o) => o.id === id || o.organizationCode === id) || mockOrganizations[0];
  });
  const [products, setProducts] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [orgData, prods, certs] = await Promise.all([
          fetchOrganizationById(id).catch(() => null),
          fetchProducts().catch(() => []),
          fetchCertificates().catch(() => []),
        ]);

        if (orgData) {
          setOrg(orgData);
        } else {
          const match = mockOrganizations.find((o) => o.id === id || o.organizationCode === id);
          if (match) setOrg(match);
        }

        const orgCode = orgData?.organizationCode || org?.organizationCode || id;
        setProducts(prods.filter((p: any) => p.organizationCode === orgCode || p.organizationId === id));
        setCertificates(certs.filter((c: any) => c.organizationCode === orgCode || c.issuer === org?.name));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (!org) {
    return (
      <AppShell title="Organization Not Found">
        <div className="rounded-2xl border border-line bg-white p-8 text-center" role="alert">
          <p className="text-sm text-muted">The requested organization could not be found in the consortium directory.</p>
          <Link href="/organizations" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Organizations
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={org.name}
      description={`Consortium Member • Type: ${org.organizationType} • Code: ${org.organizationCode}`}
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
            aria-label="Back to organization list"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Organizations</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Organization Summary Card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper shrink-0">
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-ink">{org.name}</h2>
                  <StatusPill status={org.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted">{org.legalName || org.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="font-mono bg-paper px-2 py-0.5 rounded border border-line text-[11px] font-semibold text-ink">
                    {org.organizationCode}
                  </span>
                  <span>•</span>
                  <span>Reg: <strong className="font-mono text-ink">{org.registrationNumber || 'REG-2026-IND'}</strong></span>
                  <span>•</span>
                  <span>Country: <strong className="text-ink">{org.country || 'India'}</strong></span>
                </div>
              </div>
            </div>

            {/* Hyperledger Fabric Identity Badge */}
            <div className="rounded-xl border border-line bg-paper/60 p-3 text-xs font-mono">
              <span className="text-[10px] text-muted uppercase font-bold block mb-1">Fabric MSP Identity</span>
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <Lock className="h-3 w-3 text-verified" aria-hidden="true" />
                <span>{org.fabricMspId || `${org.organizationCode}MSP`}</span>
              </div>
              <span className="text-[10px] text-muted block mt-0.5">Org: {(org as any).fabricOrgName || org.organizationCode}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-paper/30 p-3">
              <Mail className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
              <div className="truncate">
                <span className="text-[10px] text-muted uppercase font-semibold block">Email Contact</span>
                <span className="font-mono text-ink truncate block">{org.email || 'contact@organization.example'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-paper/30 p-3">
              <Phone className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[10px] text-muted uppercase font-semibold block">Telephone</span>
                <span className="font-mono text-ink block">{org.phone || '+91 22 2456 7890'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-paper/30 p-3">
              <MapPin className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
              <div className="truncate">
                <span className="text-[10px] text-muted uppercase font-semibold block">Headquarters</span>
                <span className="text-ink truncate block">{org.address || 'Karnataka, India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout: Active Certificates & Cataloged Products */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Certificates Card */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-ink" aria-hidden="true" />
                <h3 className="font-bold text-ink">Active Certificates ({certificates.length})</h3>
              </div>
              <Link href="/certificates" className="text-xs font-semibold text-ink hover:underline">
                View All
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted italic">
                No active certifications found for this organization.
              </div>
            ) : (
              <div className="mt-4 space-y-3" role="list" aria-label="Organization certificates">
                {certificates.map((c: any) => (
                  <div key={c.id || c.certificateNumber} role="listitem" className="rounded-xl border border-line bg-paper/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{c.certificateType || c.standard}</span>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted">ID: {c.certificateNumber || c.id}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                      <span>Issuer: {c.issuer || 'SGS India'}</span>
                      <span className="font-mono">Valid thru: {c.validTo || '2027-12-31'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cataloged Products Card */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-ink" aria-hidden="true" />
                <h3 className="font-bold text-ink">Registered Products ({products.length})</h3>
              </div>
              <Link href="/products/new" className="text-xs font-semibold text-ink hover:underline">
                + New Product
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted italic">
                No registered products cataloged for this organization.
              </div>
            ) : (
              <div className="mt-4 space-y-3" role="list" aria-label="Organization products">
                {products.map((p: any) => (
                  <div key={p.id || p.productCode} role="listitem" className="rounded-xl border border-line bg-paper/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{p.name}</span>
                      <span className="font-mono text-[10px] text-muted">{p.category}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>Code: {p.productCode}</span>
                      <span>SKU: {p.sku || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
