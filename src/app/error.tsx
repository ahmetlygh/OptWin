"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, Home, RotateCcw } from "lucide-react";

const translations = {
    tr: { title: "Bir Şeyler Ters Gitti", desc: "Beklenmeyen bir sistem hatası oluştu. Yeniden deneyebilir veya ana sayfaya dönebilirsiniz.", home: "Ana Sayfa", retry: "Tekrar Dene" },
    en: { title: "Something went wrong", desc: "An unexpected system error occurred. You can try again or return to the homepage.", home: "Go Home", retry: "Try Again" },
    de: { title: "Etwas ist schiefgelaufen", desc: "Ein unerwarteter Systemfehler ist aufgetreten. Sie können es erneut versuchen oder zur Startseite zurückkehren.", home: "Startseite", retry: "Erneut versuchen" },
    fr: { title: "Quelque chose a mal tourné", desc: "Une erreur système inattendue s'est produite. Vous pouvez réessayer ou retourner à l'accueil.", home: "Accueil", retry: "Réessayer" },
    es: { title: "Algo salió mal", desc: "Ocurrió un error inesperado en el sistema. Puedes intentar de nuevo o volver a la página principal.", home: "Inicio", retry: "Intentar de Nuevo" },
    zh: { title: "出错了", desc: "发生了意外的系统错误。您可以重试或返回主页。", home: "主页", retry: "重试" },
    hi: { title: "कुछ गलत हो गया", desc: "एक अप्रत्याशित सिस्टम त्रुटि उत्पन्न हुई। आप पुनः प्रयास कर सकते हैं या मुखपृष्ठ पर लौट सकते हैं।", home: "मुख्य पृष्ठ", retry: "पुनः प्रयास करें" }
};

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const pathname = usePathname();
    const [lang, setLang] = useState("tr");

    useEffect(() => {
        console.error("Critical boundary exception:", error);
    }, [error]);

    useEffect(() => {
        const pathLang = pathname?.split("/")[1];
        if (translations[pathLang as keyof typeof translations]) {
            setLang(pathLang);
        } else {
            const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
            if (cookieMatch && translations[cookieMatch[1] as keyof typeof translations]) {
                setLang(cookieMatch[1]);
            }
        }
    }, [pathname]);

    const t = translations[lang as keyof typeof translations];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a10] bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[24px_24px] relative overflow-hidden w-full fixed inset-0 z-9999">
            {/* Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#6b5be6]/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg mx-4 p-10 bg-[#0f0f18]/90 border border-white/5 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl text-center"
            >
                <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-inner"
                >
                    <ShieldAlert size={36} strokeWidth={2.5} />
                </motion.div>
                
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t.title}</h1>
                <p className="text-lg font-medium text-white/50 mb-10 leading-relaxed max-w-sm mx-auto">{t.desc}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <RotateCcw size={18} /> {t.retry}
                    </button>
                    <Link
                        href={`/${lang}`}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#6b5be6] hover:bg-[#5b4be6] text-white font-bold tracking-wide transition-all shadow-[0_8px_20px_rgba(108,92,231,0.25)] flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Home size={18} /> {t.home}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
