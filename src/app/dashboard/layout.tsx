'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
    ShieldCheck,
    Building2,
    Database,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isReferenceOpen, setIsReferenceOpen] = useState(false);

    useEffect(() => {
        // Fetch user data to verify auth
        fetch('http://localhost:5050/api/me', {
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
            await fetch('http://localhost:5050/api/logout', { method: 'POST', credentials: 'include' });
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
                    <p className="text-gray-500 font-medium">Memuat sistem...</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', role: 'all' },
        { label: 'Siswa & Guru', icon: Users, href: '/dashboard/users', role: 'all' },
        { label: 'Materi Pembelajaran', icon: BookOpen, href: '/dashboard/materials', role: 'all' },
        { label: 'Ujian Online', icon: GraduationCap, href: '/dashboard/exams', role: 'all' },
        { label: 'Jadwal Akademik', icon: Calendar, href: '/dashboard/schedule', role: 'all' },
    ];

    const referenceItems = [
        { label: 'Kategori Buku', href: '/dashboard/reference/categories' },
        { label: 'Tipe Buku', href: '/dashboard/reference/types' },
        { label: 'Jenjang', href: '/dashboard/reference/levels' },
        { label: 'Kelas', href: '/dashboard/reference/classes' },
        { label: 'Mata Pelajaran', href: '/dashboard/reference/subjects' },
        { label: 'Kurikulum', href: '/dashboard/reference/curriculums' },
        { label: 'Jurusan', href: '/dashboard/reference/majors' },
    ];

    const isReferenceActive = pathname.startsWith('/dashboard/reference');

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed inset-y-0 shadow-sm z-30">
                <div className="p-6 border-b border-gray-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                            <Building2 size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-tight text-gray-900 leading-none">Telkom</span>
                            <span className="text-xs font-bold text-red-600 tracking-wider">SCHOOLS</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4 mt-2">Menu Utama</div>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${pathname === item.href
                                ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-red-500'} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}

                    {user?.role === 'superadmin' && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${isReferenceActive
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Database size={20} className={isReferenceActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'} />
                                    <span className="text-sm">Data Referensi</span>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isReferenceOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isReferenceOpen && (
                                <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 py-1 animate-in slide-in-from-top-2 duration-300">
                                    {referenceItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${pathname === item.href
                                                ? 'text-red-600 bg-red-50/50'
                                                : 'text-gray-500 hover:text-red-500 hover:translate-x-1'
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">System</div>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all group">
                        <Settings size={20} className="text-gray-400 group-hover:text-red-500" />
                        <span className="text-sm">Pengaturan</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm">Keluar Akun</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <div className="relative max-w-md w-full hidden md:block group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari fitur atau data..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-red-200 focus:ring-0 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="relative text-gray-400 hover:text-red-600 transition-all p-2.5 bg-gray-100 hover:bg-red-50 rounded-xl group">
                            <Bell size={20} className="group-active:scale-95 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-[1px] bg-gray-200 hidden sm:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 flex items-center justify-end gap-1 uppercase tracking-wider">
                                    <ShieldCheck size={10} className="text-green-500" />
                                    {user?.role}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-red-100 border-2 border-white">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-container">
                    {children}
                </div>
            </main>
        </div>
    );
}
