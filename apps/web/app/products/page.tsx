'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { mockProducts, Product } from '../../lib/data';
import { fetchProducts, createProduct } from '../../lib/api';
import { Plus, Search, Filter, Package, ArrowRight, Check, RefreshCw, Layers } from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentlyCreated, setRecentlyCreated] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // New product form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Coffee & Tea');
  const [newSku, setNewSku] = useState('');
  const [newGtin, setNewGtin] = useState('');
  const [newUom, setNewUom] = useState('kg');

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const created: Product = {
      id: `prod-${Date.now()}`,
      productCode: newCode.toUpperCase(),
      sku: newSku || 'SKU-NEW',
      gtin: newGtin || '0890999999999',
      name: newName,
      description: 'Newly registered supply chain product definition.',
      category: newCategory,
      unitOfMeasure: newUom,
      status: 'ACTIVE',
      organizationId: 'SUPPLIER-001',
      organizationName: 'Highland Organics Estate'
    };

    setIsModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewSku('');
    setNewGtin('');

    const persisted = await createProduct(created);
    setProducts((prev) => [persisted, ...prev.filter((p) => p.productCode !== persisted.productCode && p.id !== persisted.id)]);
    setRecentlyCreated(persisted);
  };

  return (
    <AppShell
      title="Product Registry"
      description="Manage registered master product catalogs, GTIN identifiers, and provenance configurations."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            title="Refresh Products"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-mono text-muted transition hover:text-ink hover:bg-paper"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
          >
            <Plus className="h-4 w-4" />
            <span>Register Product</span>
          </button>
        </div>
      }
    >
      {/* Recently Created Notification Banner */}
      {recentlyCreated && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-verified/30 bg-verified/5 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verified/20 text-verified">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-ink">
                Product <span className="font-mono text-verified">{recentlyCreated.name}</span> ({recentlyCreated.productCode}) registered successfully!
              </p>
              <p className="text-muted">It is now ready for batch production and supply chain custody assignment.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRecentlyCreated(null)}
              className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-xs text-muted hover:text-ink"
            >
              Dismiss
            </button>
            <Link
              href={`/batches?create=true&productId=${recentlyCreated.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 font-mono text-xs font-semibold text-paper hover:bg-ink/80"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Create Batch Now →</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full rounded-full border border-line bg-paper py-1.5 pl-9 pr-4 font-mono text-xs outline-none transition focus:border-ink"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted">Category:</span>
          {['ALL', 'Coffee & Tea', 'Cocoa & Confectionery', 'Spices & Extracts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="mt-6 rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
            <tr>
              <th className="py-3 px-6">Product Code</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">SKU / GTIN</th>
              <th className="py-3 px-4">Unit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((prod) => (
              <tr key={prod.id} className="transition hover:bg-paper/50">
                <td className="py-3.5 px-6 font-mono font-bold text-ink">
                  <Link href={`/products/${prod.id}`} className="hover:underline">
                    {prod.productCode}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-medium text-ink">
                  <Link href={`/products/${prod.id}`} className="hover:underline">
                    {prod.name}
                  </Link>
                </td>
                <td className="py-3.5 px-4 text-muted">{prod.category}</td>
                <td className="py-3.5 px-4 font-mono text-muted text-[11px]">
                  <span>{prod.sku}</span> • <span>{prod.gtin}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-muted">{prod.unitOfMeasure}</td>
                <td className="py-3.5 px-4">
                  <StatusPill status={prod.status} />
                </td>
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/batches?create=true&productId=${prod.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[11px] font-medium text-ink hover:bg-ink hover:text-paper transition"
                      title="Create Batch for this Product"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New Batch</span>
                    </Link>
                    <Link
                      href={`/products/${prod.id}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:underline"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Register Master Product</h3>
                <p className="text-xs text-muted mt-0.5">Register a catalog SKU that production batches will link to.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. PROD-0004"
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">SKU</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. COF-2026"
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Fairtrade Mountain Espresso Beans"
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 outline-none focus:border-ink"
                  >
                    <option value="Coffee & Tea">Coffee & Tea</option>
                    <option value="Cocoa & Confectionery">Cocoa & Confectionery</option>
                    <option value="Spices & Extracts">Spices & Extracts</option>
                    <option value="Dairy & Produce">Dairy & Produce</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Unit of Measure</label>
                  <input
                    type="text"
                    value={newUom}
                    onChange={(e) => setNewUom(e.target.value)}
                    placeholder="kg, lbs, units"
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">GS1 GTIN Barcode (14 Digits)</label>
                <input
                  type="text"
                  value={newGtin}
                  onChange={(e) => setNewGtin(e.target.value)}
                  placeholder="0890123456789X"
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2 font-mono text-xs font-semibold text-paper hover:bg-ink/80"
                >
                  Register in Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
