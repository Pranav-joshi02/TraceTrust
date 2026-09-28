'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { createProduct, fetchOrganizations } from '../../../lib/api';
import { Package, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    productCode: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
    gtin: '08901234567890',
    category: 'Coffee & Beverages',
    unitOfMeasure: 'kg',
    description: '',
    organizationId: 'SUPPLIER-001',
    organizationCode: 'SUPPLIER-001',
  });

  useEffect(() => {
    fetchOrganizations().then((orgs) => {
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
        setForm((prev) => ({
          ...prev,
          organizationId: orgs[0].id,
          organizationCode: orgs[0].organizationCode || orgs[0].id,
        }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'organizationId') {
      const selected = organizations.find((o) => o.id === value);
      setForm((prev) => ({
        ...prev,
        organizationId: value,
        organizationCode: selected?.organizationCode || value,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createProduct({
        productCode: form.productCode,
        sku: form.sku,
        gtin: form.gtin,
        name: form.name,
        description: form.description,
        category: form.category,
        unitOfMeasure: form.unitOfMeasure,
        organizationId: form.organizationId,
        organizationCode: form.organizationCode,
        status: 'ACTIVE',
      });
      router.push('/products');
    } catch (err: any) {
      setError(err?.message || 'Failed to create product. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Register New Product"
      description="Define a traceable product master record within the consortium ledger registry."
      action={
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Products</span>
        </Link>
      }
    >
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-white p-8 shadow-sm"
          aria-label="New product registration form"
        >
          <div className="flex items-center gap-3 border-b border-line pb-6 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Product Master Details</h2>
              <p className="text-xs text-muted">Complete the fields below to register this SKU.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rejected/30 bg-rejected/5 px-4 py-3 text-xs text-rejected" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="product-name" className="block font-medium text-ink mb-1.5">Product Name *</label>
              <input
                id="product-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Single Origin Arabica AA Specialty Roast"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                aria-required="true"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-code" className="block font-medium text-ink mb-1.5">Product Code *</label>
                <input
                  id="product-code"
                  name="productCode"
                  type="text"
                  required
                  value={form.productCode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="product-sku" className="block font-medium text-ink mb-1.5">SKU *</label>
                <input
                  id="product-sku"
                  name="sku"
                  type="text"
                  required
                  value={form.sku}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="product-gtin" className="block font-medium text-ink mb-1.5">GTIN / Barcode</label>
                <input
                  id="product-gtin"
                  name="gtin"
                  type="text"
                  value={form.gtin}
                  onChange={handleChange}
                  placeholder="08901234567890"
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20"
                />
              </div>

              <div>
                <label htmlFor="product-category" className="block font-medium text-ink mb-1.5">Category *</label>
                <select
                  id="product-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
                >
                  <option value="Coffee & Beverages">Coffee & Beverages</option>
                  <option value="Spices & Seasonings">Spices & Seasonings</option>
                  <option value="Organic Produce">Organic Produce</option>
                  <option value="Dairy & Poultry">Dairy & Poultry</option>
                  <option value="Processed Foods">Processed Foods</option>
                </select>
              </div>

              <div>
                <label htmlFor="product-uom" className="block font-medium text-ink mb-1.5">Unit of Measure *</label>
                <select
                  id="product-uom"
                  name="unitOfMeasure"
                  value={form.unitOfMeasure}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 appearance-none"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="g">g (Grams)</option>
                  <option value="ton">ton (Metric Tons)</option>
                  <option value="bag">bag (60kg Burlap)</option>
                  <option value="box">box (Standard Carton)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="product-org" className="block font-medium text-ink mb-1.5">Originating Organization *</label>
              <select
                id="product-org"
                name="organizationId"
                value={form.organizationId}
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
              <label htmlFor="product-desc" className="block font-medium text-ink mb-1.5">Description (optional)</label>
              <textarea
                id="product-desc"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed description, certifications required, terroir notes..."
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none transition focus:border-ink focus:ring-1 focus:ring-ink/20 resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
            <Link
              href="/products"
              className="rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted transition hover:bg-paper"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !form.name || !form.productCode}
              className="flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
              ) : (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Register Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
