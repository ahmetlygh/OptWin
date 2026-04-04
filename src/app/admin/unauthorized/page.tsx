"use client";

import { signOut } from "next-auth/react";
import { TranslatableText } from "@/components/shared/TranslatableText";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="bg-[#1a1a24]/80 backdrop-blur-xl border border-[#2b2938] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            <line x1="4" y1="4" x2="20" y2="20" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tight mb-2">
                        <TranslatableText en="Unauthorized Access" tr="Yetkisiz Erişim" />
                    </h1>
                    <p className="text-sm text-[#a19eb7] mb-8 leading-relaxed">
                        <TranslatableText
                            en="Your Google account is not authorized to access the admin panel. Please contact the site administrator."
                            tr="Google hesabınız admin paneline erişim yetkisine sahip değil. Lütfen site yöneticisiyle iletişime geçin."
                        />
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300"
                        >
                            <TranslatableText en="Sign Out" tr="Çıkış Yap" />
                        </button>
                        <a
                            href="/"
                            className="w-full h-12 flex items-center justify-center bg-(--accent-color) hover:bg-(--accent-hover) text-white font-bold rounded-xl transition-all duration-300"
                        >
                            ← <TranslatableText en="Back to OptWin" tr="OptWin'e Dön" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
