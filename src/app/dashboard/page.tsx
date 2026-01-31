'use client';

import React from 'react';
import {
    Users,
    BookOpen,
    GraduationCap,
    ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h1>
                    <p className="text-gray-500 font-medium italic">Selamat datang kembali di <span className="text-red-600 font-bold">Telkom Schools Education Area</span>.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-600 shadow-sm transition-all hover:border-red-200">
                        {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Siswa', value: '12,450', icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-100', trend: '+12%' },
                    { label: 'Kelas Aktif', value: '458', icon: SchoolIcon, color: 'bg-red-600', shadow: 'shadow-red-100', trend: '+5%' },
                    { label: 'Rata-rata Nilai', value: '84.5', icon: GraduationCap, color: 'bg-green-600', shadow: 'shadow-green-100', trend: '+2%' },
                    { label: 'Materi Baru', value: '12', icon: BookOpen, color: 'bg-orange-600', shadow: 'shadow-orange-100', trend: '+8%' },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl ${stat.shadow} group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-red-50 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`${stat.color} p-3.5 rounded-2xl text-white shadow-lg shadow-current/20`}>
                                    {stat.icon && <stat.icon size={22} />}
                                </div>
                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{stat.trend}</span>
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Aktivitas Terakhir</h2>
                            <p className="text-xs font-medium text-gray-400 mt-1">Pantau perkembangan sistem secara real-time</p>
                        </div>
                        <button className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50/50 px-4 py-2 rounded-xl transition-all">Lihat Semua</button>
                    </div>
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-bold text-gray-900 mb-0.5">Pembaharuan Sistem Keamanan</p>
                                    <p className="text-sm font-medium text-gray-400">Protokol enkripsi data siswa telah diperbarui untuk standar 2026.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">2 Jam Lalu</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/30 shadow-inner">
                                <Star fill="white" size={28} />
                            </div>
                            <h2 className="text-3xl font-black mb-4 leading-tight">Telkom Schools <br />Enterprise</h2>
                            <p className="text-red-50 font-medium opacity-90 leading-relaxed text-sm">
                                Buka akses penuh ke fitur analisis mahadata dan monitoring lingkungan sekolah terintegrasi.
                            </p>
                        </div>
                        <button className="bg-white text-red-600 w-full py-5 rounded-3xl font-black text-sm shadow-2xl hover:bg-gray-50 transition-all active:scale-95 mt-10 tracking-widest">
                            AKTIFKAN SEKARANG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SchoolIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const Star = ({ size, fill, className }: { size: number, fill?: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
