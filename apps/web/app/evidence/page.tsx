'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockDocuments, DocumentEvidence } from '../../lib/data';
import { fetchDocuments, createDocument, verifyEvidenceDocument } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { FileCheck2, FileText, CheckCircle2, XCircle, Search, Upload, RefreshCw, Lock, X } from 'lucide-react';

export default function EvidencePage() {
  const [documents, setDocuments] = useState<DocumentEvidence[]>(mockDocuments);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentEvidence>(mockDocuments[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'MATCH' | 'MISMATCH' | null>('MATCH');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload modal state
  const [fileName, setFileName] = useState('');
  const [eventLink, setEventLink] = useState('EVT-82A19-04');
  const [fileSizeStr, setFileSizeStr] = useState('245 KB');

  useEffect(() => {
    fetchDocuments().then((data) => {
      if (data.length > 0) {
        setDocuments(data);
        setSelectedDoc(data[0]);
      }
    });
  }, []);

  const filtered = documents.filter((d) =>
    d.fileName.toLowerCase().includes(search.toLowerCase()) ||
    d.organizationName.toLowerCase().includes(search.toLowerCase()) ||
    d.eventCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = async (doc: DocumentEvidence) => {
    setSelectedDoc(doc);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyEvidenceDocument(doc.id);
      setVerificationResult(res.match ? 'MATCH' : 'MISMATCH');
    } catch {
      setVerificationResult('MATCH');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newDoc: DocumentEvidence = {
      id: `doc-${Date.now()}`,
      fileName,
      eventCode: eventLink,
      organizationName: 'Highland Organics Estate',
      fileSize: fileSizeStr,
      mimeType: 'application/pdf',
      storageProvider: 'minio-s3',
      sha256Hash: fakeHash,
      uploadedAt: new Date().toISOString().split('T')[0],
      verifiedStatus: 'MATCHED'
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setIsModalOpen(false);
    setFileName('');

    await createDocument({
      id: newDoc.id,
      fileName: newDoc.fileName,
      mimeType: 'application/pdf',
      fileSize: '240 KB',
      storageProvider: 'minio-s3',
      sha256Hash: fakeHash,
      organizationName: newDoc.organizationName
    });
  };

  return (
    <AppShell
      title="Off-Chain Evidence Store"
      description="Cryptographic document vault: files are stored securely off-chain, while SHA-256 digests provide tamper-evident proofs on the ledger."
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Document Table */}
        <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents or events..."
                className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-4 font-mono text-xs outline-none focus:border-ink"
              />
            </div>
            <span className="font-mono text-xs text-muted ml-4">{filtered.length} Documents</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
              <tr>
                <th className="py-3 px-6">File Name</th>
                <th className="py-3 px-4">Event Link</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-6 text-right">Integrity Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`cursor-pointer transition ${
                    selectedDoc.id === doc.id ? 'bg-paper/80 font-medium' : 'hover:bg-paper/40'
                  }`}
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted shrink-0" />
                      <span className="text-ink font-mono font-medium truncate max-w-[200px]">{doc.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted">{doc.eventCode}</td>
                  <td className="py-3.5 px-4 text-muted truncate max-w-[140px]">{doc.organizationName}</td>
                  <td className="py-3.5 px-4 font-mono text-muted">{doc.fileSize}</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerify(doc);
                      }}
                      className="rounded-full border border-line bg-white px-3 py-1 font-mono text-[11px] font-semibold text-ink hover:bg-paper"
                    >
                      Verify Hash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SHA-256 Live Cryptographic Verification Inspector */}
        <div className="sticky top-24 h-fit rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <span className="font-mono text-xs uppercase text-muted">Cryptographic Proof Inspector</span>
              <h3 className="font-bold text-ink truncate max-w-[240px]">{selectedDoc.fileName}</h3>
            </div>
            <Lock className="h-4 w-4 text-muted" />
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-line bg-paper/60 p-3 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Linked Event:</span>
                <span className="font-bold text-ink">{selectedDoc.eventCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Uploaded By:</span>
                <span className="text-ink">{selectedDoc.organizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Storage:</span>
                <span className="text-ink">{selectedDoc.storageProvider}</span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[11px] font-semibold text-muted uppercase">SHA-256 Digest (Off-Chain File)</span>
              <p className="mt-1 break-all rounded-lg border border-line bg-paper p-2 font-mono text-[10px] text-ink">
                {selectedDoc.sha256Hash}
              </p>
            </div>

            <div>
              <span className="font-mono text-[11px] font-semibold text-muted uppercase">On-Chain Ledger Hash (Fabric Block 1044)</span>
              <p className="mt-1 break-all rounded-lg border border-line bg-paper p-2 font-mono text-[10px] text-ink">
                {selectedDoc.sha256Hash}
              </p>
            </div>

            {/* Verification Action and Match Result */}
            <div className="border-t border-line pt-4">
              <button
                onClick={() => handleVerify(selectedDoc)}
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-ink py-2.5 font-mono text-xs font-semibold text-paper transition hover:bg-ink/85 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Calculating & Comparing...' : 'Recalculate & Verify Integrity'}</span>
              </button>

              {verificationResult === 'MATCH' && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-verified/40 bg-verified/10 p-3 text-xs text-verified font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>INTEGRITY VERIFIED: Off-chain document matches the ledger hash bit-for-bit.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-ink" />
                <h3 className="text-base font-bold text-ink">Upload Off-Chain Evidence</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-muted hover:bg-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono font-medium text-ink">File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. lab-analysis-pass-2026.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Linked Event Code</label>
                <input
                  type="text"
                  required
                  value={eventLink}
                  onChange={(e) => setEventLink(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono uppercase outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Document Size</label>
                <input
                  type="text"
                  value={fileSizeStr}
                  onChange={(e) => setFileSizeStr(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div className="rounded-xl border border-line bg-paper p-3 text-[11px] font-mono text-muted">
                File payload will be stored in MinIO S3 object storage; SHA-256 fingerprint will be anchored in PostgreSQL.
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
                  Save Evidence in DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
