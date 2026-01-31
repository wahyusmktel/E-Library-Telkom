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
    GraduationCap,
    ChevronLeft,
    MoreVertical,
    X,
    Save,
    AlertCircle,
    Database,
    Binary
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import ImportDialog from '@/components/ImportDialog';

export default function SiswaPage() {
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
        level: '',
        classNames: '',
        major: ''
    });

    // Reference Data
    const [refs, setRefs] = useState<{ levels: any[], classes: any[], majors: any[] }>({
        levels: [],
        classes: [],
        majors: []
    });

    // Modals
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        nisn: '',
        name: '',
        gender: 'L',
        level_id: '',
        class_id: '',
        major_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: (pagination?.page || 1).toString(),
                limit: (pagination?.limit || 10).toString(),
                q: search || '',
                level: filters?.level || '',
                classNames: filters?.classNames || '',
                major: filters?.major || ''
            }).toString();

            const res = await apiFetch(`/users/students?${query}`);
            setData(res.data || []);
            if (res.pagination) {
                setPagination(prev => ({
                    ...prev,
                    ...res.pagination
                }));
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
            toast.error('Gagal mengambil data siswa');
        } finally {
            setLoading(false);
        }
    };

    const fetchRefs = async () => {
        try {
            const [levels, classes, majors] = await Promise.all([
                apiFetch('/levels'),
                apiFetch('/classes'),
                apiFetch('/majors')
            ]);
            setRefs({ levels, classes, majors });
        } catch (error) {
            console.error('Failed to fetch references', error);
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
            const url = editingItem ? `/users/students/${editingItem.id}` : '/users/students';

            await apiFetch(url, {
                method,
                body: JSON.stringify(formData)
            });

            toast.success(editingItem ? 'Data siswa diperbarui' : 'Siswa berhasil ditambahkan');
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
            await apiFetch(`/users/students/${deletingItem.id}`, { method: 'DELETE' });
            toast.success('Data siswa berhasil dihapus');
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
            nisn: item.nisn,
            name: item.name,
            gender: item.gender,
            level_id: item.level_id || '',
            class_id: item.class_id || '',
            major_id: item.major_id || ''
        });
        setIsFormOpen(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({
            nisn: '',
            name: '',
            gender: 'L',
            level_id: '',
            class_id: '',
            major_id: ''
        });
        setIsFormOpen(true);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-gray-200">
                        <GraduationCap size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Siswa</h1>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md">Master Data</span>
                            <ChevronRight size={12} strokeWidth={3} className="text-gray-300" />
                            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Daftar Aktif</span>
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
                        TAMBAH SISWA
                    </button>
                </div>
            </div>

            {/* Quick Stats & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Cari NISN atau nama siswa..."
                            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:border-red-100 focus:bg-white transition-all text-sm font-bold placeholder:text-gray-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest focus:border-red-100 focus:bg-white transition-all appearance-none cursor-pointer"
                            value={filters.level}
                            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                        >
                            <option value="">Semua Jenjang</option>
                            {refs.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <select
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest focus:border-red-100 focus:bg-white transition-all appearance-none cursor-pointer"
                            value={filters.classNames}
                            onChange={(e) => setFilters({ ...filters, classNames: e.target.value })}
                        >
                            <option value="">Semua Kelas</option>
                            {refs.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-xs font-black uppercase tracking-widest focus:border-red-100 focus:bg-white transition-all appearance-none cursor-pointer"
                            value={filters.major}
                            onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                        >
                            <option value="">Semua Jurusan</option>
                            {refs.majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-red-600 p-6 rounded-[2.5rem] shadow-xl shadow-red-100 flex items-center justify-between text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Data</p>
                        <h4 className="text-3xl font-black">{pagination.total}</h4>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Users size={28} />
                    </div>
                </div>
            </div>

            {/* Content Table Area */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Informasi Siswa</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Jenjang / Kelas</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Jurusan</th>
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
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tidak ada data ditemukan</h3>
                                            <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto italic">Data mungkin kosong atau filter kamu terlalu ketat.</p>
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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{item.nisn}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.1em]">{item.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-black text-gray-900 border-b-2 border-red-100">{item.level_name || '-'}</span>
                                                <span className="px-4 py-1.5 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.class_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100/50 shadow-sm shadow-red-50">
                                                {item.major_name || '-'}
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

                {/* Pagination Bar */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Menampilkan <span className="text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="text-red-600 font-black">{pagination.total}</span> data
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
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

                                return [...Array(end - start + 1)].map((_, idx) => {
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

            {/* Modals Interface */}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                                    <Edit2 size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {editingItem ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                                    </h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Student Profile Information</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Nomor Induk Siswa Nasional (NISN)</label>
                                    <div className="relative group">
                                        <Binary size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold shadow-sm"
                                            value={formData.nisn}
                                            onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                                            placeholder="Contoh: 0098765432"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Nama Lengkap</label>
                                    <div className="relative group">
                                        <Users size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold shadow-sm"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Masukkan nama lengkap..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        {['L', 'P'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`flex-1 py-4 px-6 rounded-2xl text-[12px] font-black tracking-widest transition-all shadow-sm ${formData.gender === g
                                                    ? 'bg-red-600 text-white shadow-red-100 scale-[1.02]'
                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {g === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Jenjang Sekolah</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
                                        value={formData.level_id}
                                        onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                    >
                                        <option value="">Pilih Jenjang</option>
                                        {refs.levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Kelas Saat Ini</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {refs.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Jurusan / Peminatan</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
                                        value={formData.major_id}
                                        onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                                    >
                                        <option value="">Pilih Jurusan</option>
                                        {refs.majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                                >
                                    BATALKAN
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    <Save size={18} strokeWidth={3} />
                                    SIMPAN DATA PROFIL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal (Premium UX) */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-red-50 overflow-hidden">
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                <Trash2 size={40} strokeWidth={2.5} className="animate-bounce" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Hapus Data?</h3>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                    Menghapus data siswa <span className="text-red-600 font-black">{deletingItem?.name}</span> akan memindahkannya ke arsip (Soft Delete).
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                                >
                                    YA, HAPUS SEKARANG
                                </button>
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="w-full py-4 bg-white border-2 border-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                                >
                                    TIDAK, BATALKAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ImportDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                type="siswa"
                title="Siswa"
                onSuccess={fetchData}
            />
        </div>
    );
}
