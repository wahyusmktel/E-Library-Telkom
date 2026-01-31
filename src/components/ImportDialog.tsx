'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Download,
    Upload,
    Loader2,
    Check,
    AlertCircle,
    FileSpreadsheet
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
                        toast.success(`Berhasil mengimpor ${data.result.count} data`);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
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

                    {!jobId ? (
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
                    ) : (
                        <div className="space-y-6 text-center py-4">
                            <div className="relative w-24 h-24 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
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
                                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                    {status?.state === 'completed' ? 'Selesai!' : status?.state === 'failed' ? 'Gagal' : 'Sedang Memproses...'}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                    {status?.state === 'active' ? 'Data sedang dimasukkan ke database' : 'Redis Queue Processing'}
                                </p>
                            </div>

                            {(status?.state === 'completed' || status?.state === 'failed') && (
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em]"
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
