'use client';

import React, { useState, useEffect, use } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    ArrowLeft,
    Save,
    X,
    Database,
    ChevronDown,
    Check
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const REFERENCE_CONFIG: Record<string, { title: string; endpoint: string; fields: { key: string; label: string; type: string; relation?: string }[] }> = {
    'categories': {
        title: 'Kategori Buku',
        endpoint: 'book-categories',
        fields: [{ key: 'name', label: 'Nama Kategori', type: 'text' }]
    },
    'types': {
        title: 'Tipe Buku',
        endpoint: 'book-types',
        fields: [{ key: 'name', label: 'Nama Tipe', type: 'text' }]
    },
    'levels': {
        title: 'Jenjang',
        endpoint: 'levels',
        fields: [{ key: 'name', label: 'Nama Jenjang', type: 'text' }]
    },
    'classes': {
        title: 'Kelas',
        endpoint: 'classes',
        fields: [
            { key: 'name', label: 'Nama Kelas', type: 'text' },
            { key: 'level_id', label: 'Jenjang', type: 'select', relation: 'levels' },
        ]
    },
    'subjects': {
        title: 'Mata Pelajaran',
        endpoint: 'subjects',
        fields: [{ key: 'name', label: 'Nama Pelajaran', type: 'text' }]
    },
    'curriculums': {
        title: 'Kurikulum',
        endpoint: 'curriculums',
        fields: [{ key: 'name', label: 'Nama Kurikulum', type: 'text' }]
    },
    'majors': {
        title: 'Jurusan',
        endpoint: 'majors',
        fields: [{ key: 'name', label: 'Nama Jurusan', type: 'text' }]
    }
};

function SearchableSelect({ label, options, value, onChange, placeholder }: { label: string; options: any[]; value: string; onChange: (val: string) => void; placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const selectedOption = options.find(o => o.id === value);

    const filteredOptions = options.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4 relative">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">{label}</label>
            <div
                className={`w-full px-6 py-4 bg-gray-50 border-2 transition-all duration-300 rounded-[1.25rem] cursor-pointer flex justify-between items-center group
                    ${isOpen ? 'bg-white border-red-500 shadow-xl shadow-red-50' : 'border-transparent hover:bg-gray-100/50'}
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col">
                    <span className={`text-sm font-black transition-colors ${selectedOption ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    {selectedOption && <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">Terpilih</span>}
                </div>
                <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-red-500 text-white rotate-180' : 'bg-white text-gray-400 shadow-sm'}`}>
                    <ChevronDown size={18} strokeWidth={3} />
                </div>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-[60] left-0 right-0 top-[calc(100%+12px)] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                            <div className="relative group/search">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-red-500 transition-colors" strokeWidth={3} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Cari data..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-red-200 focus:ring-4 focus:ring-red-50 transition-all text-sm font-bold placeholder:text-gray-300"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-3">
                            {filteredOptions.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-40">
                                    <Database size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada hasil</p>
                                </div>
                            ) : (
                                <div className="grid gap-1">
                                    {filteredOptions.map(opt => (
                                        <div
                                            key={opt.id}
                                            className={`px-4 py-3.5 rounded-xl cursor-pointer flex justify-between items-center group transition-all duration-200
                                                ${value === opt.id ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'}
                                            `}
                                            onClick={() => {
                                                onChange(opt.id);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                        >
                                            <span className="text-sm font-bold">{opt.name}</span>
                                            {value === opt.id ? (
                                                <div className="bg-red-500 text-white p-1 rounded-lg">
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-lg border-2 border-gray-100 group-hover:border-red-200 transition-colors" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                            >
                                TUTUP PANEL
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ReferenceCRUDPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const config = REFERENCE_CONFIG[slug];

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [relationalOptions, setRelationalOptions] = useState<Record<string, any[]>>({});

    useEffect(() => {
        if (config) {
            fetchData();
            fetchRelationalData();
        }
    }, [slug]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await apiFetch(`/${config.endpoint}`);
            setData(result);
        } catch (error: any) {
            toast.error(`Gagal memuat data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelationalData = async () => {
        const relations = config.fields.filter(f => f.type === 'select' && f.relation);
        const options: Record<string, any[]> = {};

        for (const rel of relations) {
            try {
                const result = await apiFetch(`/${rel.relation}`);
                options[rel.relation!] = result;
            } catch (err) {
                console.error(`Failed to fetch ${rel.relation}`, err);
            }
        }
        setRelationalOptions(options);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const apiPath = editingItem ? `/${config.endpoint}/${editingItem.id}` : `/${config.endpoint}`;
        const method = editingItem ? 'PUT' : 'POST';

        try {
            await apiFetch(apiPath, {
                method,
                body: JSON.stringify(formData)
            });
            toast.success('Data berhasil disimpan');
            setIsModalOpen(false);
            setEditingItem(null);
            setFormData({});
            fetchData();
        } catch (error: any) {
            toast.error(`Gagal menyimpan: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

        try {
            await apiFetch(`/${config.endpoint}/${id}`, { method: 'DELETE' });
            toast.success('Data berhasil dihapus');
            fetchData();
        } catch (error: any) {
            toast.error(`Gagal menghapus: ${error.message}`);
        }
    };

    const openModal = (item: any = null) => {
        setEditingItem(item);
        setFormData(item || {});
        setIsModalOpen(true);
    };

    if (!config) return <div className="p-8">Page not found</div>;

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const getRelationalName = (field: any, id: string) => {
        const options = relationalOptions[field.relation];
        if (!options) return id;
        return options.find(o => o.id === id)?.name || id;
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                        <Database size={12} />
                        Data Referensi / {config.title}
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{config.title}</h1>
                    <p className="text-sm font-medium text-gray-500">Kelola daftar {config.title.toLowerCase()} untuk sistem pendidikan.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:bg-red-700 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} strokeWidth={3} />
                    TAMBAH DATA
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-md group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Cari ${config.title.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-transparent rounded-2xl focus:border-red-100 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all text-sm font-bold shadow-sm"
                        />
                    </div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                        Total: {data.length} Data
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-24 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-red-600" size={48} strokeWidth={2.5} />
                            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Sinkronisasi Data...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-24 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Database size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada data ditemukan</h3>
                            <p className="text-gray-500 font-medium">Coba gunakan kata kunci lain atau tambah data baru.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    {config.fields.map(field => (
                                        <th key={field.key} className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{field.label}</th>
                                    ))}
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="group hover:bg-red-50/30 transition-colors">
                                        {config.fields.map(field => (
                                            <td key={field.key} className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-700">
                                                    {field.type === 'select' ? getRelationalName(field, item[field.key]) : (item[field.key] || '-')}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-gray-100">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-[2.5rem]">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingItem ? 'Edit Data' : 'Tambah Baru'}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{config.title}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            {config.fields.map(field => (
                                <div key={field.key}>
                                    {field.type === 'select' ? (
                                        <SearchableSelect
                                            label={field.label}
                                            placeholder={`Pilih ${field.label}...`}
                                            options={relationalOptions[field.relation!] || []}
                                            value={formData[field.key] || ''}
                                            onChange={(val) => setFormData({ ...formData, [field.key]: val })}
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    required
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold min-h-[120px]"
                                                    value={formData[field.key] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                                                />
                                            ) : (
                                                <input
                                                    required
                                                    type={field.type}
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold"
                                                    value={formData[field.key] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all tracking-widest"
                                >
                                    BATAL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] tracking-widest flex items-center justify-center gap-2"
                                >
                                    <Save size={18} strokeWidth={3} />
                                    SIMPAN DATA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
