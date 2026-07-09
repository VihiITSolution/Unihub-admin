'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { facultyService, Faculty, Department } from '@/services/faculty.service';

// ── Sri Lankan defaults used by the Seed button ───────────────────────────────
const SEED_DATA: Array<{ name: string; icon: string; order: number; departments: string[] }> = [
  { name: 'Computing & IT',           icon: '💻', order: 1,  departments: ['Computer Science','Software Engineering','Information Systems','Data Science & AI','Cybersecurity','Computer Engineering','Information Technology'] },
  { name: 'Engineering',              icon: '⚙️', order: 2,  departments: ['Civil Engineering','Mechanical Engineering','Electrical & Electronic Engineering','Chemical & Process Engineering','Production Engineering','Electronics & Telecommunication Engineering','Environmental Engineering'] },
  { name: 'Medicine & Health Sciences',icon: '🩺', order: 3,  departments: ['Anatomy','Physiology','Biochemistry','Pharmacology','Community Medicine','Surgery','Internal Medicine','Paediatrics','Nursing'] },
  { name: 'Management & Business',    icon: '💼', order: 4,  departments: ['Business Administration','Accountancy','Finance','Marketing','Human Resource Management','Economics','Entrepreneurship','Logistics & Transport Management'] },
  { name: 'Arts & Humanities',        icon: '📚', order: 5,  departments: ['English','Sinhala','Tamil','History','Geography','Political Science','Sociology','Psychology','Mass Communication','Fine Arts'] },
  { name: 'Science',                  icon: '🔬', order: 6,  departments: ['Mathematics','Statistics','Physics','Chemistry','Botany','Zoology','Microbiology','Geology','Environmental Sciences','Food Science & Technology'] },
  { name: 'Law',                      icon: '⚖️', order: 7,  departments: ['Private Law','Public & International Law','Commercial Law','Constitutional Law'] },
  { name: 'Education',                icon: '🎓', order: 8,  departments: ['Science Education','Language Education','Educational Technology','Physical Education','Primary Education'] },
  { name: 'Agriculture',              icon: '🌾', order: 9,  departments: ['Agronomy','Animal Science','Agricultural Engineering','Food Science','Horticulture','Agricultural Economics'] },
  { name: 'Architecture',             icon: '🏛️', order: 10, departments: ['Architecture','Town & Country Planning','Urban Design'] },
  { name: 'Allied Health Sciences',   icon: '🏥', order: 11, departments: ['Medical Laboratory Science','Physiotherapy','Radiography','Occupational Therapy','Pharmacy'] },
  { name: 'Dental Sciences',          icon: '🦷', order: 12, departments: ['Oral Biology','Restorative Dentistry','Oral Medicine & Periodontology'] },
  { name: 'Indigenous Medicine',      icon: '🌿', order: 13, departments: ['Ayurveda','Unani Medicine','Deshiya Chikitsa'] },
  { name: 'A/L & Foundation',         icon: '📝', order: 14, departments: ['Physical Science','Biological Science','Commerce','Arts Stream','English Foundation','Mathematics Foundation'] },
];

// ── Tiny toast ────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
      type === 'ok' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      <span>{type === 'ok' ? '✓' : '✕'}</span>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [seeding, setSeedng] = useState(false);
  const [seedProgress, setSeedProgress] = useState('');

  // Faculty form
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [fForm, setFForm] = useState({ name: '', icon: '', description: '' });
  const [fSaving, setFSaving] = useState(false);

  // Department form
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptFacultyId, setDeptFacultyId] = useState<number | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [dName, setDName] = useState('');
  const [dSaving, setDSaving] = useState(false);

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => setToast({ msg, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await facultyService.getAll(true);
      setFaculties(res.data?.faculties ?? []);
    } catch {
      showToast('Failed to load faculties', 'err');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // ── Faculty CRUD ────────────────────────────────────────────────────────────

  const openFacultyModal = (f?: Faculty) => {
    setEditingFaculty(f ?? null);
    setFForm({ name: f?.name ?? '', icon: f?.icon ?? '', description: f?.description ?? '' });
    setShowFacultyModal(true);
  };

  const saveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fForm.name.trim()) return;
    setFSaving(true);
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, fForm);
        showToast('Faculty updated', 'ok');
      } else {
        await facultyService.create(fForm);
        showToast('Faculty created', 'ok');
      }
      setShowFacultyModal(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to save faculty', 'err');
    } finally {
      setFSaving(false);
    }
  };

  const toggleFaculty = async (f: Faculty) => {
    try {
      await facultyService.update(f.id, { isActive: !f.isActive });
      showToast(f.isActive ? 'Faculty deactivated' : 'Faculty activated', 'ok');
      load();
    } catch {
      showToast('Failed to update faculty', 'err');
    }
  };

  const deleteFaculty = async (f: Faculty) => {
    if (!confirm(`Deactivate faculty "${f.name}"?`)) return;
    try {
      await facultyService.delete(f.id);
      showToast('Faculty deactivated', 'ok');
      load();
    } catch {
      showToast('Failed to delete faculty', 'err');
    }
  };

  // ── Department CRUD ─────────────────────────────────────────────────────────

  const openDeptModal = (facultyId: number, dept?: Department) => {
    setDeptFacultyId(facultyId);
    setEditingDept(dept ?? null);
    setDName(dept?.name ?? '');
    setShowDeptModal(true);
  };

  const saveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim() || !deptFacultyId) return;
    setDSaving(true);
    try {
      if (editingDept) {
        await facultyService.updateDepartment(editingDept.id, { name: dName });
        showToast('Department updated', 'ok');
      } else {
        await facultyService.createDepartment(deptFacultyId, { name: dName });
        showToast('Department added', 'ok');
      }
      setShowDeptModal(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to save department', 'err');
    } finally {
      setDSaving(false);
    }
  };

  const toggleDept = async (dept: Department) => {
    try {
      await facultyService.updateDepartment(dept.id, { isActive: !dept.isActive });
      showToast(dept.isActive ? 'Department hidden' : 'Department shown', 'ok');
      load();
    } catch {
      showToast('Failed to update department', 'err');
    }
  };

  const deleteDept = async (dept: Department) => {
    if (!confirm(`Delete department "${dept.name}"?`)) return;
    try {
      await facultyService.deleteDepartment(dept.id);
      showToast('Department deleted', 'ok');
      load();
    } catch {
      showToast('Failed to delete department', 'err');
    }
  };

  // ── Seed ────────────────────────────────────────────────────────────────────

  const handleSeed = async () => {
    if (!confirm('This will add all missing Sri Lankan faculties and departments. Continue?')) return;
    setSeedng(true);
    let created = 0; let deptCreated = 0; let errors = 0;
    try {
      const existing = (await facultyService.getAll(true)).data?.faculties ?? [];
      for (const seed of SEED_DATA) {
        const match = existing.find((f: Faculty) => f.name.toLowerCase() === seed.name.toLowerCase());
        let fid: number | null = null;
        if (match) {
          fid = match.id;
          const existingDepts = new Set((match.departments ?? []).map((d: Department) => d.name.toLowerCase()));
          for (const [i, d] of seed.departments.entries()) {
            if (!existingDepts.has(d.toLowerCase())) {
              setSeedProgress(`Adding "${d}"…`);
              try { await facultyService.createDepartment(fid!, { name: d, order: i + 1 }); deptCreated++; }
              catch { errors++; }
            }
          }
        } else {
          setSeedProgress(`Creating "${seed.name}"…`);
          try {
            const r = await facultyService.create({ name: seed.name, icon: seed.icon, order: seed.order });
            fid = r.data?.faculty?.id ?? null;
            created++;
            for (const [i, d] of seed.departments.entries()) {
              if (fid) {
                setSeedProgress(`Adding "${d}"…`);
                try { await facultyService.createDepartment(fid!, { name: d, order: i + 1 }); deptCreated++; }
                catch { errors++; }
              }
            }
          } catch { errors++; }
        }
      }
      setSeedProgress('');
      showToast(errors === 0
        ? `Done — ${created} faculties + ${deptCreated} departments added`
        : `Done with ${errors} error(s) — ${created} faculties + ${deptCreated} depts`,
        errors === 0 ? 'ok' : 'err');
      load();
    } catch (err: any) {
      setSeedProgress('');
      showToast(err.message ?? 'Seed failed', 'err');
    } finally {
      setSeedng(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculties & Departments</h1>
          <p className="text-gray-600 mt-1">
            Manage faculties and their departments. Changes appear in the header nav and course filters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? 'Seeding…' : '🌱 Seed Sri Lankan Defaults'}
            </Button>
            {seedProgress && (
              <span className="text-xs text-gray-500 max-w-[220px] text-right">{seedProgress}</span>
            )}
          </div>
          <Button variant="primary" onClick={() => openFacultyModal()}>
            + Add Faculty
          </Button>
        </div>
      </div>

      {/* Faculty list */}
      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading…</div>
        ) : faculties.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No faculties yet</p>
            <p className="text-sm">Click <strong>Seed Sri Lankan Defaults</strong> to populate, or add manually.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {faculties.map((f) => {
              const expanded = expandedId === f.id;
              const depts = f.departments ?? [];
              const activeDepts = depts.filter((d) => d.isActive);
              return (
                <div key={f.id}>
                  {/* Faculty row */}
                  <div className="flex items-center gap-3 py-4 px-2">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(expanded ? null : f.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <svg
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {f.icon && <span className="text-xl flex-shrink-0">{f.icon}</span>}
                      <div className="min-w-0">
                        <span className={`font-semibold ${f.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          {f.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {activeDepts.length} dept{activeDepts.length !== 1 ? 's' : ''}
                        </span>
                        {!f.isActive && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">Inactive</span>
                        )}
                      </div>
                    </button>

                    {/* Faculty actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFaculty(f)}
                        className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {f.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openFacultyModal(f)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteFaculty(f)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Departments panel */}
                  {expanded && (
                    <div className="ml-10 mb-4 border border-gray-100 rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</h4>
                        <button
                          onClick={() => openDeptModal(f.id)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800"
                        >
                          + Add Department
                        </button>
                      </div>

                      {depts.length === 0 ? (
                        <p className="text-sm text-gray-400">No departments yet.</p>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {depts.map((d) => (
                            <div key={d.id} className="flex items-center justify-between py-2">
                              <span className={`text-sm ${d.isActive ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                                {d.name}
                              </span>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => toggleDept(d)}
                                  className="text-xs text-amber-600 hover:text-amber-800"
                                >
                                  {d.isActive ? 'Hide' : 'Show'}
                                </button>
                                <button
                                  onClick={() => openDeptModal(f.id, d)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteDept(d)}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Faculty modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingFaculty ? `Edit: ${editingFaculty.name}` : 'Add New Faculty'}
              </h2>
              <form onSubmit={saveFaculty} className="space-y-4">
                <div className="flex gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <input
                      type="text"
                      value={fForm.icon}
                      onChange={(e) => setFForm((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="🎓"
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name *</label>
                    <input
                      type="text"
                      value={fForm.name}
                      onChange={(e) => setFForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="e.g. Faculty of Engineering"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={fForm.description}
                    onChange={(e) => setFForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowFacultyModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={fSaving}>
                    {fSaving ? 'Saving…' : editingFaculty ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Department modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h2>
              <form onSubmit={saveDept} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    required
                    placeholder="e.g. Computer Science"
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowDeptModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={dSaving}>
                    {dSaving ? 'Saving…' : editingDept ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
