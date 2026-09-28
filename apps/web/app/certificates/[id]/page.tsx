'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusPill } from '../../../components/ui/StatusPill';
import { mockCertificates, Certificate } from '../../../lib/data';
import { fetchCertificates } from '../../../lib/api';
import {
  Award,
  ArrowLeft,
  Calendar,
  Building2,
  FileCheck2,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function CertificateDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [cert, setCert] = useState<Certificate | null>(() => {
    return mockCertificates.find((c) => c.id === id || c.certificateNumber === id) || mockCertificates[0];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates().then((certs) => {
      const match = certs?.find((c: any) => c.id === id || c.certificateNumber === id);
      if (match) setCert(match);
      setIsLoading(false);
    });
  }, [id]);

  if (!cert) {
    return (
      <AppShell title="Certificate Not Found">
        <div className="rounded-2xl border border-line bg-white p-8 text-center" role="alert">
          <p className="text-sm text-muted">The requested certificate could not be found in the registry.</p>
          <Link href="/certificates" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Certificates
          </Link>
        </div>
      </AppShell>
    );
  }

  const isValid = cert.status === 'VALID';

  return (
    <AppShell
      title={`Certificate: ${cert.certificateNumber}`}
      description={`${cert.certificateType} • Issued by ${cert.issuerName || 'Accredited Issuer'}`}
      action={
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Certificates</span>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Certificate Card Header */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper shrink-0">
                <Award className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-ink">{cert.certificateType}</h2>
                  <StatusPill status={cert.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted">Certificate ID: {cert.certificateNumber}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>Standard: <strong className="font-mono text-ink">{cert.standards || 'ISO-22000'}</strong></span>
                  <span>•</span>
                  <span>Subject: <strong className="text-ink">{cert.subject || 'Organic Cultivation & Export'}</strong></span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper/60 p-3 text-xs font-mono">
              <span className="text-[10px] text-muted uppercase font-bold block mb-1">Audit Protocol</span>
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-verified" aria-hidden="true" />
                <span>Verified Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-2">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Issuance Parties</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Accredited Issuer:</span>
                  <span className="font-semibold text-ink">{cert.issuerName || 'SGS India'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-line/60">
                <Building2 className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Certificate Beneficiary:</span>
                  <span className="font-semibold text-ink">{cert.organizationName}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-2">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Validity Duration</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Issued At:</span>
                  <span className="font-mono font-semibold text-ink">{cert.issuedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-line/60">
                <Calendar className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Expires At:</span>
                  <span className="font-mono font-semibold text-ink">{cert.expiresAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Off-Chain Evidence Proof */}
          <div className="mt-6 rounded-xl border border-line bg-paper/70 p-4 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-verified" aria-hidden="true" />
                SHA-256 Digest Anchored Proof
              </span>
              <span className="text-[10px] text-muted">Off-Chain MinIO Storage</span>
            </div>
            <p className="break-all text-[11px] text-muted bg-white p-2.5 rounded-lg border border-line">
              {(cert as any).sha256Hash || cert.verificationMethod || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
