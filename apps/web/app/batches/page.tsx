'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { mockBatches, mockProducts, mockOrganizations, Batch, Product, Organization } from '../../lib/data';
import { fetchBatches, createBatch, fetchProducts, fetchOrganizations } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { Plus, Search, Layers, ArrowRight, ShieldCheck, QrCode, RefreshCw } from 'lucide-react';

function BatchesContent() {
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');
  const shouldAutoOpen = searchParams.get('create') === 'true' || Boolean(queryProductId);

  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [productList, setProductList] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tt_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return mockProducts;
  });
  const [orgList, setOrgList] = useState<Organization[]>(mockOrganizations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New batch form state
  const [newBatchCode, setNewBatchCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tt_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
        }
      } catch {}
    }
    return mockProducts[0].id;
  });
  const [selectedOwnerOrg, setSelectedOwnerOrg] = useState(mockOrganizations[0].id);
  const [quantity, setQuantity] = useState('5000');
  const [unit, setUnit] = useState('kg');
  const [origin, setOrigin] = useState('Coorg Valley, Karnataka, India');

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedBatches, fetchedProds, fetchedOrgs] = await Promise.all([
        fetchBatches(),
        fetchProducts(),
        fetchOrganizations()
      ]);
      setBatches(fetchedBatches);
      if (fetchedOrgs && fetchedOrgs.length > 0) {
        setOrgList(fetchedOrgs);
        setSelectedOwnerOrg((prev) => (fetchedOrgs.some((o) => o.id === prev) ? prev : fetchedOrgs[0].id));
      }
      if (fetchedProds && fetchedProds.length > 0) {
        setProductList(fetchedProds);
        if (queryProductId) {
          const match = fetchedProds.find((p) => p.id === queryProductId || p.productCode === queryProductId);
          if (match) {
            setSelectedProduct(match.id);
            setUnit(match.unitOfMeasure || 'kg');
            if (match.organizationId) {
              setSelectedOwnerOrg(match.organizationId);
            }
          } else {
            setSelectedProduct(fetchedProds[0].id);
            setUnit(fetchedProds[0].unitOfMeasure || 'kg');
          }
        } else {
          setSelectedProduct((prev: string) => {
            const exists = fetchedProds.some((p) => p.id === prev);
            const targetId = exists ? prev : fetchedProds[0].id;
            const targetProd = fetchedProds.find((p) => p.id === targetId);
            if (targetProd?.unitOfMeasure) {
              setUnit(targetProd.unitOfMeasure);
            }
            if (targetProd?.organizationId) {
              setSelectedOwnerOrg(targetProd.organizationId);
            }
            return targetId;
          });
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    if (shouldAutoOpen) {
      setIsModalOpen(true);
    }
  }, [queryProductId, shouldAutoOpen]);

  const handleOpenCreateModal = async () => {
    setIsModalOpen(true);
    // Refresh products & orgs on modal open to always show newest registered records
    try {
      const [prods, orgs] = await Promise.all([fetchProducts(), fetchOrganizations()]);
      if (orgs && orgs.length > 0) {
        setOrgList(orgs);
      }
      if (prods && prods.length > 0) {
        setProductList(prods);
        setSelectedProduct((prev: string) => {
          const exists = prods.some((p) => p.id === prev);
          const targetId = exists ? prev : prods[0].id;
          const targetProd = prods.find((p) => p.id === targetId);
          if (targetProd?.unitOfMeasure) {
            setUnit(targetProd.unitOfMeasure);
          }
          if (targetProd?.organizationId) {
            setSelectedOwnerOrg(targetProd.organizationId);
          }
          return targetId;
        });
      }
    } catch (err) {
      console.warn('Could not refresh data for modal:', err);
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const prod = productList.find((p) => p.id === productId);
    if (prod) {
      if (prod.unitOfMeasure) setUnit(prod.unitOfMeasure);
      if (prod.organizationId && orgList.some((o) => o.id === prod.organizationId)) {
        setSelectedOwnerOrg(prod.organizationId);
      }
    }
  };

  const filtered = batches.filter((b) => {
    const matchesSearch = b.batchCode.toLowerCase().includes(search.toLowerCase()) || b.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchCode) return;

    const prod = productList.find((p) => p.id === selectedProduct) || productList[0] || mockProducts[0];
    const ownerOrg = orgList.find((o) => o.id === selectedOwnerOrg) || orgList[0] || mockOrganizations[0];

    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      batchCode: newBatchCode.toUpperCase(),
      productId: prod.id,
      productName: prod.name,
      quantity: Number(quantity),
      unit: prod.unitOfMeasure || unit,
      productionDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-09-25',
      currentOwnerOrgId: ownerOrg.id,
      currentOwnerName: ownerOrg.name,
      status: 'AVAILABLE',
      originLocation: origin,
      trustScore: 95,
      trustStatus: 'VERIFIED'
    };

    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
    setNewBatchCode('');

    await createBatch({
      ...newBatch,
      productCode: prod.productCode,
      currentOwnerCode: ownerOrg.organizationCode
    });
    await loadData();
  };

  return (
    <AppShell
      title="Batch Registry"
      description="Track manufacturing batches, current physical custody, lifecycle milestones, and tamper-evident proofs."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Batches and Products"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-mono text-muted transition hover:text-ink hover:bg-paper"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
          >
            <Plus className="h-4 w-4" />
            <span>Register Batch</span>
          </button>
        </div>
      }
    >
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch code or product..."
            className="w-full rounded-full border border-line bg-paper py-1.5 pl-9 pr-4 font-mono text-xs outline-none transition focus:border-ink"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted">Status:</span>
          {['ALL', 'AVAILABLE', 'IN_TRANSIT', 'IN_PRODUCTION'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Table */}
      <div className="mt-6 rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
            <tr>
              <th className="py-3 px-6">Batch Identifier</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Current Custody</th>
              <th className="py-3 px-4">Production Date</th>
              <th className="py-3 px-4">Trust Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((b) => (
              <tr key={b.id} className="transition hover:bg-paper/50">
                <td className="py-3.5 px-6 font-mono font-bold text-ink">
                  <Link href={`/batches/${b.id}`} className="hover:underline">
                    {b.batchCode}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-medium text-ink truncate max-w-[180px]">{b.productName}</td>
                <td className="py-3.5 px-4 font-mono">
                  {b.quantity} {b.unit}
                </td>
                <td className="py-3.5 px-4 text-muted truncate max-w-[150px]">{b.currentOwnerName}</td>
                <td className="py-3.5 px-4 font-mono text-muted">{b.productionDate}</td>
                <td className="py-3.5 px-4">
                  <StatusPill status={b.trustStatus} />
                </td>
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/verify/${b.batchCode}`}
                      title="Public QR Verification View"
                      className="rounded p-1 text-muted hover:bg-paper hover:text-ink"
                    >
                      <QrCode className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/batches/${b.id}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:underline"
                    >
                      <span>Command Center</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Register Production Lot</h3>
                <p className="text-xs text-muted mt-0.5">Assign an initial custody lot and cryptographic proofs against a certified product.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase text-muted">
                    Product Specification * ({productList.length} available)
                  </label>
                  <Link
                    href="/products"
                    className="font-mono text-[11px] text-ink hover:underline flex items-center gap-1"
                  >
                    <span>+ Register New Product</span>
                  </Link>
                </div>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-medium outline-none focus:border-ink"
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.productCode})
                    </option>
                  ))}
                </select>
                {productList.length === 0 && (
                  <p className="mt-1 font-mono text-[11px] text-pending">
                    No registered products found. Please configure a product in the Product Registry first.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase text-muted">
                    Initial Custodian / Operating Entity * ({orgList.length} verified)
                  </label>
                  <Link
                    href="/organizations"
                    className="font-mono text-[11px] text-ink hover:underline flex items-center gap-1"
                  >
                    <span>+ View Organizations</span>
                  </Link>
                </div>
                <select
                  value={selectedOwnerOrg}
                  onChange={(e) => setSelectedOwnerOrg(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-medium outline-none focus:border-ink"
                >
                  {orgList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.organizationCode} • {o.organizationType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Lot Identifier / Batch Code *</label>
                  <input
                    type="text"
                    required
                    value={newBatchCode}
                    onChange={(e) => setNewBatchCode(e.target.value)}
                    placeholder="e.g. BATCH-2026-004"
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Lot Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                    />
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg"
                      className="mt-1 w-20 rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">Harvest / Origin Facility Location</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Facility, estate origin, or geographic coordinates"
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 outline-none focus:border-ink"
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
                  Confirm Lot Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-muted">Loading Batches...</div>}>
      <BatchesContent />
    </Suspense>
  );
}
