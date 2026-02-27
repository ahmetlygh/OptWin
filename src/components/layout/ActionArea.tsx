"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useState } from "react";
// import { generateScript } from "@/lib/script-generator";

export function ActionArea() {
    const { selectedFeatures, setWarningModalOpen, setRestoreModalOpen } = useOptWinStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const hasSelections = selectedFeatures.size > 0;

    const handleGenerate = async () => {
        if (!hasSelections) {
            setWarningModalOpen(true);
            return;
        }
        setIsGenerating(true);

        // UX delay to simulate gathering selections before prompting restore point
        setTimeout(() => {
            setIsGenerating(false);
            setRestoreModalOpen(true);
        }, 800);
    };

    return (
        <div className="flex flex-col items-center justify-center mt-16 mb-8 w-full">
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`
          flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 w-full md:w-auto min-w-[300px] justify-center
          ${hasSelections
                        ? "bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white shadow-[0_8px_20px_rgba(108,92,231,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(108,92,231,0.5),0_0_20px_rgba(108,92,231,0.3)]"
                        : "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed opacity-70"
                    }
        `}
            >
                {isGenerating ? (
                    <>
                        <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                        <TranslatableText en="Generating..." tr="Oluşturuluyor..." noSpan />
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-terminal text-xl"></i>
                        <TranslatableText en="Generate Script" tr="Scripti Oluştur" noSpan />
                        {hasSelections && (
                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                {selectedFeatures.size}
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Helper text */}
            <p className="mt-4 text-sm text-[var(--text-secondary)] text-center max-w-lg">
                <TranslatableText
                    en="Selected features will be bundled into a single executing PowerShell script. No installation required on the target machine."
                    tr="Seçilen özellikler tek bir PowerShell script dosyasına paketlenir. Hedef makinede kuruluma gerek yoktur."
                />
            </p>
        </div>
    );
}
