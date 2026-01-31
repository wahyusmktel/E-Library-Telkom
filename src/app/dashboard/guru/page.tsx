'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Upload,
    Trash2,
    Edit2,
    Loader2,
    Filter,
    ChevronRight,
    Briefcase,
    ChevronLeft,
    X,
    Save,
    AlertCircle,
    Database,
    Binary,
    UserCheck
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import ImportDialog from '@/components/ImportDialog';

export default function GuruPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        subject: '',
    });

    // Reference Data
    const [refs, setRefs] = useState<{ subjects: any[] }>({
        subjects: [],
    });

    // Modals
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        nip: '',
        name: '',
        gender: 'L',
        subject_id: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: (pagination?.page || 1).toString(),
                limit: (pagination?.limit || 10).toString(),
                q: search || '',
                subject: filters?.subject || '',
            }).toString();

            const res = await apiFetch(`/users/teachers?${query}`);
            setData(res.data || []);
            if (res.pagination) {
                setPagination(prev => ({
                    ...prev,
                    ...res.pagination
                }));
            }
        } catch (error) {
            console.error('Failed to fetch teachers', error);
            toast.error('Gagal mengambil data guru');
        } finally {
            setLoading(false);
        }
    };

    const fetchRefs = async () => {
        try {
            const subjects = await apiFetch('/subjects');
            setRefs({ subjects });
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        }
    };

    useEffect(() => {
        fetchRefs();
    }, []);

    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [search, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [pagination.page, search, filters]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/users/teachers/${editingItem.id}` : '/users/teachers';

            await apiFetch(url, {
                method,
                body: JSON.stringify(formData)
            });

            toast.success(editingItem ? 'Data guru diperbarui' : 'Guru berhasil ditambahkan');
            setIsFormOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        try {
            await apiFetch(`/users/teachers/${deletingItem.id}`, { method: 'DELETE' });
            toast.success('Data guru berhasil dihapus');
            setIsDeleteConfirmOpen(false);
            setDeletingItem(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data');
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            nip: item.nip || '',
            name: item.name,
            gender: item.gender,
            subject_id: item.subject_id || '',
        });
        setIsFormOpen(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({
            nip: '',
            name: '',
            gender: 'L',
            subject_id: '',
        });
        setIsFormOpen(true);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-gray-200">
                        <Briefcase size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Guru</h1>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md">Master Data</span>
                            <ChevronRight size={12} strokeWidth={3} className="text-gray-300" />
                            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Tenaga Pendidik</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] hover:border-red-200 hover:text-red-500 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <Upload size={18} strokeWidth={3} />
                        Import Excel
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex-[2] lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-[0.98] shadow-xl shadow-red-200"
                    >
                        <Plus size={18} strokeWidth={3} />
                        TAMBAH GURU
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Cari NIP atau nama guru..."
                            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-red-100 focus:bg-white transition-all text-sm font-bold placeholder:text-gray-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="flex-1 min-w-[200px] px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest focus:border-red-100 focus:bg-white transition-all appearance-none cursor-pointer"
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        >
                            <option value="">Semua Mata Pelajaran</option>
                            {refs.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-red-600 p-6 rounded-[2.5rem] shadow-xl shadow-red-100 flex items-center justify-between text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Guru</p>
                        <h4 className="text-3xl font-black">{pagination.total}</h4>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <UserCheck size={28} />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Nama Guru</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">NIP</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Mata Pelajaran</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-10 py-8"><div className="h-10 bg-gray-100 rounded-2xl w-48"></div></td>
                                        <td className="px-10 py-8"><div className="h-6 bg-gray-100 rounded-xl w-32 mx-auto"></div></td>
                                        <td className="px-10 py-8"><div className="h-6 bg-gray-100 rounded-xl w-32 mx-auto"></div></td>
                                        <td className="px-10 py-8 text-right"><div className="h-10 bg-gray-100 rounded-xl w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-400">
                                                <Database size={48} />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tidak ada guru ditemukan</h3>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="group hover:bg-red-50/30 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${item.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                    }`}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-base font-black text-gray-900 group-hover:text-red-600 transition-colors">{item.name}</span>
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.1em]">{item.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="text-sm font-bold text-gray-900 px-3 py-1 bg-gray-100 rounded-lg">{item.nip || '-'}</span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100/50 shadow-sm shadow-red-50">
                                                {item.subject_name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-2 group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="w-11 h-11 bg-white border border-gray-100 text-gray-400 rounded-[1rem] flex items-center justify-center hover:text-blue-500 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all hover:-translate-y-1 shadow-sm active:scale-90"
                                                >
                                                    <Edit2 size={18} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeletingItem(item); setIsDeleteConfirmOpen(true); }}
                                                    className="w-11 h-11 bg-white border border-gray-100 text-gray-400 rounded-[1rem] flex items-center justify-center hover:text-red-500 hover:border-red-100 hover:shadow-xl hover:shadow-red-50 transition-all hover:-translate-y-1 shadow-sm active:scale-90"
                                                >
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Halaman <span className="text-red-600">{pagination.page}</span> dari <span className="text-gray-900">{pagination.totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination?.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            className="w-12 h-12 flex items-center justify-center border-2 border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-red-200 hover:text-red-500 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-gray-100 shadow-sm">
                            {(() => {
                                const totalPages = pagination?.totalPages || 0;
                                const currentPage = pagination?.page || 1;
                                let start = Math.max(1, currentPage - 1);
                                let end = Math.min(totalPages, start + 2);

                                if (end - start < 2) {
                                    start = Math.max(1, end - 2);
                                }

                                return [...Array(totalPages > 0 ? (end - start + 1) : 0)].map((_, idx) => {
                                    const pageNum = start + idx;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === pageNum ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-105' : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                        <button
                            disabled={pagination?.page === pagination?.totalPages || (pagination?.totalPages || 0) === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            className="w-12 h-12 flex items-center justify-center border-2 border-gray-100 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-red-200 hover:text-red-500 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingItem ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-red-500 transition-all">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">NIP (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold shadow-sm"
                                    value={formData.nip}
                                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Nama Lengkap</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold shadow-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Jenis Kelamin</label>
                                <div className="flex gap-3">
                                    {['L', 'P'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`flex-1 py-4 rounded-2xl text-[12px] font-black tracking-widest transition-all ${formData.gender === g ? 'bg-red-600 text-white shadow-xl shadow-red-100' : 'bg-gray-50 text-gray-400'
                                                }`}
                                        >
                                            {g === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">Mata Pelajaran</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold appearance-none cursor-pointer"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                >
                                    <option value="">Pilih Mata Pelajaran</option>
                                    {refs.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest">BATAL</button>
                                <button type="submit" className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={18} strokeWidth={3} /> SIMPAN DATA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center space-y-6 animate-in zoom-in-95 border border-red-50">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto"><Trash2 size={40} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Hapus Data?</h3>
                            <p className="text-xs font-bold text-gray-400 mt-2">Hapus guru <span className="text-red-600">{deletingItem?.name}</span>?</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200">HAPUS SEKARANG</button>
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">BATAL</button>
                        </div>
                    </div>
                </div>
            )}

            <ImportDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                type="guru"
                title="Guru"
                onSuccess={fetchData}
            />
        </div>
    );
}
