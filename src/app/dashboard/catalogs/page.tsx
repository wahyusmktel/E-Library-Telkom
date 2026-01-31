'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Download,
    Upload,
    X,
    Save,
    Book,
    BookOpen,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    Loader2,
    Check,
    ChevronDown,
    Database,
    Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

// --- Components ---

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

function FileUpload({ label, accept, maxSize, type, onUpload, value, previewUrl: initialPreviewUrl, icon: Icon }: any) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [remoteUrl, setRemoteUrl] = useState('');
    const [isRemoteMode, setIsRemoteMode] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [remotePreview, setRemotePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`File terlalu besar. Maksimal ${maxSize}MB`);
            return;
        }

        // Show local preview immediately for images
        if (type === 'cover' && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setLocalPreview(objectUrl);
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5050/api/books/upload?type=${type}`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setRemotePreview(data.url);
                onUpload(data.path, data.url);
                toast.success('File berhasil diunggah');
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengunggah file');
            setLocalPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoteDownload = async () => {
        if (!remoteUrl) return;
        setIsUploading(true);
        setProgress(0);
        try {
            const response = await fetch('http://localhost:5050/api/books/remote-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ url: remoteUrl, type })
            });

            if (!response.ok) throw new Error('Gagal menghubungi server');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('Stream reader not available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(Boolean);

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.type === 'progress') {
                            setProgress(data.percent);
                        } else if (data.type === 'success') {
                            setRemotePreview(data.url);
                            onUpload(data.path, data.url);
                            toast.success('File berhasil diunduh dari URL');
                            setIsRemoteMode(false);
                        } else if (data.type === 'error') {
                            throw new Error(data.message);
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengunduh file dari URL');
        } finally {
            setIsUploading(false);
            setProgress(null);
        }
    };

    const displayPreview = localPreview || (remotePreview ? `http://localhost:5050${remotePreview}` : (initialPreviewUrl ? `http://localhost:5050${initialPreviewUrl}` : null));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
                <button
                    type="button"
                    onClick={() => setIsRemoteMode(!isRemoteMode)}
                    className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline"
                >
                    {isRemoteMode ? <Upload size={10} /> : <Globe size={10} />}
                    {isRemoteMode ? 'Unggah Lokal' : 'Remote Download'}
                </button>
            </div>

            {isRemoteMode ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="https://example.com/file.pdf"
                            className="flex-1 px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-red-100 transition-all text-sm font-bold"
                            value={remoteUrl}
                            onChange={(e) => setRemoteUrl(e.target.value)}
                        />
                        <button
                            onClick={handleRemoteDownload}
                            disabled={isUploading || !remoteUrl}
                            className="px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        </button>
                    </div>

                    {progress !== null && (
                        <div className="bg-gray-100 h-2 w-full rounded-full overflow-hidden">
                            <div
                                className="bg-red-600 h-full transition-all duration-300 flex items-center justify-center"
                                style={{ width: `${progress}%` }}
                            >
                            </div>
                            <div className="flex justify-between mt-1 px-1">
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Downloading...</span>
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{progress}%</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer
                        ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200 hover:bg-gray-50/50'}
                        ${value ? 'bg-green-50/30 border-green-200' : ''}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        key={value || 'file-input'}
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={accept}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFile(e.target.files[0]);
                            }
                        }}
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={32} className="text-red-500 animate-spin" />
                            {progress !== null && (
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Mengunduh... {progress}%</p>
                                </div>
                            )}
                        </div>
                    ) : value ? (
                        <div className="w-full flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            {type === 'cover' ? (
                                <div className="relative w-32 h-44 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50">
                                    {displayPreview ? (
                                        <img
                                            src={displayPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                            <ImageIcon size={32} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Preview Fail</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <Check size={32} className="text-white drop-shadow-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-[1.5rem] shadow-sm border border-green-100 w-full">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-center overflow-hidden">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">File Berhasil Disiapkan</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate w-full px-4">{value.split('/').pop()}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpload('', ''); // Reset path and url
                                    setLocalPreview(null);
                                    setRemotePreview(null);
                                }}
                                className="px-6 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-red-200 hover:text-red-500 transition-all active:scale-95 shadow-sm"
                            >
                                Ganti File
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                <Icon size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-gray-600 group-hover:text-gray-900 transition-colors">Drag & drop atau klik</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Maks {maxSize}MB</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Main Page ---

const PDFReader = dynamic(() => import('./components/PDFReader'), {
    ssr: false,
    loading: () => null
});

export default function KatalogBukuPage() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [readingBook, setReadingBook] = useState<any>(null);

    // Relational options
    const [options, setOptions] = useState<any>({
        categories: [],
        types: [],
        levels: [],
        classes: [],
        subjects: [],
        curriculums: [],
        majors: []
    });

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, []);

    const fetchData = async () => {
        try {
            const data = await apiFetch('/book-catalogs');
            setBooks(data);
        } catch (error) {
            toast.error('Gagal memuat data buku');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        const endpoints = {
            categories: '/book-categories',
            types: '/book-types',
            levels: '/levels',
            classes: '/classes',
            subjects: '/subjects',
            curriculums: '/curriculums',
            majors: '/majors'
        };

        try {
            const results = await Promise.all(
                Object.values(endpoints).map(url => apiFetch(url))
            );
            const newOptions: any = {};
            Object.keys(endpoints).forEach((key, index) => {
                newOptions[key] = results[index];
            });
            setOptions(newOptions);
        } catch (error) {
            console.error('Failed to fetch options', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Judul buku wajib diisi');

        try {
            const method = editingBook ? 'PUT' : 'POST';
            const endpoint = editingBook ? `/book-catalogs/${editingBook.id}` : '/book-catalogs';

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify(formData)
            });

            toast.success(editingBook ? 'Buku diperbarui' : 'Buku ditambahkan');
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus buku ini?')) return;
        try {
            await apiFetch(`/book-catalogs/${id}`, { method: 'DELETE' });
            toast.success('Buku dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus buku');
        }
    };

    const filteredBooks = books.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Katalog <span className="text-red-600">Buku</span>
                        <div className="bg-red-50 text-red-600 text-sm font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-100">
                            Digital
                        </div>
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-[0.2em]">Manajemen repositori buku sekolah</p>
                </div>
                <button
                    onClick={() => { setEditingBook(null); setFormData({}); setIsModalOpen(true); }}
                    className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-xl shadow-red-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Tambah Katalog Baru</span>
                </button>
            </div>

            {/* Stats & Search */}
            <div className="grid md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-3">
                    <div className="relative group">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
                            className="w-full pl-16 pr-8 py-6 bg-white border-2 border-transparent rounded-[2rem] shadow-sm focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all text-lg font-bold placeholder:text-gray-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Koleksi</span>
                        <span className="text-3xl font-black text-gray-900">{filteredBooks.length}</span>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <Book size={24} />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4 opacity-30">
                    <Loader2 size={64} className="animate-spin text-red-600" />
                    <span className="font-black uppercase tracking-[0.3em]">Singkronisasi Data...</span>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
                        <Book size={48} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Repositori Kosong</p>
                        <p className="text-gray-300 font-bold mt-1">Belum ada buku yang terdaftar di sistem.</p>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-red-50 transition-all duration-500 overflow-hidden flex flex-col h-full">
                            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                                {book.cover_url ? (
                                    <img src={`http://localhost:5050${book.cover_url}`} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => { setEditingBook(book); setFormData(book); setIsModalOpen(true); }}
                                        className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                    {book.file_url && (
                                        <button
                                            onClick={() => setReadingBook(book)}
                                            className="w-full py-3 bg-red-600/90 backdrop-blur-md text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                        >
                                            <BookOpen size={16} />
                                            Baca Sekarang
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 line-clamp-1">
                                    {options.categories.find((c: any) => c.id === book.category_id)?.name || 'Tanpa Kategori'}
                                </span>
                                <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-2">{book.title}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 line-clamp-1">{book.author || 'Anonim'}</p>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <FileText size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Edisi {book.edition || 1}</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{book.isbn || 'No ISBN'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    {editingBook ? 'Edit Katalog' : 'Tambah Baru'}
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                </h2>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Lengkapi data buku dengan akurasi tinggi</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all font-black text-sm border-2 border-transparent hover:border-red-100"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 grid md:grid-cols-2 gap-10">
                                {/* Left Side: Details */}
                                <div className="space-y-6">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Informasi Utama</div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Buku *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all font-bold text-gray-900"
                                            placeholder="Masukkan judul lengkap buku"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penulis</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all font-bold text-gray-900 text-sm"
                                                placeholder="Nama penulis"
                                                value={formData.author || ''}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penerbit</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all font-bold text-gray-900 text-sm"
                                                placeholder="Penerbit"
                                                value={formData.publisher || ''}
                                                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ISBN</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all font-bold text-gray-900 text-sm"
                                                placeholder="Contoh: 978-602-..."
                                                value={formData.isbn || ''}
                                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edisi</label>
                                            <input
                                                type="number"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all font-bold text-gray-900 text-sm"
                                                placeholder="Angka Saja"
                                                value={formData.edition || ''}
                                                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] pt-6 mb-4">Relasi & Kategori</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Kategori"
                                            options={options.categories}
                                            value={formData.category_id}
                                            onChange={(val) => setFormData({ ...formData, category_id: val })}
                                            placeholder="Pilih Kategori"
                                        />
                                        <SearchableSelect
                                            label="Tipe"
                                            options={options.types}
                                            value={formData.type_id}
                                            onChange={(val) => setFormData({ ...formData, type_id: val })}
                                            placeholder="Pilih Tipe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Jenjang"
                                            options={options.levels}
                                            value={formData.level_id}
                                            onChange={(val) => setFormData({ ...formData, level_id: val })}
                                            placeholder="Pilih Jenjang"
                                        />
                                        <SearchableSelect
                                            label="Kelas"
                                            options={options.classes}
                                            value={formData.class_id}
                                            onChange={(val) => setFormData({ ...formData, class_id: val })}
                                            placeholder="Pilih Kelas"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Mata Pelajaran"
                                            options={options.subjects}
                                            value={formData.subject_id}
                                            onChange={(val) => setFormData({ ...formData, subject_id: val })}
                                            placeholder="Pilih Mapel"
                                        />
                                        <SearchableSelect
                                            label="Kurikulum"
                                            options={options.curriculums}
                                            value={formData.curriculums}
                                            onChange={(val) => setFormData({ ...formData, curriculum_id: val })}
                                            placeholder="Pilih Kurikulum"
                                        />
                                    </div>

                                    <SearchableSelect
                                        label="Jurusan"
                                        options={options.majors}
                                        value={formData.major_id}
                                        onChange={(val) => setFormData({ ...formData, major_id: val })}
                                        placeholder="Pilih Jurusan"
                                    />
                                </div>

                                {/* Right Side: Uploads */}
                                <div className="space-y-6">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Media & File</div>

                                    <FileUpload
                                        label="Cover Buku"
                                        accept="image/jpeg,image/jpg,image/png"
                                        maxSize={5}
                                        type="cover"
                                        icon={ImageIcon}
                                        value={formData.cover_path}
                                        previewUrl={formData.cover_url}
                                        onUpload={(path: string, url: string) => setFormData({ ...formData, cover_path: path, cover_url: url })}
                                    />

                                    <FileUpload
                                        label="File Buku (PDF)"
                                        accept="application/pdf"
                                        maxSize={100}
                                        type="book"
                                        icon={FileText}
                                        value={formData.file_path}
                                        previewUrl={formData.file_url}
                                        onUpload={(path: string, url: string) => setFormData({ ...formData, file_path: path, file_url: url })}
                                    />

                                    <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex gap-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                                            <Database size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-red-900 uppercase tracking-wider">Penyimpanan Digital</p>
                                            <p className="text-[10px] text-red-600 font-bold mt-1 leading-relaxed">Pastikan file yang diunggah tidak mengandung hak cipta terlarang dan ukuran tidak melebihi batas 100Mb.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10 flex flex-col md:flex-row gap-4 justify-between items-center">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Sudah siap untuk disimpan
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 md:flex-none px-10 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Batalkan
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 md:flex-none px-12 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Simpan Sekarang
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {readingBook && (
                <PDFReader
                    fileUrl={`http://localhost:5050${readingBook.file_url}`}
                    onClose={() => setReadingBook(null)}
                    title={readingBook.title}
                />
            )}
        </div>
    );
}
