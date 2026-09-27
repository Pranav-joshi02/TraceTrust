'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockCertificates, Certificate, mockOrganizations, Organization } from '../../lib/data';
import { fetchCertificates, createCertificate, fetchOrganizations } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { Award, ShieldCheck, Search, Plus, CheckCircle2, AlertTriangle, XCircle, X, RefreshCw } from 'lucide-react';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>(mockCertificates);
  const [orgList, setOrgList] = useState<Organization[]>(mockOrganizations);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New certificate state
  const [certNumber, setCertNumber] = useState('');
  const [certType, setCertType] = useState('USDA Organic / India NPOP');
  const [issuerName, setIssuerName] = useState('SGS Quality Assurance Global');
  const [subject, setSubject] = useState('Organic Plantation Standards');
  const [organizationId, setOrganizationId] = useState(mockOrganizations[0].id);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [data, orgs] = await Promise.all([fetchCertificates(), fetchOrganizations()]);
      if (data && data.length > 0) setCerts(data);
      if (orgs && orgs.length > 0) {
        setOrgList(orgs);
        setOrganizationId((prev) => (orgs.some((o) => o.id === prev) ? prev : orgs[0].id));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const orgs = await fetchOrganizations();
      if (orgs && orgs.length > 0) {
        setOrgList(orgs);
        if (!orgs.some((o) => o.id === organizationId)) {
          setOrganizationId(orgs[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not refresh organizations for certificate modal:', err);
    }
  };

  const filtered = certs.filter((c) =>
    c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.organizationName.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateType.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this digital certificate on the consortium ledger?')) {
      const updated = certs.map((c) => (c.id === id ? { ...c, status: 'REVOKED' as const } : c));
      setCerts(updated);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber) return;

    const matchedOrg = orgList.find((o) => o.id === organizationId) || orgList[0] || mockOrganizations[0];

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNumber.toUpperCase(),
      certificateType: certType,
      issuerName,
      subject,
      issuedAt: new Date().toISOString().split('T')[0],
      expiresAt: '2027-09-25',
      status: 'VALID',
      organizationName: matchedOrg.name,
      verificationMethod: 'Consortium X.509 Cryptographic Verification',
      standards: 'ISO/IEC 17065'
    };

    setCerts([newCert, ...certs]);
    setIsModalOpen(false);
    setCertNumber('');

    await createCertificate({
      ...newCert,
      organizationId: matchedOrg.id,
      organizationCode: matchedOrg.organizationCode
    });
  };

  return (
    <AppShell
      title="Digital Certificates & Accreditations"
      description="Cryptographic trust anchors: ISO standards, organic certifications, and fair-trade compliance records."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Certificates and Organizations"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-mono text-muted transition hover:text-ink hover:bg-paper"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Certificate</span>
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by certificate number or issuer..."
              className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-4 font-mono text-xs outline-none focus:border-ink"
            />
          </div>
          <span className="font-mono text-xs text-muted">
            {filtered.length} of {certs.length} certificates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-paper font-mono text-[11px] text-muted">
              <tr>
                <th className="px-6 py-3">Certificate Number</th>
                <th className="px-6 py-3">Standard / Type</th>
                <th className="px-6 py-3">Auditing Authority</th>
                <th className="px-6 py-3">Organization Subject</th>
                <th className="px-6 py-3">Validity Window</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {filtered.map((cert) => (
                <tr key={cert.id} className="transition hover:bg-paper/50">
                  <td className="px-6 py-4 font-bold text-ink flex items-center gap-2">
                    <Award className="h-4 w-4 text-ink shrink-0" />
                    <span>{cert.certificateNumber}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-ink">{cert.certificateType}</td>
                  <td className="px-6 py-4 text-muted">{cert.issuerName}</td>
                  <td className="px-6 py-4 text-muted">{cert.organizationName}</td>
                  <td className="px-6 py-4 text-muted">
                    {cert.issuedAt} to {cert.expiresAt}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={cert.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cert.status === 'VALID' && (
                      <button
                        onClick={() => handleRevoke(cert.id)}
                        className="rounded px-2.5 py-1 text-[11px] font-semibold text-rejected hover:bg-rejected/10 transition"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-ink" />
                <h3 className="text-base font-bold text-ink">Issue Digital Certificate</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-muted hover:bg-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono font-medium text-ink">Certificate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CERT-ORG-2026-099"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono uppercase outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Standard / Certification Type</label>
                <input
                  type="text"
                  required
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Organization Subject *</label>
                <select
                  required
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                >
                  {orgList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.organizationType} - {o.organizationCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Auditing Authority / Issuer</label>
                <input
                  type="text"
                  required
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Subject Description</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                  Issue & Anchor Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
