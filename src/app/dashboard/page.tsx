'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    Library,
    TrendingUp,
    Clock,
    UserPlus,
    School,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        totalStudents: 0,
        totalTeachers: 0,
        totalBooks: 0,
        totalClasses: 0
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await apiFetch('/dashboard/stats');
                setStats(res.stats);
                setRecentActivities(res.recentActivities);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: 'Total Siswa', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', description: 'Siswa Aktif' },
        { label: 'Total Guru', value: stats.totalTeachers, icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50', trend: '+5%', description: 'Tenaga Pengajar' },
        { label: 'Koleksi Buku', value: stats.totalBooks, icon: Library, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+24', description: 'E-Library Item' },
        { label: 'Total Kelas', value: stats.totalClasses, icon: School, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Stabil', description: 'Rombel Aktif' },
    ];

    if (loading) {
        return (
            <div className="p-8 space-y-8 flex items-center justify-center min-vh-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">LOADING DASHBOARD...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-red-600 text-[10px] font-black text-white rounded-full uppercase tracking-widest shadow-lg shadow-red-200">System Online</span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                        Overview <span className="text-red-600">Dashboard</span>
                    </h1>
                    <p className="text-gray-400 font-bold italic text-sm">
                        Selamat datang kembali di ekosistem <span className="text-gray-900 not-italic font-black border-b-2 border-red-100">TS - Education Area</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 bg-white rounded-[1.5rem] border-2 border-gray-50 flex items-center gap-3 shadow-sm">
                        <Clock className="text-red-600" size={20} strokeWidth={3} />
                        <span className="text-sm font-black text-gray-900 uppercase">
                            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform duration-700`}></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-inner`}>
                                    <stat.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">{stat.trend}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value.toLocaleString('id-ID')}</p>
                                    <span className="text-[10px] font-black text-gray-300 uppercase">{stat.description}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activities & Promotions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-gray-100 p-12 shadow-2xl shadow-gray-100/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-transparent"></div>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Aktivitas Terkini</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Real-time system updates</p>
                            </div>
                        </div>
                        <button className="text-xs font-black text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-50 px-6 py-3 rounded-2xl transition-all uppercase tracking-widest">
                            Log Selengkapnya
                        </button>
                    </div>

                    <div className="space-y-8">
                        {recentActivities.length === 0 ? (
                            <div className="py-20 text-center opacity-30 italic font-bold text-gray-400">Belum ada aktivitas baru tercatat...</div>
                        ) : (
                            recentActivities.map((activity, i) => (
                                <div key={i} className="flex items-center gap-8 group cursor-pointer">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm ${activity.type === 'teacher' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                                        }`}>
                                        {activity.type === 'teacher' ? <GraduationCap size={30} /> : <UserPlus size={30} />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{activity.name}</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${activity.type === 'teacher' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                                                }`}>
                                                {activity.type === 'teacher' ? 'GURU BARU' : 'SISWA BARU'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-400 leading-relaxed">
                                            {activity.type === 'teacher' ? 'Data tenaga pengajar baru telah terverifikasi.' : 'Registrasi siswa baru berhasil diproses sistem.'}
                                        </p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-1">timestamp</span>
                                        <span className="text-[11px] font-black text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                            {new Date(activity.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                    <ChevronRight className="text-gray-200 group-hover:text-red-600 transition-colors" size={24} strokeWidth={3} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-10 flex flex-col">
                    {/* Premium Card */}
                    <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="absolute bottom-[10%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                        <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                            <div>
                                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md border border-white/10 shadow-inner">
                                    <Sparkles className="text-red-500" size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-4xl font-black mb-6 leading-tight tracking-tighter italic">TS-E <br /><span className="text-red-600 not-italic">Premium</span></h2>
                                <p className="text-gray-400 font-bold leading-relaxed text-sm">
                                    Optimalkan pengelolaan instansi dengan modul analisis <span className="text-white">Big Data</span> dan integrasi monitoring real-time.
                                </p>
                            </div>
                            <button className="bg-white text-gray-900 w-full py-6 rounded-[2rem] font-black text-xs shadow-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 tracking-[0.2em] uppercase">
                                Upgrade Workspace
                            </button>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-red-50 border-2 border-red-100 rounded-[3rem] p-8 flex items-center gap-6 group hover:bg-white transition-all duration-500 cursor-help">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl shadow-red-100 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <ShieldCheck size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Secure Protocol</h4>
                            <p className="text-[10px] font-bold text-red-500/60 leading-tight uppercase tracking-tight">Data enkripsi AES-256 Aktif</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
