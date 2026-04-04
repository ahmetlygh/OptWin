"use client";

import { signIn } from "next-auth/react";
import { TranslatableText } from "@/components/shared/TranslatableText";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4 dark" data-theme="dark">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(107,91,230,0.08)_0%,transparent_70%)]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)]"></div>
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                {/* Card */}
                <div className="bg-[#1a1a24]/80 backdrop-blur-xl border border-[#2b2938] rounded-3xl p-8 md:p-10 shadow-2xl shadow-(--accent-color)/5">
                    {/* Logo */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-(--accent-color) to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-(--accent-color)/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Admin Panel</h1>
                        <p className="text-sm text-[#a19eb7]">
                            <TranslatableText en="Sign in with your authorized account" tr="Yetkili hesabınızla giriş yapın" />
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/admin" })}
                        className="w-full flex items-center justify-center gap-3 h-14 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <TranslatableText en="Sign in with Google" tr="Google ile Giriş Yap" />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#2b2938]"></div>
                        <span className="text-xs text-[#a19eb7] font-medium uppercase tracking-wider">
                            <TranslatableText en="Authorized only" tr="Sadece yetkili" />
                        </span>
                        <div className="flex-1 h-px bg-[#2b2938]"></div>
                    </div>

                    {/* Info */}
                    <p className="text-center text-xs text-[#a19eb7]/70 leading-relaxed">
                        <TranslatableText
                            en="Only pre-authorized administrator accounts can access this panel. Contact the site owner if you need access."
                            tr="Bu panele sadece önceden yetkilendirilmiş yönetici hesapları erişebilir. Erişim gerekiyorsa site sahibiyle iletişime geçin."
                        />
                    </p>
                </div>

                {/* Back to site */}
                <div className="text-center mt-6">
                    <a href="/" className="text-sm text-[#a19eb7] hover:text-white transition-colors duration-200">
                        ← <TranslatableText en="Back to OptWin" tr="OptWin'e Dön" />
                    </a>
                </div>
            </div>
        </div>
    );
}
