'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SkeletonWrapper } from '@/components/ui/skeleton';
import { BookOpen, School, Star, Rocket } from 'lucide-react';

export default function HomeContent() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            toast.success('Selamat Datang di Telkom Schools Education Area!');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleAction = () => {
        toast.info('Fitur ini akan segera hadir.', {
            description: 'Kami sedang membangun sesuatu yang luar biasa untuk Anda.',
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar Mockup */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Telkom Schools</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Courses</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Resources</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Community</a>
                        <button
                            onClick={handleAction}
                            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider">
                            <Star size={14} fill="currentColor" />
                            <span>Digital Education Excellence</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1]">
                            Telkom Schools <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                                Education Area
                            </span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Platform edukasi digital terpadu untuk siswa, guru, dan orang tua. Rasakan pengalaman belajar masa depan di ekosistem Telkom Schools.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => toast.success('Memulai perjalanan Anda...')}
                                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95 group"
                            >
                                <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Mulai Sekarang
                            </button>
                            <button
                                onClick={handleAction}
                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Jelajahi Program
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        {loading ? (
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl space-y-6">
                                <SkeletonWrapper height={200} borderRadius={20} />
                                <div className="space-y-3">
                                    <SkeletonWrapper height={30} width="60%" />
                                    <SkeletonWrapper count={3} />
                                </div>
                                <div className="flex gap-3">
                                    <SkeletonWrapper height={40} width={100} borderRadius={10} />
                                    <SkeletonWrapper height={40} width={100} borderRadius={10} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xl transform hover:scale-[1.02] transition-transform">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-8 h-[400px] flex items-center justify-center">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50"></div>
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

                                    <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-3 active:scale-95 transition-transform cursor-pointer group">
                                            <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                <BookOpen size={24} />
                                            </div>
                                            <span className="font-semibold text-gray-800">Materi</span>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-3 active:scale-95 transition-transform cursor-pointer group">
                                            <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                <School size={24} />
                                            </div>
                                            <span className="font-semibold text-gray-800">Kampus</span>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-3 active:scale-95 transition-transform cursor-pointer group col-span-2">
                                            <span className="text-sm text-gray-500 font-medium">Statistik Belajar</span>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-red-600 h-full w-[75%]"></div>
                                            </div>
                                            <span className="text-xl font-bold text-gray-900">75% Selesai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Mockup */}
            <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50 grayscale">
                        <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center text-white font-bold text-xs">T</div>
                        <span className="font-bold text-lg tracking-tight text-gray-900">Telkom Schools</span>
                    </div>
                    <p className="text-sm text-gray-500">&copy; 2026 Telkom Schools Education Area. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
