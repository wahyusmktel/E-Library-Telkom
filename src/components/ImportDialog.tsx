'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Download,
    Upload,
    Loader2,
    Check,
    AlertCircle,
    FileSpreadsheet,
    ChevronRight,
    Search,
    Database,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'siswa' | 'guru';
    title: string;
    onSuccess: () => void;
}

export default function ImportDialog({ isOpen, onClose, type, title, onSuccess }: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);

    // Track job status
    useEffect(() => {
        let interval: any;
        if (jobId && (status?.state !== 'completed' && status?.state !== 'failed')) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`http://localhost:5050/api/import/status/${jobId}`, {
                        credentials: 'include'
                    });
                    const data = await res.json();
                    setStatus(data);

                    if (data.state === 'completed') {
                        toast.success(`Proses impor selesai!`);
                        onSuccess();
                        clearInterval(interval);
                    } else if (data.state === 'failed') {
                        toast.error(`Gagal mengimpor: ${data.error}`);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Failed to poll status', error);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [jobId, status]);

    const handleDownloadTemplate = () => {
        window.open(`http://localhost:5050/api/import/template/${type}`, '_blank');
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5050/api/import/${type}`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setJobId(data.jobId);
                toast.info('Proses impor dimulai di latar belakang');
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengirim file');
            setIsUploading(false);
        }
    };

    const reset = () => {
        setJobId(null);
        setStatus(null);
        setFile(null);
        setIsUploading(false);
    };

    if (!isOpen) return null;

    const isFinished = status?.state === 'completed' || status?.state === 'failed';
    const result = status?.result;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 transition-all ${isFinished && result?.errors?.length > 0 ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}>
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight">Import {title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Excel Spreadsheet Import</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {!jobId ? (
                        <>
                            {/* Template Section */}
                            <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                                        <FileSpreadsheet size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Belum punya template?</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Download format Excel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                                >
                                    <Download size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pilih File Excel</span>
                                    <div className="mt-2 relative">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="import-file"
                                        />
                                        <label
                                            htmlFor="import-file"
                                            className={`w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all
                                                ${file ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-red-200 hover:bg-gray-50/50'}
                                            `}
                                        >
                                            {file ? (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                                                        <Check size={28} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-black text-gray-900">{file.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                                                        <Upload size={24} />
                                                    </div>
                                                    <p className="text-sm font-black text-gray-600">Klik untuk pilih file</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </label>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    Mulai Import
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {!isFinished ? (
                                <div className="space-y-6 text-center py-4">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                            <circle
                                                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={251.2}
                                                strokeDashoffset={251.2 - (251.2 * (status?.progress || 0)) / 100}
                                                className="text-red-500 transition-all duration-500"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-gray-900">
                                            {status?.progress || 0}%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Sedang Memproses...</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 italic">Redis Queue Worker Active</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Rekapitulasi Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Data</p>
                                            <h4 className="text-2xl font-black text-gray-900">{result?.total || 0}</h4>
                                        </div>
                                        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Berhasil</p>
                                            <h4 className="text-2xl font-black text-green-700">{result?.successCount || 0}</h4>
                                        </div>
                                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Gagal</p>
                                            <h4 className="text-2xl font-black text-red-700">{result?.failedCount || 0}</h4>
                                        </div>
                                    </div>

                                    {/* Error Details */}
                                    {result?.errors?.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <AlertTriangle size={16} className="text-red-500" />
                                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Detail Kegagalan Import</h4>
                                            </div>
                                            <div className="bg-white border-2 border-gray-50 rounded-3xl overflow-hidden">
                                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    <table className="w-full text-left text-xs border-collapse">
                                                        <thead className="sticky top-0 bg-gray-50 shadow-sm">
                                                            <tr>
                                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest">Baris</th>
                                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest">Data (NISN/NIP)</th>
                                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest">Alasan Gagal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {result.errors.map((err: any, idx: number) => (
                                                                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                                                    <td className="px-6 py-4 font-bold text-gray-500">{err.row}</td>
                                                                    <td className="px-6 py-4 font-black text-gray-900">{err.data}</td>
                                                                    <td className="px-6 py-4 text-red-600 font-bold">{err.reason}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={reset}
                                            className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:border-red-100 transition-all active:scale-[0.98]"
                                        >
                                            Import Ulang
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-200"
                                        >
                                            Selesai
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
