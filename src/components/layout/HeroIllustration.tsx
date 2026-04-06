export function HeroIllustration() {
    return (
        <div className="relative w-full max-w-md aspect-4/3 perspective-1000">
            {/* Background glow behind terminal */}
            <div className="absolute inset-0 bg-(--accent-color)/20 blur-3xl rounded-full scale-75 animate-pulse" style={{ animationDuration: '4s' }}></div>
            
            {/* Floating Terminal Window */}
            <div 
                className="absolute inset-0 bg-[#0d0d12]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                style={{
                    transform: 'rotateY(-5deg) rotateX(2deg)',
                    boxShadow: '-20px 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
                }}
            >
                {/* Terminal Header */}
                <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-3 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <div className="flex-1 text-center text-[10px] text-white/30 font-medium font-mono pl-4">Administrator: Windows PowerShell</div>
                </div>

                {/* Terminal Body */}
                <div className="flex-1 p-4 font-mono text-xs sm:text-sm flex flex-col gap-2 relative">
                    <div className="text-white/80">
                        <span className="text-green-400">PS C:\Windows\system32&gt;</span> .\OptWin.ps1
                    </div>
                    
                    <div className="text-white/60 mt-2">
                        <span className="text-blue-400">[INFO]</span> Initializing OptWin Framework v1.3...
                    </div>
                    
                    <div className="text-white/60">
                        <span className="text-yellow-400">[WATT]</span> Optimizing Windows Telemetry... <span className="text-green-400">DONE</span>
                    </div>

                    <div className="text-white/60">
                        <span className="text-yellow-400">[WATT]</span> Clearing Temp/Prefetch... <span className="text-green-400">DONE</span>
                    </div>

                    <div className="text-white/60">
                        <span className="text-yellow-400">[WATT]</span> Disabling Background Apps... <span className="text-green-400">DONE</span>
                    </div>

                    <div className="text-green-400 mt-2 flex items-center gap-2">
                        &gt; System successfully optimized.
                        <span className="w-2 h-4 bg-white/80 animate-pulse"></span>
                    </div>

                    {/* Decorative Code Lines */}
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none overflow-hidden">
                        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10L50 50L10 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M70 90H110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -right-6 top-12 bg-[#1a1a24] border border-(--accent-color)/30 p-3 rounded-xl shadow-lg shadow-(--accent-color)/20 flex items-center gap-3 animate-splash-float" style={{ animationDuration: '6s' }}>
                <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                    <div className="text-xs font-bold text-white">Safe</div>
                    <div className="text-[9px] text-white/50 uppercase tracking-widest">Open Source</div>
                </div>
            </div>

            <div className="absolute -left-6 bottom-16 bg-[#1a1a24] border border-(--accent-color)/30 p-3 rounded-xl shadow-lg shadow-(--accent-color)/20 flex items-center gap-3 animate-splash-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                 <div className="size-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                </div>
                <div>
                    <div className="text-xs font-bold text-white">Fast</div>
                    <div className="text-[9px] text-white/50 uppercase tracking-widest">Optimized</div>
                </div>
            </div>
        </div>
    );
}
