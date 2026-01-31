'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Loader2, Sparkles, Building2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
                // We'll handle cookies automatically by Express setting them
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal.');
            }

            toast.success('Login Berhasil!', {
                description: `Selamat datang kembali, ${data.user.name}.`,
            });

            // Redirect to dashboard
            router.push('/dashboard');
            router.refresh(); // Refresh to trigger middleware/layout changes
        } catch (error: any) {
            toast.error('Login Gagal', {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-100 rounded-full blur-[100px] opacity-40"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 relative z-10">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 to-red-500 text-white relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-lg">
                                <Building2 size={28} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Telkom Schools</span>
                        </div>

                        <h2 className="text-4xl font-extrabold leading-tight mb-6">
                            Empowering Minds, <br />
                            Accelerating Future.
                        </h2>
                        <p className="text-red-50 text-lg max-w-md opacity-90 leading-relaxed">
                            Selamat datang di portal pusat pendidikan Telkom Schools. Kelola data, materi, dan progres pendidikan lebih mudah melalui satu platform terintegrasi.
                        </p>
                    </div>

                    <div className="relative z-10 pt-12 border-t border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-red-500 bg-red-400 overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-red-100">
                                Bergabung dengan <span className="text-white font-bold">10,000+</span> staf dan pengajar Telkom Schools.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10 text-center lg:text-left">
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <Building2 size={32} />
                                </div>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-2">
                                Halaman Login <span className="text-red-100"><Sparkles className="fill-red-500" size={24} /></span>
                            </h1>
                            <p className="text-gray-500 font-medium">
                                Gunakan akun resmi Telkom Schools Anda untuk masuk.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Sekolah</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-red-500 transition-all bg-gray-50/50 hover:bg-gray-50"
                                        placeholder="nama@telkom.co.id"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-bold text-gray-700">Kata Sandi</label>
                                    <a href="#" className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors">Lupa sandi?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-red-500 transition-all bg-gray-50/50 hover:bg-gray-50"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-1">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" id="remember" />
                                <label htmlFor="remember" className="text-xs font-medium text-gray-600 cursor-pointer">Ingat saya di perangkat ini</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Masuk Sekarang
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 font-medium">
                                Punya masalah saat masuk? <a href="#" className="text-red-600 font-bold border-b-2 border-red-100 hover:border-red-600 transition-all">Pusat Bantuan</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer info */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
                Official Education Area &copy; 2026 Telkom Schools Indonesia
            </div>
        </div>
    );
}
