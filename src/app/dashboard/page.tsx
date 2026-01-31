'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Users,
    BookOpen,
    GraduationCap,
    Calendar,
    LogOut,
    Bell,
    Search,
    LayoutDashboard,
    Settings,
    ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user data to verify auth
        fetch('http://localhost:5000/api/me', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Unauthenticated');
                return res.json();
            })
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5000/api/logout', { method: 'POST' });
            toast.success('Berhasil keluar.');
            router.push('/login');
        } catch (error) {
            toast.error('Gagal keluar.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Memuat data Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f3f5] flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed inset-y-0 shadow-lg z-20">
                <div className="p-8 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                        <span className="font-extrabold text-xl tracking-tight text-gray-900">Schools Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</div>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold transition-all shadow-sm">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-all">
                        <Users size={20} />
                        Siswa & Guru
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-all">
                        <BookOpen size={20} />
                        Materi Pembelajaran
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-all">
                        <GraduationCap size={20} />
                        Ujian Online
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-all">
                        <Calendar size={20} />
                        Jadwal Akademik
                    </a>

                    <div className="pt-8 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">System</div>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-all">
                        <Settings size={20} />
                        Pengaturan
                    </a>
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                    >
                        <LogOut size={20} />
                        Keluar Akun
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="relative max-w-md w-full hidden md:block">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari fitur, data siswa..."
                            className="w-full pl-12 pr-4 py-2 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-0 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-500 hover:text-gray-900 transition-all p-2 bg-gray-50 rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-[1px] bg-gray-200"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
                                <p className="text-xs font-medium text-gray-500 flex items-center justify-end gap-1">
                                    <ShieldCheck size={12} className="text-green-500" />
                                    {user?.role.toUpperCase()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 font-extrabold text-lg border-2 border-white shadow-sm ring-1 ring-red-50">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h1>
                            <p className="text-gray-500 font-medium">Selamat datang kembali di <span className="text-red-600 font-bold">Telkom Schools Education Area</span>.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-600 shadow-sm">
                                31 Jan 2026
                            </div>
                            <button className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95">
                                Download Report
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Siswa', value: '12,450', icon: Users, color: 'bg-blue-600', text: 'text-blue-600', shadow: 'shadow-blue-100' },
                            { label: 'Kelas Aktif', value: '458', icon: SchoolIcon, color: 'bg-red-600', text: 'text-red-600', shadow: 'shadow-red-100' },
                            { label: 'Rata-rata Nilai', value: '84.5', icon: GraduationCap, color: 'bg-green-600', text: 'text-green-600', shadow: 'shadow-green-100' },
                            { label: 'Materi Baru', value: '12', icon: BookOpen, color: 'bg-orange-600', text: 'text-orange-600', shadow: 'shadow-orange-100' },
                        ].map((stat, i) => (
                            <div key={i} className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-xl ${stat.shadow} group hover:-translate-y-1 transition-all duration-300`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                                        {stat.icon && <stat.icon size={22} />}
                                    </div>
                                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-500 mb-1">{stat.label}</h3>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder for more content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900">Aktivitas Terakhir</h2>
                                <button className="text-sm font-bold text-red-600">Lihat Semua</button>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-red-600">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">Pembaharuan Sistem Keamanan</p>
                                            <p className="text-xs font-medium text-gray-500">Berhasil diperbarui pada jam 08:00 AM hari ini.</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">2 Jam Lalu</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
                                        <Star fill="white" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3">Versi Enterprise</h2>
                                    <p className="text-red-50 font-medium opacity-80 leading-relaxed">
                                        Dapatkan fitur analisis lanjutan dan monitoring real-time untuk seluruh lingkungan Telkom Schools.
                                    </p>
                                </div>
                                <button className="bg-white text-red-600 w-full py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-gray-50 transition-all active:scale-95">
                                    UPGRADE SEKARANG
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Missing Lucide component
const SchoolIcon = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const Star = ({ size, fill, className }: { size: number, fill?: string, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill || "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
