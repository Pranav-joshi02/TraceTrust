'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { createBatch, fetchProducts, fetchOrganizations } from '../../../lib/api';
import { Layers, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function NewBatchPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    batchCode: `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
    productId: '',
    productName: '',
    productCode: '',
    currentOwnerOrgId: 'SUPPLIER-001',
    currentOwnerName: 'Highland Organics Estate',
    quantity: 1000,
    unit: 'kg',
    productionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 864e5).toISOString().split('T')[0],
    originLocation: 'Coorg Valley, Karnataka, India',
  });

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrganizations()]).then(([prods, orgs]) => {
      if (prods && prods.length > 0) {
        setProducts(prods);
        setForm((prev) => ({
          ...prev,
          productId: prods[0].id,
          productName: prods[0].name,
          productCode: prods[0].productCode,
        }));
      }
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
        setForm((prev) => ({
          ...prev,
          currentOwnerOrgId: orgs[0].id,
          currentOwnerName: orgs[0].name,
        }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'productId') {
      const selected = products.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        productId: value,
        productName: selected?.name || '',
        productCode: selected?.productCode || '',
      }));
    } else if (name === 'currentOwnerOrgId') {
      const selected = organizations.find((o) => o.id === value);
      setForm((prev) => ({
        ...prev,
        currentOwnerOrgId: value,
        currentOwnerName: selected?.name || '',
      }));
    } else if (name === 'quantity') {
      setForm((prev) => ({ ...prev, quantity: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createBatch({
        batchCode: form.batchCode,
        productId: form.productId,
        productName: form.productName,
        productCode: form.productCode,
        currentOwnerOrgId: form.currentOwnerOrgId,
        currentOwnerName: form.currentOwnerName,
        quantity: form.quantity,
        unit: form.unit,
        productionDate: form.productionDate,
        expiryDate: form.expiryDate,
        originLocation: form.originLocation,
        status: 'AVAILABLE',
      });
      router.push('/batches');
    } catch (err: any) {
      setError(err?.message || 'Failed to create batch. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Create Traceable Batch"
      description="Mint a new physical or virtual batch lot linked to master product specifications."
      action={
        <Link
          href="/batches"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Batches</span>
        </Link>
      }
    >
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white p-8 shadow-sm"
          aria-label="New batch creation form"
        >
          <div className="flex items-center gap-3 border-b border-line pb-6 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Batch Genesis Details</h2>
              <p className="text-xs text-muted">Initialize the provenance journey for this inventory lot.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rejected/30 bg-rejected/5 px-4 py-3 text-xs text-rejected" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch-code" className="block font-medium text-ink mb-1.5">Batch Identifier *</label>
                <input
                  id="batch-code"
                  name="batchCode"
                  type="text"
                  required
                  value={form.batchCode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="batch-product" className="block font-medium text-ink mb-1.5">Linked Product *</label>
                <select
                  id="batch-product"
                  name="productId"
                  required
                  value={form.productId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch-qty" className="block font-medium text-ink mb-1.5">Initial Quantity *</label>
                <input
                  id="batch-qty"
                  name="quantity"
                  type="number"
                  required
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                />
              </div>

              <div>
                <label htmlFor="batch-unit" className="block font-medium text-ink mb-1.5">Unit *</label>
                <select
                  id="batch-unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="g">g (Grams)</option>
                  <option value="ton">ton (Metric Tons)</option>
                  <option value="bag">bag (60kg Standard)</option>
                  <option value="box">box</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="batch-proddate" className="block font-medium text-ink mb-1.5">Production / Harvest Date *</label>
                <input
                  id="batch-proddate"
                  name="productionDate"
                  type="date"
                  required
                  value={form.productionDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                />
              </div>

              <div>
                <label htmlFor="batch-expdate" className="block font-medium text-ink mb-1.5">Expiry / Best-By Date</label>
                <input
                  id="batch-expdate"
                  name="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="batch-owner" className="block font-medium text-ink mb-1.5">Initial Custodian (Organization) *</label>
              <select
                id="batch-owner"
                name="currentOwnerOrgId"
                value={form.currentOwnerOrgId}
                onChange={handleChange}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.organizationCode} • {org.organizationType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-location" className="block font-medium text-ink mb-1.5">Origin Location *</label>
              <input
                id="batch-location"
                name="originLocation"
                type="text"
                required
                value={form.originLocation}
                onChange={handleChange}
                placeholder="e.g. Plot 4B, Estate Highlands, Coorg, India"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
            <Link
              href="/batches"
              className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted transition hover:bg-paper"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !form.batchCode || !form.productId}
              className="flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
              ) : (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Mint Batch Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
