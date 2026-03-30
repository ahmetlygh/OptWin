import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getSettings } from "@/lib/settings";
import { languageService } from "@/lib/languageService";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const settings = await getSettings(["site_name"]);
    const siteName = settings.site_name || "OptWin";
    const languages = await languageService.getActiveLanguages();
    const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.isDefault) || languages[0];
    
    // Task 3: Dynamic Metadata Generation Logic for Contact
    const pageTitle = currentLang?.translations?.["page.contact.title"];
    const title = pageTitle ? `${pageTitle} - ${siteName}` : `İletişim - ${siteName}`;

    return { title };
}

export default function Contact() {
    return <ContactClient />;
}
