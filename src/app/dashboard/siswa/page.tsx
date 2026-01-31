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
    GraduationCap
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import ImportDialog from '@/components/ImportDialog';

export default function SiswaPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/students');
            setData(res);
        } catch (error) {
            console.error('Failed to fetch students', error);
            toast.error('Gagal mengambil data siswa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = data.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.nisn?.toString().includes(search)
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Siswa</h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Master Data</span>
                                <ChevronRight size={10} />
                                <span className="text-red-500">Daftar Siswa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] hover:border-red-200 hover:text-red-500 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <Upload size={18} />
                        Import Excel
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-[0.98] shadow-xl shadow-red-200">
                        <Plus size={18} />
                        Tambah Siswa
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Siswa</p>
                        <h4 className="text-2xl font-black text-gray-900">{data.length}</h4>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari NISN atau nama siswa..."
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-red-100 focus:bg-white transition-all text-sm font-bold shadow-sm placeholder:text-gray-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center p-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-all shadow-sm">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">NISN</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Nama Lengkap</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Gender</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={40} className="text-red-500 animate-spin" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20 grayscale">
                                            <Users size={60} />
                                            <p className="text-sm font-black uppercase tracking-widest">Tidak ada data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-all">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-900">{item.nisn}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{item.name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Siswa Aktif</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                                }`}>
                                                {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-blue-500 hover:border-blue-100 shadow-sm transition-all hover:-translate-y-1">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-red-500 hover:border-red-100 shadow-sm transition-all hover:-translate-y-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
