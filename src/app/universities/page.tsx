'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { universityService, University, UniversityFormData } from '@/services/university.service';

// ── Sri Lankan university seed data ──────────────────────────────────────────
const SL_UNIVERSITIES: UniversityFormData[] = [
  { name: 'University of Colombo', shortName: 'UOC', city: 'Colombo', district: 'Colombo', province: 'Western', latitude: 6.9020, longitude: 79.8607, type: 'public', website: 'https://cmb.ac.lk', address: 'College House, 94 Cumaratunga Munidasa Mawatha, Colombo 03' },
  { name: 'University of Peradeniya', shortName: 'PERA', city: 'Peradeniya', district: 'Kandy', province: 'Central', latitude: 7.2542, longitude: 80.5947, type: 'public', website: 'https://pdn.ac.lk', address: 'Peradeniya, Kandy' },
  { name: 'University of Sri Jayewardenepura', shortName: 'USJP', city: 'Nugegoda', district: 'Colombo', province: 'Western', latitude: 6.8638, longitude: 79.8994, type: 'public', website: 'https://sjp.ac.lk', address: 'Gangodawila, Nugegoda' },
  { name: 'University of Kelaniya', shortName: 'UOK', city: 'Kelaniya', district: 'Gampaha', province: 'Western', latitude: 7.0024, longitude: 79.9197, type: 'public', website: 'https://kln.ac.lk', address: 'Dalugama, Kelaniya' },
  { name: 'University of Moratuwa', shortName: 'UOM', city: 'Moratuwa', district: 'Colombo', province: 'Western', latitude: 6.7961, longitude: 79.8808, type: 'public', website: 'https://uom.lk', address: 'Bandaranayake Mawatha, Moratuwa' },
  { name: 'University of Jaffna', shortName: 'UOJ', city: 'Jaffna', district: 'Jaffna', province: 'Northern', latitude: 9.6615, longitude: 80.0255, type: 'public', website: 'https://univ.jfn.ac.lk', address: 'Thirunelvely, Jaffna' },
  { name: 'University of Ruhuna', shortName: 'UOR', city: 'Matara', district: 'Matara', province: 'Southern', latitude: 5.9466, longitude: 80.5350, type: 'public', website: 'https://ruh.ac.lk', address: 'Wellamadama, Matara' },
  { name: 'Eastern University of Sri Lanka', shortName: 'EUSL', city: 'Batticaloa', district: 'Batticaloa', province: 'Eastern', latitude: 7.7180, longitude: 81.6975, type: 'public', website: 'https://esn.ac.lk', address: 'Vantharumoolai, Chenkalady, Batticaloa' },
  { name: 'South Eastern University of Sri Lanka', shortName: 'SEUSL', city: 'Ampara', district: 'Ampara', province: 'Eastern', latitude: 7.2998, longitude: 81.6738, type: 'public', website: 'https://seu.ac.lk', address: 'University Park, Oluvil, Ampara' },
  { name: 'Rajarata University of Sri Lanka', shortName: 'RUSL', city: 'Mihintale', district: 'Anuradhapura', province: 'North Central', latitude: 8.3521, longitude: 80.5064, type: 'public', website: 'https://rjt.ac.lk', address: 'Mihintale' },
  { name: 'Sabaragamuwa University of Sri Lanka', shortName: 'SUSL', city: 'Belihuloya', district: 'Ratnapura', province: 'Sabaragamuwa', latitude: 6.7295, longitude: 80.7680, type: 'public', website: 'https://sab.ac.lk', address: 'Belihuloya' },
  { name: 'Wayamba University of Sri Lanka', shortName: 'WUSL', city: 'Kuliyapitiya', district: 'Kurunegala', province: 'North Western', latitude: 7.4712, longitude: 80.0427, type: 'public', website: 'https://wyb.ac.lk', address: 'Kuliyapitiya' },
  { name: 'Uva Wellassa University of Sri Lanka', shortName: 'UWU', city: 'Badulla', district: 'Badulla', province: 'Uva', latitude: 6.9934, longitude: 81.0550, type: 'public', website: 'https://uwu.ac.lk', address: 'Passara Road, Badulla' },
  { name: 'University of the Visual & Performing Arts', shortName: 'UVPA', city: 'Colombo', district: 'Colombo', province: 'Western', latitude: 6.9050, longitude: 79.8620, type: 'public', website: 'https://vpa.ac.lk', address: 'Nawala Road, Narahenpita, Colombo 05' },
  { name: 'Open University of Sri Lanka', shortName: 'OUSL', city: 'Nawala', district: 'Colombo', province: 'Western', latitude: 6.8796, longitude: 79.8953, type: 'public', website: 'https://ou.ac.lk', address: 'Nawala, Nugegoda' },
  { name: 'General Sir John Kotelawala Defence University', shortName: 'KDU', city: 'Ratmalana', district: 'Colombo', province: 'Western', latitude: 6.8224, longitude: 79.8832, type: 'public', website: 'https://kdu.ac.lk', address: 'Kandawala Road, Ratmalana' },
  { name: 'Sri Lanka Institute of Information Technology', shortName: 'SLIIT', city: 'Malabe', district: 'Colombo', province: 'Western', latitude: 6.9157, longitude: 79.9728, type: 'private', website: 'https://sliit.lk', address: 'New Kandy Rd, Malabe' },
  { name: 'NSBM Green University', shortName: 'NSBM', city: 'Homagama', district: 'Colombo', province: 'Western', latitude: 6.8438, longitude: 80.0302, type: 'private', website: 'https://nsbm.ac.lk', address: 'Mahenwatta, Pitipana, Homagama' },
  { name: 'Informatics Institute of Technology', shortName: 'IIT', city: 'Colombo', district: 'Colombo', province: 'Western', latitude: 6.9000, longitude: 79.8600, type: 'private', website: 'https://iit.ac.lk', address: '57 Ramakrishna Road, Colombo 06' },
  { name: 'Asia Pacific Institute of Information Technology Sri Lanka', shortName: 'APIIT', city: 'Colombo', district: 'Colombo', province: 'Western', latitude: 6.9100, longitude: 79.8700, type: 'private', website: 'https://apiit.lk', address: 'APIIT Business School, 388 Union Place, Colombo 02' },
  { name: 'CINEC Maritime Campus', shortName: 'CINEC', city: 'Malabe', district: 'Colombo', province: 'Western', latitude: 6.9050, longitude: 79.9620, type: 'private', website: 'https://cinec.edu', address: 'Millennium Drive, IT Park, Malabe' },
  { name: 'Horizon Campus', shortName: 'HC', city: 'Malabe', district: 'Colombo', province: 'Western', latitude: 6.9180, longitude: 79.9700, type: 'private', website: 'https://horizoncampus.edu.lk', address: 'Malabe' },
];

const PROVINCES = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-sm font-medium max-w-sm ${
      type === 'ok' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      <span className="text-lg">{type === 'ok' ? '✓' : '✕'}</span>
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    public: 'bg-blue-100 text-blue-800',
    private: 'bg-purple-100 text-purple-800',
    international: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex flex-col gap-1">
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

// ── Empty form ────────────────────────────────────────────────────────────────
const emptyForm = (): UniversityFormData => ({
  name: '', shortName: '', city: '', district: '', province: '',
  address: '', latitude: 0, longitude: 0,
  type: 'public', website: '', phone: '', email: '', isActive: true,
});

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UniversitiesPage() {
  const [all, setAll] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<University | null>(null);
  const [form, setForm] = useState<UniversityFormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Seed
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState('');

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => setToast({ msg, type }), []);

  // ── Load (fetch ALL, filter client-side for live stats) ────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all regardless of status so stats are accurate
      const res = await universityService.getAll({ isActive: undefined } as any);
      setAll(res.data?.universities ?? []);
    } catch {
      showToast('Failed to load universities', 'err');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // ── Derived / filtered list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return all.filter((u) => {
      if (q && !u.name.toLowerCase().includes(q) && !u.shortName?.toLowerCase().includes(q) && !u.city.toLowerCase().includes(q)) return false;
      if (filterType && u.type !== filterType) return false;
      if (filterProvince && u.province !== filterProvince) return false;
      if (filterStatus === 'active' && !u.isActive) return false;
      if (filterStatus === 'inactive' && u.isActive) return false;
      return true;
    });
  }, [all, search, filterType, filterProvince, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, filterType, filterProvince, filterStatus]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: all.length,
    active: all.filter((u) => u.isActive).length,
    public: all.filter((u) => u.type === 'public').length,
    private: all.filter((u) => u.type === 'private').length,
    international: all.filter((u) => u.type === 'international').length,
  }), [all]);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal = (u?: University) => {
    setEditing(u ?? null);
    setForm(u ? {
      name: u.name, shortName: u.shortName ?? '', city: u.city,
      district: u.district ?? '', province: u.province ?? '',
      address: u.address ?? '', latitude: u.latitude, longitude: u.longitude,
      type: u.type, website: u.website ?? '',
      phone: u.phone ?? '', email: u.email ?? '', isActive: u.isActive,
    } : emptyForm());
    setShowModal(true);
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'number' ? parseFloat(value) || 0
             : type === 'checkbox' ? (e.target as HTMLInputElement).checked
             : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await universityService.update(editing.id, form);
        showToast('University updated successfully', 'ok');
      } else {
        await universityService.create(form);
        showToast('University created successfully', 'ok');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to save university', 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggle = async (u: University) => {
    try {
      await universityService.toggleStatus(u.id);
      showToast(`"${u.name}" ${u.isActive ? 'deactivated' : 'activated'}`, 'ok');
      load();
    } catch {
      showToast('Failed to update status', 'err');
    }
  };

  const handleDelete = async (u: University) => {
    if (!confirm(`Permanently delete "${u.name}"? This cannot be undone.`)) return;
    try {
      await universityService.delete(u.id);
      showToast('University deleted', 'ok');
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to delete', 'err');
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = ['ID', 'Name', 'Short Name', 'City', 'District', 'Province', 'Type', 'Website', 'Phone', 'Email', 'Latitude', 'Longitude', 'Status'];
    const rows = filtered.map((u) => [
      u.id, `"${u.name}"`, u.shortName ?? '', u.city, u.district ?? '', u.province ?? '',
      u.type, u.website ?? '', u.phone ?? '', u.email ?? '',
      u.latitude, u.longitude, u.isActive ? 'Active' : 'Inactive',
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'universities.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Seed ───────────────────────────────────────────────────────────────────
  const handleSeed = async () => {
    if (!confirm(`This will add all ${SL_UNIVERSITIES.length} Sri Lankan universities that don't already exist. Continue?`)) return;
    setSeeding(true);
    let created = 0; let skipped = 0; let errors = 0;
    try {
      const existing = new Set(all.map((u) => u.name.toLowerCase().trim()));
      for (const u of SL_UNIVERSITIES) {
        if (existing.has(u.name.toLowerCase().trim())) { skipped++; continue; }
        setSeedProgress(`Creating "${u.name}"…`);
        try { await universityService.create(u); created++; }
        catch { errors++; }
      }
      setSeedProgress('');
      showToast(errors === 0
        ? `Done — ${created} universities added, ${skipped} already existed`
        : `Done with ${errors} error(s) — ${created} added`,
        errors === 0 ? 'ok' : 'err');
      load();
    } catch (err: any) {
      setSeedProgress('');
      showToast(err.message ?? 'Seed failed', 'err');
    } finally {
      setSeeding(false);
    }
  };

  // ── Input classes ──────────────────────────────────────────────────────────
  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage all Sri Lankan university records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Seeding…' : '🌱 Seed Sri Lankan Universities'}
            </Button>
            {seedProgress && <span className="text-xs text-gray-400">{seedProgress}</span>}
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            ↓ Export CSV
          </Button>
          <Button variant="primary" onClick={() => openModal()}>
            + Add University
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} color="#374151" />
        <StatCard label="Active" value={stats.active} color="#059669" />
        <StatCard label="Public" value={stats.public} color="#2563EB" />
        <StatCard label="Private" value={stats.private} color="#7C3AED" />
        <StatCard label="International" value={stats.international} color="#D97706" />
      </div>

      {/* Filter bar */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="search"
              placeholder="Search by name, short name or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inp}
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={`${inp} w-auto`}>
            <option value="">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="international">International</option>
          </select>
          <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className={`${inp} w-auto`}>
            <option value="">All Provinces</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 capitalize ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
          {(search || filterType || filterProvince || filterStatus !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterType(''); setFilterProvince(''); setFilterStatus('all'); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          )}
          <span className="text-sm text-gray-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-1">No universities found</p>
            <p className="text-sm">Try adjusting your filters or click <strong>Seed Sri Lankan Universities</strong>.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">University</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Location</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Type</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Contact</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        {u.shortName && <div className="text-xs text-gray-400 mt-0.5">{u.shortName}</div>}
                        {u.website && (
                          <a href={u.website} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">
                            {u.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                        <div>{u.city}</div>
                        {u.province && <div className="text-xs text-gray-400">{u.province} Province</div>}
                      </td>
                      <td className="py-3 pr-4"><TypeBadge type={u.type} /></td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {u.phone && <div>📞 {u.phone}</div>}
                        {u.email && <div>✉ {u.email}</div>}
                        {!u.phone && !u.email && <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                          <button onClick={() => handleToggle(u)} className="text-amber-600 hover:text-amber-800 font-medium text-xs">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800 font-medium text-xs">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 text-sm border rounded-lg ${page === p ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? `Edit: ${editing.name}` : 'Add New University'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Basic info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>University Name *</label>
                    <input name="name" value={form.name} onChange={handleField} required className={inp} placeholder="University of Colombo" />
                  </div>
                  <div>
                    <label className={lbl}>Short Name</label>
                    <input name="shortName" value={form.shortName} onChange={handleField} className={inp} placeholder="UOC" />
                  </div>
                  <div>
                    <label className={lbl}>Type *</label>
                    <select name="type" value={form.type} onChange={handleField} required className={inp}>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>Website</label>
                    <input name="website" value={form.website} onChange={handleField} className={inp} placeholder="https://example.ac.lk" type="url" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={lbl}>City *</label>
                    <input name="city" value={form.city} onChange={handleField} required className={inp} placeholder="Colombo" />
                  </div>
                  <div>
                    <label className={lbl}>District</label>
                    <input name="district" value={form.district} onChange={handleField} className={inp} placeholder="Colombo" />
                  </div>
                  <div>
                    <label className={lbl}>Province</label>
                    <select name="province" value={form.province} onChange={handleField} className={inp}>
                      <option value="">Select province</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className={lbl}>Address</label>
                    <textarea name="address" value={form.address} onChange={handleField} rows={2} className={inp} placeholder="Full address…" />
                  </div>
                  <div>
                    <label className={lbl}>Latitude *</label>
                    <input name="latitude" value={form.latitude} onChange={handleField} required type="number" step="any" className={inp} placeholder="6.9271" />
                  </div>
                  <div>
                    <label className={lbl}>Longitude *</label>
                    <input name="longitude" value={form.longitude} onChange={handleField} required type="number" step="any" className={inp} placeholder="79.8612" />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleField} className={inp} placeholder="+94 11 123 4567" />
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input name="email" value={form.email} onChange={handleField} type="email" className={inp} placeholder="info@university.ac.lk" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleField} className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible to students)</label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update University' : 'Create University'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
