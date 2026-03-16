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
    // reason may be a JSON object like {"tr":"...","en":"..."} or a plain string
    let reasonMap: Record<string, string> = {};
    try { reasonMap = JSON.parse(reason); } catch { reasonMap = { en: reason, tr: reason }; }
    const safeReasonMap = Object.fromEntries(
        Object.entries(reasonMap).map(([k, v]) => [k, (v || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')])
    );
    const hasAnyReason = Object.values(safeReasonMap).some(v => v.trim());
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
body{background:#08080d;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;opacity:0;animation:bodyFade .6s .1s ease both}
@keyframes bodyFade{to{opacity:1}}
.bg{position:fixed;inset:0;z-index:0}
.bg .g1{position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(107,91,230,.14) 0%,transparent 70%);animation:pulse 4s ease-in-out infinite}
.bg .g2{position:absolute;bottom:-15%;left:20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(147,51,234,.10) 0%,transparent 70%);animation:pulse 5s 1s ease-in-out infinite}
.bg .g3{position:absolute;top:25%;right:-8%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 70%);animation:pulse 6s 2s ease-in-out infinite}
.bg .g4{position:absolute;bottom:10%;right:30%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.06) 0%,transparent 70%);animation:pulse 7s .5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.c{position:relative;z-index:1;text-align:center;padding:2rem;max-width:560px;opacity:0;transform:translateY(20px);animation:contentUp .6s .3s cubic-bezier(.16,1,.3,1) both}
@keyframes contentUp{to{opacity:1;transform:translateY(0)}}
.logo{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:2.2rem}
.logo img{width:68px;height:68px;object-fit:contain;vertical-align:middle;filter:drop-shadow(0 0 25px rgba(107,91,230,.5))}
.logo h1{font-size:2.5rem;font-weight:900;background:linear-gradient(to right,#fff,#6b5be6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
@keyframes spin{to{transform:rotate(360deg)}}
.gear{width:68px;height:68px;margin:0 auto 2rem;animation:spin 4s linear infinite;color:rgba(107,91,230,.35)}
.msg-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:1.2rem 1.5rem;margin:0 auto 1.5rem;max-width:460px;backdrop-filter:blur(4px)}
.msg{color:rgba(255,255,255,.50);font-size:1.12rem;line-height:1.7;margin-bottom:.4rem}
.apology{color:rgba(255,255,255,.25);font-size:.94rem;line-height:1.7}
.reason{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:1rem 1.3rem;margin-bottom:1.6rem;color:rgba(255,255,255,.30);font-size:.94rem;line-height:1.6;text-align:left;max-width:460px;margin-left:auto;margin-right:auto}
.reason strong{color:rgba(255,255,255,.38);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:.3rem}
.bar{width:384px;height:3px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin:0 auto .65rem;position:relative}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
.bar span{position:absolute;top:0;left:0;height:100%;width:33%;background:linear-gradient(to right,transparent,rgba(107,91,230,.6),transparent);border-radius:999px;animation:slide 2s ease-in-out infinite}
.wip{font-size:.82rem;color:rgba(255,255,255,.18);font-weight:500;margin-bottom:.8rem;letter-spacing:.02em}
.clock{font-size:.82rem;color:rgba(255,255,255,.14);font-family:ui-monospace,monospace;font-variant-numeric:tabular-nums;margin-bottom:1.6rem}
.cd{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:16px;padding:1.2rem 1.5rem;margin:0 auto 1rem;max-width:460px}
.cd .label{font-size:.82rem;color:rgba(255,255,255,.25);margin-bottom:1rem;text-transform:uppercase;font-weight:700;letter-spacing:.08em}
.cd .boxes{display:flex;gap:12px;justify-content:center;margin-bottom:.7rem}
.cd .box{background:rgba(107,91,230,.07);border:1px solid rgba(107,91,230,.14);border-radius:14px;padding:.6rem .8rem;min-width:72px;text-align:center}
.cd .box .num{font-size:1.8rem;font-weight:800;color:rgba(107,91,230,.7);font-variant-numeric:tabular-nums;font-family:ui-monospace,monospace}
.cd .box .unit{font-size:.62rem;color:rgba(255,255,255,.18);text-transform:uppercase;letter-spacing:.06em;margin-top:3px}
.cd .date{font-size:.88rem;color:rgba(255,255,255,.18);margin-top:.5rem}
.cd .est{font-size:.7rem;color:rgba(255,255,255,.1);font-style:italic;margin-top:.4rem}
.lang{position:fixed;top:1.5rem;right:1.5rem;z-index:10}
.lang-btn{display:flex;align-items:center;gap:6px;padding:5px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;color:rgba(255,255,255,.4);font-size:.72rem;font-weight:500;cursor:pointer;outline:none;font-family:inherit;transition:all .2s}
.lang-btn:hover{border-color:rgba(255,255,255,.12);color:rgba(255,255,255,.6)}
.lang-btn .globe{width:13px;height:13px;opacity:.4}
.lang-btn .arrow{width:10px;height:10px;opacity:.3;transition:transform .2s}
.lang-btn.open .arrow{transform:rotate(180deg)}
.lang-dd{position:absolute;right:0;top:calc(100% + 4px);min-width:150px;background:#13131d;border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.5);opacity:0;transform:translateY(-4px) scale(.97);pointer-events:none;transition:all .15s cubic-bezier(.16,1,.3,1)}
.lang-dd.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
.lang-dd button{display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;border:none;background:none;color:rgba(255,255,255,.4);font-size:.74rem;font-weight:500;cursor:pointer;text-align:left;transition:all .15s;font-family:inherit}
.lang-dd button:hover{background:rgba(255,255,255,.03);color:rgba(255,255,255,.7)}
.lang-dd button.active{background:rgba(107,91,230,.1);color:#6b5be6}
.copy{position:fixed;bottom:2rem;left:0;right:0;text-align:center;font-size:1rem;color:rgba(255,255,255,.13);font-weight:500}
</style>
</head>
<body>
<div class="bg"><div class="g1"></div><div class="g2"></div><div class="g3"></div><div class="g4"></div></div>
<div class="lang">
<button class="lang-btn" id="lb" onclick="toggleDD()">
<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
<span id="lf"></span><span id="ll"></span>
<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
</button>
<div class="lang-dd" id="ld"></div>
</div>
<div class="c">
<div class="logo"><img src="/optwin.png" alt="OptWin"/><h1>OptWin</h1></div>
<svg class="gear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
<div class="msg-card"><p class="msg" id="msg"></p>
<p class="apology" id="apo"></p></div>
${hasAnyReason ? `<div class="reason"><strong id="rl"></strong><span id="reasonText"></span></div>` : ''}
<div class="bar"><span></span></div>
<p class="wip" id="wip"></p>
<p class="clock" id="clock"></p>
${hasEnd ? `<div class="cd"><div class="label" id="cl"></div><div class="boxes"><div class="box"><div class="num" id="d">0</div><div class="unit" id="du"></div></div><div class="box"><div class="num" id="h">0</div><div class="unit" id="hu"></div></div><div class="box"><div class="num" id="m">0</div><div class="unit" id="mu"></div></div><div class="box"><div class="num" id="s">0</div><div class="unit" id="su"></div></div></div><div class="date" id="dt"></div><div class="est" id="es"></div></div>` : ''}
</div>
<div class="copy">&copy; ${new Date().getFullYear()} OptWin. All rights reserved.</div>
<script>
var LOCALE_MAP={tr:'tr-TR',en:'en-GB',de:'de-DE',fr:'fr-FR',es:'es-ES',zh:'zh-CN',hi:'hi-IN'};
var UTC_OFFSET={tr:3,en:0,de:1,fr:1,es:1,zh:8,hi:5.5};
var LANGS={
tr:{label:"Türkçe",flag:"\u{1F1F9}\u{1F1F7}",msg:"Sitemiz şu anda bakımdadır. Ekibimiz en iyi deneyimi sunmak için çalışıyor.",apo:"Verdiğimiz rahatsızlık için özür dileriz.",rl:"Sebep:",cl:"Tahmini Bitiş",d:"Gün",h:"Saat",m:"Dk",s:"Sn",est:"Tahmini süre — daha erken veya geç bitebilir",wip:"Çalışmalar devam ediyor..."},
en:{label:"English",flag:"\u{1F1EC}\u{1F1E7}",msg:"Our site is currently under maintenance. Our team is working to provide the best experience.",apo:"We apologize for the inconvenience.",rl:"Reason:",cl:"Estimated Completion",d:"Days",h:"Hours",m:"Min",s:"Sec",est:"Estimated time — may finish earlier or later",wip:"Work in progress..."},
de:{label:"Deutsch",flag:"\u{1F1E9}\u{1F1EA}",msg:"Unsere Website befindet sich derzeit in Wartung. Unser Team arbeitet daran, das beste Erlebnis zu bieten.",apo:"Wir entschuldigen uns für die Unannehmlichkeiten.",rl:"Grund:",cl:"Voraussichtliches Ende",d:"Tage",h:"Std",m:"Min",s:"Sek",est:"Geschätzte Zeit — kann früher oder später enden",wip:"Arbeiten im Gange..."},
fr:{label:"Français",flag:"\u{1F1EB}\u{1F1F7}",msg:"Notre site est actuellement en maintenance. Notre équipe travaille pour offrir la meilleure expérience.",apo:"Nous nous excusons pour la gêne occasionnée.",rl:"Raison :",cl:"Fin estimée",d:"Jours",h:"Heures",m:"Min",s:"Sec",est:"Temps estimé — peut finir plus tôt ou plus tard",wip:"Travaux en cours..."},
es:{label:"Español",flag:"\u{1F1EA}\u{1F1F8}",msg:"Nuestro sitio está en mantenimiento. Nuestro equipo trabaja para ofrecer la mejor experiencia.",apo:"Pedimos disculpas por las molestias.",rl:"Razón:",cl:"Finalización estimada",d:"Días",h:"Horas",m:"Min",s:"Seg",est:"Tiempo estimado — puede terminar antes o después",wip:"Trabajos en curso..."},
zh:{label:"中文",flag:"\u{1F1E8}\u{1F1F3}",msg:"我们的网站正在维护中。我们的团队正在努力提供最佳体验。",apo:"对此给您带来的不便，我们深表歉意。",rl:"原因：",cl:"预计完成时间",d:"天",h:"时",m:"分",s:"秒",est:"预计时间 - 可能提前或延迟完成",wip:"工作正在进行中..."},
hi:{label:"हिन्दी",flag:"\u{1F1EE}\u{1F1F3}",msg:"हमारी साइट वर्तमान में रखरखाव में है। हमारी टीम सर्वोत्तम अनुभव प्रदान करने के लिए काम कर रही है।",apo:"असुविधा के लिए हम क्षमा चाहते हैं।",rl:"कारण:",cl:"अनुमानित समाप्ति",d:"दिन",h:"घंटे",m:"मिनट",s:"सेकंड",est:"अनुमानित समय — पहले या बाद में समाप्त हो सकता है",wip:"कार्य प्रगति पर है..."}
};
var LKEYS=Object.keys(LANGS);
var REASON_MAP=${JSON.stringify(safeReasonMap)};
var END=${hasEnd ? `"${estimatedEnd}"` : 'null'};
var ddOpen=false;
var lang=localStorage.getItem('optwin-lang')||navigator.language.slice(0,2)||'en';
if(!LANGS[lang])lang='en';
function buildDD(){
var dd=document.getElementById('ld');dd.innerHTML='';
LKEYS.forEach(function(c){
var b=document.createElement('button');
b.className=c===lang?'active':'';
b.innerHTML=LANGS[c].flag+' '+LANGS[c].label;
b.onclick=function(e){e.stopPropagation();switchLang(c);};
dd.appendChild(b);
});
}
function toggleDD(){ddOpen=!ddOpen;var dd=document.getElementById('ld');var lb=document.getElementById('lb');if(ddOpen){dd.classList.add('open');lb.classList.add('open');}else{dd.classList.remove('open');lb.classList.remove('open');}}
document.addEventListener('click',function(e){if(ddOpen&&!document.querySelector('.lang').contains(e.target)){ddOpen=false;document.getElementById('ld').classList.remove('open');document.getElementById('lb').classList.remove('open');}});
function switchLang(l){lang=l;localStorage.setItem('optwin-lang',l);ddOpen=false;document.getElementById('ld').classList.remove('open');document.getElementById('lb').classList.remove('open');render();}
function render(){
var t=LANGS[lang]||LANGS.en;
document.getElementById('msg').textContent=t.msg;
document.getElementById('apo').textContent=t.apo;
document.getElementById('wip').textContent=t.wip;
document.getElementById('lf').textContent=t.flag;
document.getElementById('ll').textContent=t.label;
var rl=document.getElementById('rl');if(rl)rl.textContent=t.rl;
var rt=document.getElementById('reasonText');if(rt){var rTxt=REASON_MAP[lang]||REASON_MAP.en||REASON_MAP.tr||'';rt.textContent=rTxt;var rDiv=rt.parentElement;if(rDiv)rDiv.style.display=rTxt?'':'none';}
var cl=document.getElementById('cl');if(cl)cl.textContent=t.cl;
var du=document.getElementById('du');if(du)du.textContent=t.d;
var hu=document.getElementById('hu');if(hu)hu.textContent=t.h;
var mu=document.getElementById('mu');if(mu)mu.textContent=t.m;
var su=document.getElementById('su');if(su)su.textContent=t.s;
var es=document.getElementById('es');if(es)es.textContent=t.est;
buildDD();
updateCountdown();
updateClock();
}
function updateClock(){
var off=UTC_OFFSET[lang]||0;
var utcNow=Date.now();
var local=new Date(utcNow+off*3600000);
var hh=String(local.getUTCHours()).padStart(2,'0');
var mm=String(local.getUTCMinutes()).padStart(2,'0');
var ss=String(local.getUTCSeconds()).padStart(2,'0');
var sign=off>=0?'+':'';
var utcLabel='UTC'+sign+off;
document.getElementById('clock').textContent=hh+':'+mm+':'+ss+'  '+utcLabel;
}
function updateCountdown(){
if(!END)return;
var now=Date.now(),end=new Date(END).getTime(),diff=end-now;
if(diff<=0){var el=document.querySelector('.cd');if(el)el.style.display='none';return;}
var days=Math.floor(diff/86400000);diff%=86400000;
var hrs=Math.floor(diff/3600000);diff%=3600000;
var mins=Math.floor(diff/60000);diff%=60000;
var secs=Math.floor(diff/1000);
var de=document.getElementById('d');if(de)de.textContent=days;
var he=document.getElementById('h');if(he)he.textContent=hrs;
var me=document.getElementById('m');if(me)me.textContent=mins;
var se=document.getElementById('s');if(se)se.textContent=secs;
var dte=document.getElementById('dt');
if(dte){try{var d=new Date(END);dte.textContent=d.toLocaleString(LOCALE_MAP[lang]||'en-GB',{dateStyle:'long',timeStyle:'short'});}catch(e){dte.textContent=new Date(END).toLocaleString();}}
}
render();
setInterval(function(){updateCountdown();updateClock();},1000);
setInterval(function(){
fetch('/api/maintenance').then(function(r){return r.json()}).then(function(d){
if(!d.maintenance)window.location.reload();
}).catch(function(){});
},15000);
</script>
</body>
</html>`;
}
