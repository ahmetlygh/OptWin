import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ── In-memory maintenance cache for middleware ──────────────── */
interface MaintenanceInfo { active: boolean; reason: string; estimatedEnd: string }
let maintenanceCache: { value: MaintenanceInfo; time: number } | null = null;
const CACHE_TTL = 3000; // 3 seconds

async function checkMaintenance(origin: string): Promise<MaintenanceInfo> {
    const now = Date.now();
    if (maintenanceCache && now - maintenanceCache.time < CACHE_TTL) {
        return maintenanceCache.value;
    }
    try {
        const res = await fetch(`${origin}/api/maintenance`, {
            cache: 'no-store',
            headers: { 'x-middleware-internal': '1' },
        });
        const data = await res.json();
        const val: MaintenanceInfo = {
            active: data.maintenance === true,
            reason: data.reason || '',
            estimatedEnd: data.estimatedEnd || '',
        };
        maintenanceCache = { value: val, time: now };
        return val;
    } catch {
        return maintenanceCache?.value ?? { active: false, reason: '', estimatedEnd: '' };
    }
}

/* ── Paths that are ALWAYS allowed (even during maintenance) ── */
const ALWAYS_ALLOWED = [
    '/admin',           // All admin routes
    '/api/admin',       // All admin API routes
    '/api/auth',        // NextAuth
    '/api/maintenance', // Maintenance status check (used by this middleware)
    '/api/system',      // System status
    '/_next',           // Next.js internals
    '/favicon.ico',
    '/optwin.png',
    '/assets',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Pass pathname to server components via header
    const response = NextResponse.next();
    response.headers.set('x-next-pathname', pathname);

    // CORS for API routes
    const isApiRequest = pathname.startsWith('/api');
    if (isApiRequest) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (request.method === 'OPTIONS') {
            const optionsResponse = new NextResponse(null, { status: 200 });
            optionsResponse.headers.set('Access-Control-Allow-Origin', '*');
            optionsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            optionsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return optionsResponse;
        }
    }

    // Check if path is always allowed
    const isAllowed = ALWAYS_ALLOWED.some(p => pathname.startsWith(p));
    if (isAllowed) return response;

    // ── Maintenance mode: block ALL public routes ──
    const mInfo = await checkMaintenance(request.nextUrl.origin);

    if (mInfo.active) {
        // For page requests, return maintenance HTML directly (no site JS bundles)
        if (!isApiRequest) {
            return new NextResponse(buildMaintenanceHtml(mInfo.reason, mInfo.estimatedEnd), {
                status: 503,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Retry-After': '300',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'X-Robots-Tag': 'noindex',
                },
            });
        }

        // For API requests, return 503 JSON
        return NextResponse.json(
            { error: 'Service Unavailable', maintenance: true },
            {
                status: 503,
                headers: {
                    'Retry-After': '300',
                    'Cache-Control': 'no-store',
                },
            }
        );
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

/* ── Dynamic maintenance HTML builder ── */
function buildMaintenanceHtml(reason: string, estimatedEnd: string): string {
    const safeReason = reason.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const hasEnd = !!estimatedEnd;
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>OptWin — Maintenance</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#08080d;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bg{position:fixed;inset:0;z-index:0}
.bg .g1{position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(107,91,230,.1) 0%,transparent 70%)}
.bg .g2{position:absolute;bottom:-15%;left:25%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(147,51,234,.07) 0%,transparent 70%)}
.c{position:relative;z-index:1;text-align:center;padding:2rem;max-width:460px}
.logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:2rem}
.logo img{width:48px;height:48px;filter:drop-shadow(0 0 16px rgba(107,91,230,.5))}
.logo h1{font-size:1.8rem;font-weight:900;background:linear-gradient(to right,#fff,#6b5be6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
@keyframes spin{to{transform:rotate(360deg)}}
.gear{width:48px;height:48px;margin:0 auto 1.5rem;animation:spin 4s linear infinite;color:rgba(107,91,230,.35)}
.msg{color:rgba(255,255,255,.45);font-size:.85rem;line-height:1.7;margin-bottom:1.5rem}
.reason{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:.75rem 1rem;margin-bottom:1.5rem;color:rgba(255,255,255,.3);font-size:.78rem;line-height:1.6}
.reason strong{color:rgba(255,255,255,.5);font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:.25rem}
.bar{width:280px;height:2px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin:0 auto 1.5rem;position:relative}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
.bar span{position:absolute;top:0;left:0;height:100%;width:33%;background:linear-gradient(to right,transparent,rgba(107,91,230,.6),transparent);border-radius:999px;animation:slide 2s ease-in-out infinite}
.cd{margin-bottom:.5rem}
.cd .label{font-size:.68rem;color:rgba(255,255,255,.2);margin-bottom:.5rem}
.cd .boxes{display:flex;gap:8px;justify-content:center;margin-bottom:.4rem}
.cd .box{background:rgba(107,91,230,.08);border:1px solid rgba(107,91,230,.15);border-radius:10px;padding:.4rem .6rem;min-width:52px;text-align:center}
.cd .box .num{font-size:1.3rem;font-weight:800;color:rgba(107,91,230,.8);font-variant-numeric:tabular-nums;font-family:ui-monospace,monospace}
.cd .box .unit{font-size:.55rem;color:rgba(255,255,255,.2);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.cd .date{font-size:.72rem;color:rgba(255,255,255,.2);margin-top:.5rem}
.cd .est{font-size:.6rem;color:rgba(255,255,255,.12);font-style:italic;margin-top:.4rem}
.lang{position:fixed;top:1.5rem;right:1.5rem;z-index:10}
.lang select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;color:rgba(255,255,255,.4);font-size:.72rem;padding:4px 8px;outline:none;cursor:pointer}
.copy{position:fixed;bottom:2rem;left:0;right:0;text-align:center;font-size:.65rem;color:rgba(255,255,255,.12)}
</style>
</head>
<body>
<div class="bg"><div class="g1"></div><div class="g2"></div></div>
<div class="lang"><select id="ls" onchange="switchLang(this.value)">
<option value="tr">🇹🇷 Türkçe</option><option value="en">🇬🇧 English</option><option value="de">🇩🇪 Deutsch</option><option value="fr">🇫🇷 Français</option><option value="es">🇪🇸 Español</option><option value="zh">🇨🇳 中文</option><option value="hi">🇮🇳 हिन्दी</option>
</select></div>
<div class="c">
<div class="logo"><img src="/optwin.png" alt="OptWin"/><h1>OptWin</h1></div>
<svg class="gear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
<p class="msg" id="msg"></p>
${safeReason ? `<div class="reason"><strong id="rl"></strong>${safeReason}</div>` : ''}
<div class="bar"><span></span></div>
${hasEnd ? `<div class="cd"><div class="label" id="cl"></div><div class="boxes"><div class="box"><div class="num" id="d">0</div><div class="unit" id="du"></div></div><div class="box"><div class="num" id="h">0</div><div class="unit" id="hu"></div></div><div class="box"><div class="num" id="m">0</div><div class="unit" id="mu"></div></div><div class="box"><div class="num" id="s">0</div><div class="unit" id="su"></div></div></div><div class="date" id="dt"></div><div class="est" id="es"></div></div>` : ''}
</div>
<div class="copy">&copy; ${new Date().getFullYear()} OptWin. All rights reserved.</div>
<script>
var LANGS={
tr:{msg:"Sitemiz şu anda bakımdadır. Ekibimiz en iyi deneyimi sunmak için çalışıyor.",rl:"Sebep:",cl:"Tahmini Bitiş",d:"Gün",h:"Saat",m:"Dk",s:"Sn",est:"Tahmini süre — daha erken veya geç bitebilir"},
en:{msg:"Our site is currently under maintenance. Our team is working to provide the best experience.",rl:"Reason:",cl:"Estimated Completion",d:"Days",h:"Hours",m:"Min",s:"Sec",est:"Estimated time — may finish earlier or later"},
de:{msg:"Unsere Website befindet sich derzeit in Wartung. Unser Team arbeitet daran, das beste Erlebnis zu bieten.",rl:"Grund:",cl:"Voraussichtliches Ende",d:"Tage",h:"Std",m:"Min",s:"Sek",est:"Geschätzte Zeit — kann früher oder später enden"},
fr:{msg:"Notre site est actuellement en maintenance. Notre équipe travaille pour offrir la meilleure expérience.",rl:"Raison :",cl:"Fin estimée",d:"Jours",h:"Heures",m:"Min",s:"Sec",est:"Temps estimé — peut finir plus tôt ou plus tard"},
es:{msg:"Nuestro sitio está en mantenimiento. Nuestro equipo trabaja para ofrecer la mejor experiencia.",rl:"Razón:",cl:"Finalización estimada",d:"Días",h:"Horas",m:"Min",s:"Seg",est:"Tiempo estimado — puede terminar antes o después"},
zh:{msg:"我们的网站正在维护中。我们的团队正在努力提供最佳体验。",rl:"原因：",cl:"预计完成时间",d:"天",h:"时",m:"分",s:"秒",est:"预计时间 - 可能提前或延迟完成"},
hi:{msg:"हमारी साइट वर्तमान में रखरखाव में है। हमारी टीम सर्वोत्तम अनुभव प्रदान करने के लिए काम कर रही है।",rl:"कारण:",cl:"अनुमानित समाप्ति",d:"दिन",h:"घंटे",m:"मिनट",s:"सेकंड",est:"अनुमानित समय — पहले या बाद में समाप्त हो सकता है"}
};
var END=${hasEnd ? `"${estimatedEnd}"` : 'null'};
var lang=localStorage.getItem('optwin-maint-lang')||navigator.language.slice(0,2)||'en';
if(!LANGS[lang])lang='en';
document.getElementById('ls').value=lang;
function switchLang(l){lang=l;localStorage.setItem('optwin-maint-lang',l);render();}
function render(){
var t=LANGS[lang]||LANGS.en;
document.getElementById('msg').textContent=t.msg;
var rl=document.getElementById('rl');if(rl)rl.textContent=t.rl;
var cl=document.getElementById('cl');if(cl)cl.textContent=t.cl;
var du=document.getElementById('du');if(du)du.textContent=t.d;
var hu=document.getElementById('hu');if(hu)hu.textContent=t.h;
var mu=document.getElementById('mu');if(mu)mu.textContent=t.m;
var su=document.getElementById('su');if(su)su.textContent=t.s;
var es=document.getElementById('es');if(es)es.textContent=t.est;
updateCountdown();
}
function updateCountdown(){
if(!END)return;
var now=Date.now(),end=new Date(END).getTime(),diff=end-now;
if(diff<=0){
var el=document.querySelector('.cd');if(el)el.style.display='none';return;
}
var days=Math.floor(diff/86400000);diff%=86400000;
var hrs=Math.floor(diff/3600000);diff%=3600000;
var mins=Math.floor(diff/60000);diff%=60000;
var secs=Math.floor(diff/1000);
var de=document.getElementById('d');if(de)de.textContent=days;
var he=document.getElementById('h');if(he)he.textContent=hrs;
var me=document.getElementById('m');if(me)me.textContent=mins;
var se=document.getElementById('s');if(se)se.textContent=secs;
var dte=document.getElementById('dt');
if(dte){
try{var d=new Date(END);dte.textContent=d.toLocaleString(lang==='tr'?'tr-TR':lang==='de'?'de-DE':lang==='fr'?'fr-FR':lang==='es'?'es-ES':lang==='zh'?'zh-CN':lang==='hi'?'hi-IN':'en-GB',{dateStyle:'long',timeStyle:'short'});}catch(e){dte.textContent=new Date(END).toLocaleString();}
}
}
render();
setInterval(updateCountdown,1000);
setInterval(function(){
fetch('/api/maintenance').then(function(r){return r.json()}).then(function(d){
if(!d.maintenance)window.location.reload();
}).catch(function(){});
},15000);
</script>
</body>
</html>`;
}
