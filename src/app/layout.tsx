import { Inter } from "next/font/google";
import "./globals.css";
import { headers, cookies } from "next/headers";
import { getSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const pathname = headersList.get("x-next-pathname") || "";
    const isAdmin = pathname.startsWith("/admin");
    
    const settings = await getSettings(["default_lang", "default_theme"]);
    const cookieStore = await cookies();

    const lang = cookieStore.get("NEXT_LOCALE")?.value || settings.default_lang || "en";
    const theme = cookieStore.get("NEXT_THEME")?.value || (isAdmin ? "dark" : settings.default_theme) || "dark";

    return (
        <html lang={lang} className={theme} suppressHydrationWarning>
            <body className={`${inter.variable} antialiased selection:bg-[#6c5ce7] selection:text-white theme-ready`}>
                {/*
                  SPLASH: Injected purely via JS — React never touches this element.
                  This avoids ALL Node.insertBefore / Node.removeChild hydration errors.
                  The CSS lives in globals.css (splash-* classes).
                */}
                <script dangerouslySetInnerHTML={{ __html: `
(function() {
  if (document.getElementById('optwin-splash')) return;
  var s = document.createElement('div');
  s.id = 'optwin-splash';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = [
    '<div class="splash-glow-1"></div>',
    '<div class="splash-glow-2"></div>',
    '<div class="splash-spinner-wrap">',
      '<div class="splash-glow-ring"></div>',
      '<div class="splash-glow-ring-2"></div>',
      '<div class="splash-gear-circle">',
        '<svg class="splash-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
          '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>',
          '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
        '</svg>',
      '</div>',
    '</div>',
    '<div class="splash-text">OptWin</div>',
    '<div class="splash-dots"><span></span><span></span><span></span></div>'
  ].join('');
  document.body.appendChild(s);

  function removeSplash() {
    var el = document.getElementById('optwin-splash');
    if (!el) return;
    el.classList.add('fade-out');
    setTimeout(function() {
      var el2 = document.getElementById('optwin-splash');
      if (el2 && el2.parentNode) el2.parentNode.removeChild(el2);
    }, 450);
  }

  if (document.readyState === 'complete') {
    setTimeout(removeSplash, 150);
  } else {
    window.addEventListener('load', function() { setTimeout(removeSplash, 150); });
  }
})();
                ` }} />
                {children}
            </body>
        </html>
    );
}
