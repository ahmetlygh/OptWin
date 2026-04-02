export type LabelsMap = Record<string, Record<string, string>>;

export type PreviewLine = { text: string; key: string | null; valueKey?: string; editable: boolean };

export type ExtraLine = { pos: number; text: string; extraIdx?: number };

export type MergedItem = 
    | { type: 'preview'; line: PreviewLine; previewIdx: number }
    | { type: 'extra'; extraIdx: number; text: string; pos: number };

export const LABEL_DESCRIPTIONS: Record<string, string> = {
    scriptTitle: "Script başlığı (header yorumunda görünür)",
    version: "Versiyon alanı etiketi",
    date: "Tarih alanı etiketi",
    developer: "Geliştirici alanı etiketi",
    website: "Website alanı etiketi",
    githubUrl: "Script başlığında kullanılan GitHub URL'i",
    openSource: "Açık kaynak bildirimi (header yorumu)",
    bannerTitle: "ASCII banner bölümünde gösterilen başlık",
    openSourceShort: "Kısa açık kaynak etiketi (banner)",
    adminRequest: "Yönetici izni istenirken gösterilen mesaj",
    adminPrompt: "UAC izin talimatı mesajı",
    adminError: "Yetki yükseltme başarısız olduğundaki hata mesajı",
    adminHint: "Manuel script çalıştırma ipucu",
    pressAnyKey: "Çıkış için tuşa bas mesajı",
    restorePoint: "Geri yükleme noktası oluşturma mesajı",
    restoreSuccess: "Geri yükleme noktası başarılı mesajı",
    restoreFail: "Geri yükleme noktası başarısız mesajı",
    complete: "Optimizasyon tamamlandı başlığı",
    success: "Yeniden başlatma önerisi mesajı",
    thankYou: "Teşekkür mesajı",
    author: "Yazar atıf metni",
    done: "Her özellik tamamlandığında gösterilen metin",
    developerName: "Script başlığında kullanılan geliştirici adı",
    websiteUrl: "Script başlığında kullanılan website URL'i",
    versionNumber: "Script başlığında görünen versiyon numarası (örn: 1.3.0)",
};

export const getLineClass = (text: string) => {
    if (!text || text.trim() === "") return "text-white/20";
    if (text.trim().startsWith("#")) return "text-emerald-400/60"; // Comments
    if (text.includes("Write-Host")) {
        // We will do deeper tokenization in the component if possible, 
        // but as a base class:
        return "text-white"; 
    }
    if (text.trim().startsWith("$")) return "text-cyan-300/70"; // Variables
    if (text.includes("try {") || text.includes("catch {") || text.includes("}")) return "text-[#6b5be6]/80"; // Control Flow
    return "text-white/70";
};
