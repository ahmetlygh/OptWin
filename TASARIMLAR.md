<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Contact Page</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "#6b5be6",
                "background-light": "#f6f6f8",
                "background-dark": "#131121",
                "card-dark": "#1a1a24",
                "border-dark": "#2b2938",
                "input-bg": "#1d1c26",
                "input-border": "#3f3d52",
              },
              fontFamily: {
                "display": ["Inter", "sans-serif"]
              },
              borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
              backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6b5be6 0%, #8b7ef0 100%)',
                'gradient-dark': 'linear-gradient(180deg, rgba(19, 17, 33, 0.8) 0%, rgba(19, 17, 33, 1) 100%)',
              }
            },
          },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar for textarea */
        textarea::-webkit-scrollbar {
            width: 8px;
        }
        textarea::-webkit-scrollbar-track {
            background: #1d1c26; 
        }
        textarea::-webkit-scrollbar-thumb {
            background: #3f3d52; 
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
            background: #6b5be6; 
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-white">
<!-- Header -->
<header class="sticky top-0 z-50 w-full border-b border-solid border-border-dark bg-[#131121]/80 backdrop-blur-md">
<div class="px-4 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
<div class="flex items-center gap-3 text-white">
<div class="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
<span class="material-symbols-outlined text-2xl">speed</span>
</div>
<h2 class="text-white text-xl font-bold leading-tight tracking-tight">OptWin</h2>
</div>
<nav class="hidden md:flex items-center gap-8">
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Home</a>
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Features</a>
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Pricing</a>
<a class="text-white text-sm font-medium transition-colors" href="#">Contact</a>
</nav>
<div class="flex items-center gap-4">
<button class="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                    Download Now
                </button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow flex flex-col items-center justify-center p-4 md:p-8 lg:py-16 relative overflow-hidden">
<!-- Abstract Background Decoration -->
<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none"></div>
<div class="w-full max-w-[600px] relative z-10">
<!-- Card Container -->
<div class="bg-card-dark border border-border-dark rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-sm">
<div class="text-center mb-8">
<div class="size-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
<span class="material-symbols-outlined text-3xl text-primary">mail</span>
</div>
<h1 class="text-3xl font-bold text-white mb-2">Contact Us</h1>
<p class="text-slate-400">Have questions about OptWin? We're here to help.</p>
</div>
<form class="flex flex-col gap-5">
<!-- Name & Email Row -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Name</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">person</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="John Doe" type="text"/>
</div>
</label>
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Email</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">email</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="john@example.com" type="email"/>
</div>
</label>
</div>
<!-- Subject Field -->
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Subject</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">chat_bubble</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="What is this regarding?" type="text"/>
</div>
</label>
<!-- Message Field -->
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Message</span>
<div class="relative group">
<textarea class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder="Tell us more about your inquiry..." rows="5"></textarea>
</div>
</label>
<!-- Submit Button -->
<button class="mt-4 w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group" type="button">
<span>Send Message</span>
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
</button>
</form>
<!-- Alternative Contact Info -->
<div class="mt-8 pt-6 border-t border-border-dark flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
<div class="flex items-center gap-3">
<div class="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
<span class="material-symbols-outlined text-sm">support_agent</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Support Email</span>
<a class="text-sm font-medium text-white hover:text-primary transition-colors" href="mailto:support@optwin.com">support@optwin.com</a>
</div>
</div>
<div class="flex items-center gap-4">
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
</a>
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
</a>
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
</a>
</div>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="w-full border-t border-solid border-border-dark bg-[#131121] py-10 mt-auto">
<div class="px-4 md:px-10 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
<div class="flex flex-col gap-4">
<div class="flex items-center gap-2 text-white">
<span class="material-symbols-outlined text-primary">speed</span>
<h3 class="text-lg font-bold">OptWin</h3>
</div>
<p class="text-slate-400 text-sm">Maximize your gaming performance with the ultimate optimization suite.</p>
<div class="text-sm text-slate-500">© 2024 OptWin Inc.</div>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Product</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Download</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Features</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Pricing</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Changelog</a>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Company</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">About Us</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Careers</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Privacy Policy</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Terms of Service</a>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Community</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Discord Server</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Reddit</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Twitter</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Blog</a>
</div>
</div>
</footer>
</body></html>


<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Contact Page</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "#6b5be6",
                "background-light": "#f6f6f8",
                "background-dark": "#131121",
                "card-dark": "#1a1a24",
                "border-dark": "#2b2938",
                "input-bg": "#1d1c26",
                "input-border": "#3f3d52",
              },
              fontFamily: {
                "display": ["Inter", "sans-serif"]
              },
              borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
              backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6b5be6 0%, #8b7ef0 100%)',
                'gradient-dark': 'linear-gradient(180deg, rgba(19, 17, 33, 0.8) 0%, rgba(19, 17, 33, 1) 100%)',
              }
            },
          },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar for textarea */
        textarea::-webkit-scrollbar {
            width: 8px;
        }
        textarea::-webkit-scrollbar-track {
            background: #1d1c26; 
        }
        textarea::-webkit-scrollbar-thumb {
            background: #3f3d52; 
            border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
            background: #6b5be6; 
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-white">
<!-- Header -->
<header class="sticky top-0 z-50 w-full border-b border-solid border-border-dark bg-[#131121]/80 backdrop-blur-md">
<div class="px-4 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
<div class="flex items-center gap-3 text-white">
<div class="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
<span class="material-symbols-outlined text-2xl">speed</span>
</div>
<h2 class="text-white text-xl font-bold leading-tight tracking-tight">OptWin</h2>
</div>
<nav class="hidden md:flex items-center gap-8">
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Home</a>
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Features</a>
<a class="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Pricing</a>
<a class="text-white text-sm font-medium transition-colors" href="#">Contact</a>
</nav>
<div class="flex items-center gap-4">
<button class="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                    Download Now
                </button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow flex flex-col items-center justify-center p-4 md:p-8 lg:py-16 relative overflow-hidden">
<!-- Abstract Background Decoration -->
<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none"></div>
<div class="w-full max-w-[600px] relative z-10">
<!-- Card Container -->
<div class="bg-card-dark border border-border-dark rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-sm">
<div class="text-center mb-8">
<div class="size-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
<span class="material-symbols-outlined text-3xl text-primary">mail</span>
</div>
<h1 class="text-3xl font-bold text-white mb-2">Contact Us</h1>
<p class="text-slate-400">Have questions about OptWin? We're here to help.</p>
</div>
<form class="flex flex-col gap-5">
<!-- Name & Email Row -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Name</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">person</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="John Doe" type="text"/>
</div>
</label>
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Email</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">email</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="john@example.com" type="email"/>
</div>
</label>
</div>
<!-- Subject Field -->
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Subject</span>
<div class="relative group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-[20px]">chat_bubble</span>
<input class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" placeholder="What is this regarding?" type="text"/>
</div>
</label>
<!-- Message Field -->
<label class="flex flex-col gap-2">
<span class="text-sm font-semibold text-slate-300">Message</span>
<div class="relative group">
<textarea class="w-full bg-input-bg border-2 border-input-border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder="Tell us more about your inquiry..." rows="5"></textarea>
</div>
</label>
<!-- Submit Button -->
<button class="mt-4 w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group" type="button">
<span>Send Message</span>
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
</button>
</form>
<!-- Alternative Contact Info -->
<div class="mt-8 pt-6 border-t border-border-dark flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
<div class="flex items-center gap-3">
<div class="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
<span class="material-symbols-outlined text-sm">support_agent</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-slate-400 font-medium uppercase tracking-wider">Support Email</span>
<a class="text-sm font-medium text-white hover:text-primary transition-colors" href="mailto:support@optwin.com">support@optwin.com</a>
</div>
</div>
<div class="flex items-center gap-4">
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
</a>
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
</a>
<a class="size-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-4 h-4 fill-current" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
</a>
</div>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="w-full border-t border-solid border-border-dark bg-[#131121] py-10 mt-auto">
<div class="px-4 md:px-10 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
<div class="flex flex-col gap-4">
<div class="flex items-center gap-2 text-white">
<span class="material-symbols-outlined text-primary">speed</span>
<h3 class="text-lg font-bold">OptWin</h3>
</div>
<p class="text-slate-400 text-sm">Maximize your gaming performance with the ultimate optimization suite.</p>
<div class="text-sm text-slate-500">© 2024 OptWin Inc.</div>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Product</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Download</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Features</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Pricing</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Changelog</a>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Company</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">About Us</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Careers</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Privacy Policy</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Terms of Service</a>
</div>
<div class="flex flex-col gap-2">
<h4 class="text-white font-semibold text-sm mb-2">Community</h4>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Discord Server</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Reddit</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Twitter</a>
<a class="text-slate-400 hover:text-white text-sm transition-colors" href="#">Blog</a>
</div>
</div>
</footer>
</body></html>

<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Admin Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#6b5be6",
                        "background-light": "#f6f6f8",
                        "background-dark": "#131121",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display overflow-hidden relative selection:bg-primary selection:text-white">
<!-- Background Elements for Ambience -->
<div class="absolute inset-0 overflow-hidden pointer-events-none">
<div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-40"></div>
<div class="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] opacity-30"></div>
</div>
<div class="relative w-full max-w-md p-6 z-10">
<!-- Logo Header -->
<div class="flex flex-col items-center justify-center mb-8">
<div class="flex items-center gap-3 mb-2">
<div class="size-10 text-primary">
<svg class="w-full h-full" fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_6_543)">
<path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
<path clip-rule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fill-rule="evenodd"></path>
</g>
<defs>
<clippath id="clip0_6_543"><rect fill="white" height="48" width="48"></rect></clippath>
</defs>
</svg>
</div>
<h2 class="text-slate-100 text-2xl font-bold tracking-tight">OptWin</h2>
</div>
<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent pb-1">
                Admin Panel
            </h1>
<p class="mt-2 text-slate-400 text-sm text-center">Sign in to manage optimization configurations</p>
</div>
<!-- Login Card -->
<div class="bg-[#1e1c29]/50 dark:bg-[#1e1c29]/50 backdrop-blur-xl border border-white/5 dark:border-white/5 rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
<div class="space-y-4">
<button class="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-white hover:bg-slate-100 transition-colors h-12 px-5 text-slate-900 shadow-md">
<div class="h-5 w-5">
<svg fill="currentColor" viewbox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
<path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
</svg>
</div>
<span class="text-base font-bold leading-normal">Sign in with Google</span>
</button>
<div class="relative flex py-2 items-center">
<div class="flex-grow border-t border-white/10"></div>
<span class="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-medium tracking-wider">Restricted Access</span>
<div class="flex-grow border-t border-white/10"></div>
</div>
<div class="bg-primary/5 border border-primary/10 rounded-lg p-4 flex gap-3 items-start">
<span class="material-symbols-outlined text-primary text-xl">
                        lock
                    </span>
<div class="flex flex-col gap-1">
<p class="text-slate-200 text-sm font-medium">Authorized Personnel Only</p>
<p class="text-slate-400 text-xs leading-relaxed">
                            Access to the admin dashboard is restricted. Unauthorized access attempts are logged and monitored.
                        </p>
</div>
</div>
</div>
<!-- Footer Meta -->
<div class="flex flex-col items-center gap-2 mt-2">
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
<p class="text-slate-500 text-xs font-mono">System Online</p>
</div>
<p class="text-slate-600 text-xs font-normal">v2.4.1 stable build</p>
</div>
</div>
<div class="mt-8 text-center">
<a class="text-slate-500 hover:text-primary transition-colors text-sm font-medium" href="#">Need help accessing your account?</a>
</div>
</div>
</body></html>

<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Admin Dashboard</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#6b5be6",
                        "primary-hover": "#5a4bd1",
                        "background-light": "#f6f6f8",
                        "background-dark": "#131121",
                        "surface-dark": "#1e1c2e",
                        "surface-light": "#ffffff",
                        "border-dark": "#2b2938",
                    },
                    fontFamily: {
                        display: ["Inter", "sans-serif"],
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased overflow-hidden">
<div class="flex h-screen w-full">
<!-- Sidebar -->
<aside class="w-64 flex-shrink-0 flex flex-col bg-surface-dark border-r border-border-dark h-full transition-all duration-300">
<!-- Logo Area -->
<div class="h-16 flex items-center gap-3 px-6 border-b border-border-dark">
<div class="bg-primary/20 p-2 rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-xl">bolt</span>
</div>
<div class="flex flex-col">
<h1 class="text-white text-base font-bold leading-none">OptWin</h1>
<p class="text-slate-400 text-xs font-medium mt-1">Admin v2.4.0</p>
</div>
</div>
<!-- Navigation -->
<nav class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="text-sm font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">star</span>
<span class="text-sm font-medium">Features</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">category</span>
<span class="text-sm font-medium">Categories</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">translate</span>
<span class="text-sm font-medium">Translations</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group justify-between" href="#">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[20px]">chat_bubble</span>
<span class="text-sm font-medium">Messages</span>
</div>
<span class="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">12</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">monitoring</span>
<span class="text-sm font-medium">Stats</span>
</a>
<div class="my-4 border-t border-border-dark"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="text-sm font-medium">Settings</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">palette</span>
<span class="text-sm font-medium">Appearance</span>
</a>
</nav>
<!-- User/Logout -->
<div class="p-4 border-t border-border-dark">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group" href="#">
<span class="material-symbols-outlined text-[20px]">logout</span>
<span class="text-sm font-medium">Logout</span>
</a>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
<!-- Header -->
<header class="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-border-dark bg-surface-light dark:bg-background-dark">
<!-- Search -->
<div class="flex items-center w-full max-w-md">
<div class="relative w-full">
<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
<input class="w-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary text-sm placeholder-slate-400" placeholder="Search for scripts, users..." type="text"/>
</div>
</div>
<!-- Right Actions -->
<div class="flex items-center gap-4">
<button class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25">
<span class="material-symbols-outlined text-[18px]">add</span>
                        Create New
                    </button>
<button class="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-background-dark"></span>
</button>
<div class="h-8 w-8 rounded-full bg-cover bg-center border border-slate-200 dark:border-border-dark cursor-pointer" data-alt="Admin User Avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCaLrVln_sqhO4UiF4L0ljTellIrPsWYUyjHJeOts5A1cmleBWV6HAtoB0copMyIaA6soySFiIbNqou1oC5NugfZAKNeuRhTpRlcohv6_RK2xxRVxylx5w5b8a-Bv5tbHKGOVMNQM7i8UYL7KbxPgrgphqXLsArRY7BLpsnS72KEeMaLpLp4lyjWze_DWw6dwMccEZP2jm4lKbDA1upLWW-1YhnpUpsV536CMKk1i0eztayVR7EqbSCwEIxf7ulp2d0jwIkpfbe6Joh');"></div>
</div>
</header>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto p-8">
<div class="max-w-7xl mx-auto space-y-8">
<!-- Greeting -->
<div>
<h2 class="text-3xl font-bold text-slate-900 dark:text-white">Good morning, Admin</h2>
<p class="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with OptWin today.</p>
</div>
<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Card 1 -->
<div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-blue-500/10 rounded-lg text-blue-500">
<span class="material-symbols-outlined">visibility</span>
</div>
<span class="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
<span class="material-symbols-outlined text-[14px] mr-1">trending_up</span> 12%
                                </span>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Visits</p>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-1">124,592</h3>
<p class="text-xs text-slate-400 mt-2">Vs last week</p>
</div>
<!-- Card 2 -->
<div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-primary/10 rounded-lg text-primary">
<span class="material-symbols-outlined">terminal</span>
</div>
<span class="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
<span class="material-symbols-outlined text-[14px] mr-1">trending_up</span> 2%
                                </span>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Scripts</p>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-1">48</h3>
<p class="text-xs text-slate-400 mt-2">Vs last week</p>
</div>
<!-- Card 3 -->
<div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-orange-500/10 rounded-lg text-orange-500">
<span class="material-symbols-outlined">mail</span>
</div>
<span class="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
<span class="material-symbols-outlined text-[14px] mr-1">add</span> 5
                                </span>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm font-medium">New Messages</p>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</h3>
<p class="text-xs text-slate-400 mt-2">New today</p>
</div>
<!-- Card 4 -->
<div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors group">
<div class="flex justify-between items-start mb-4">
<div class="p-2 bg-purple-500/10 rounded-lg text-purple-500">
<span class="material-symbols-outlined">toggle_on</span>
</div>
<span class="flex items-center text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-1 rounded-full">
                                    0%
                                </span>
</div>
<p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Features Enabled</p>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-1">156</h3>
<p class="text-xs text-slate-400 mt-2">No change</p>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<!-- Recent Activity -->
<div class="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
<div class="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
<button class="text-primary text-sm font-medium hover:text-primary-hover">View All</button>
</div>
<div class="p-6">
<ul class="relative border-l border-slate-200 dark:border-border-dark ml-3 space-y-6">
<li class="ml-6">
<span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full -left-3 ring-4 ring-white dark:ring-surface-dark">
<span class="material-symbols-outlined text-blue-500 text-[14px]">person</span>
</span>
<div class="flex justify-between items-start">
<div>
<h4 class="text-sm font-semibold text-slate-900 dark:text-white">New user registration</h4>
<p class="text-sm text-slate-500 dark:text-slate-400">User "GamerPro99" joined the platform.</p>
</div>
<span class="text-xs text-slate-400">2 min ago</span>
</div>
</li>
<li class="ml-6">
<span class="absolute flex items-center justify-center w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full -left-3 ring-4 ring-white dark:ring-surface-dark">
<span class="material-symbols-outlined text-emerald-500 text-[14px]">update</span>
</span>
<div class="flex justify-between items-start">
<div>
<h4 class="text-sm font-semibold text-slate-900 dark:text-white">Script Update</h4>
<p class="text-sm text-slate-500 dark:text-slate-400">"Windows Debloater" v2.1 pushed to production.</p>
</div>
<span class="text-xs text-slate-400">1 hour ago</span>
</div>
</li>
<li class="ml-6">
<span class="absolute flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full -left-3 ring-4 ring-white dark:ring-surface-dark">
<span class="material-symbols-outlined text-red-500 text-[14px]">warning</span>
</span>
<div class="flex justify-between items-start">
<div>
<h4 class="text-sm font-semibold text-slate-900 dark:text-white">Error Report</h4>
<p class="text-sm text-slate-500 dark:text-slate-400">High latency detected in US-East region.</p>
</div>
<span class="text-xs text-slate-400">3 hours ago</span>
</div>
</li>
<li class="ml-6">
<span class="absolute flex items-center justify-center w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full -left-3 ring-4 ring-white dark:ring-surface-dark">
<span class="material-symbols-outlined text-purple-500 text-[14px]">settings</span>
</span>
<div class="flex justify-between items-start">
<div>
<h4 class="text-sm font-semibold text-slate-900 dark:text-white">System Config</h4>
<p class="text-sm text-slate-500 dark:text-slate-400">Global cache cleared by System.</p>
</div>
<span class="text-xs text-slate-400">5 hours ago</span>
</div>
</li>
</ul>
</div>
</div>
<!-- System Status -->
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark h-fit">
<div class="p-6 border-b border-slate-200 dark:border-border-dark">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">System Status</h3>
</div>
<div class="p-6 space-y-6">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">API Status</span>
</div>
<span class="text-sm text-emerald-500 font-medium">Operational</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Database</span>
</div>
<span class="text-sm text-emerald-500 font-medium">Operational</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">File Server</span>
</div>
<span class="text-sm text-yellow-500 font-medium">High Load</span>
</div>
<div class="pt-4 mt-4 border-t border-slate-200 dark:border-border-dark">
<div class="flex items-center justify-between mb-2">
<span class="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</span>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
</label>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400">Activate to prevent new user logins during updates.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>

    <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Admin - Features Management</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#6b5be6",
                        "background-light": "#f6f6f8",
                        "background-dark": "#131121",
                        "surface-dark": "#1d1c26",
                        "surface-darker": "#121117",
                        "border-dark": "#3f3d52",
                        "text-secondary": "#a19eb7"
                    },
                    fontFamily: {
                        display: ["Inter", "sans-serif"],
                        sans: ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #131121; 
        }
        ::-webkit-scrollbar-thumb {
            background: #3f3d52; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #6b5be6; 
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
<div class="relative flex h-screen w-full flex-row overflow-hidden">
<!-- Sidebar -->
<aside class="flex h-full w-72 flex-col bg-surface-darker border-r border-border-dark flex-shrink-0 transition-all duration-300">
<div class="flex h-full flex-col justify-between p-4">
<div class="flex flex-col gap-6">
<!-- Brand / User Profile -->
<div class="flex items-center gap-3 px-2">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border-2 border-primary shadow-lg shadow-primary/20" data-alt="User avatar profile picture" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_-tE5pyVs2_a7JEl26Ul8Zm4MjCP05okwzG0vQZcJ6l_5iAXRQi8U8QTZAKVaeGqukGzlLzgEAGZeZakmAfh8X12uVSCvd33y4swBgROaDavfMIhM5ZLDk7ZHmnUd1iEemcglY9EY0nK4YkMVvXIFc6IPt7yO9DdABD84nndFhtqhGCSWQLT5bajkJhrHH2n_xopwrzu-qxyDcCyLh-7f4sACpG6I0HKR1hXOJ9vaChgX7LOA8cJVx9BwYjcJbfwT_WE1TsTel6pg");'></div>
<div class="flex flex-col">
<h1 class="text-white text-base font-bold leading-tight">OptWin Admin</h1>
<p class="text-text-secondary text-xs font-medium">v2.4.0 • Enterprise</p>
</div>
</div>
<!-- Navigation Links -->
<nav class="flex flex-col gap-1">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors group" href="#">
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">dashboard</span>
<span class="text-sm font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-white border-l-4 border-primary transition-all" href="#">
<span class="material-symbols-outlined text-primary">extension</span>
<span class="text-sm font-medium">Features</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors group" href="#">
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">group</span>
<span class="text-sm font-medium">Users</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors group" href="#">
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">settings</span>
<span class="text-sm font-medium">Settings</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors group" href="#">
<span class="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">history</span>
<span class="text-sm font-medium">Logs</span>
</a>
</nav>
</div>
<!-- Bottom Action -->
<button class="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-surface-dark text-text-secondary hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all border border-border-dark hover:border-red-500/20">
<span class="material-symbols-outlined text-[20px]">logout</span>
<span class="text-sm font-bold">Logout</span>
</button>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 flex flex-col h-full bg-background-dark overflow-hidden relative">
<!-- Decorative gradient blur -->
<div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
<!-- Header Area -->
<header class="w-full px-8 py-6 flex flex-col gap-6 z-10">
<div class="flex flex-wrap justify-between items-end gap-4">
<div class="flex flex-col gap-1">
<h2 class="text-white text-3xl font-black tracking-tight">Features Management</h2>
<p class="text-text-secondary text-base">Manage optimization modules and system tweaks available to users.</p>
</div>
<button class="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all transform active:scale-95">
<span class="material-symbols-outlined text-[20px]">add</span>
<span>Add Feature</span>
</button>
</div>
<!-- Filters & Search Toolbar -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-surface-darker p-4 rounded-xl border border-border-dark/50">
<!-- Search -->
<div class="md:col-span-5 lg:col-span-6">
<label class="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Search</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">search</span>
</div>
<input class="block w-full pl-10 pr-3 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Search by feature name, ID or tags..." type="text"/>
</div>
</div>
<!-- Category Filter -->
<div class="md:col-span-3 lg:col-span-3">
<label class="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Category</label>
<div class="relative">
<select class="block w-full pl-3 pr-10 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer transition-all">
<option value="">All Categories</option>
<option value="system">System</option>
<option value="network">Network</option>
<option value="privacy">Privacy</option>
<option value="gaming">Gaming</option>
</select>
<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
<span class="material-symbols-outlined text-text-secondary text-[20px]">expand_more</span>
</div>
</div>
</div>
<!-- Risk Level Filter -->
<div class="md:col-span-4 lg:col-span-3">
<label class="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Risk Level</label>
<div class="relative">
<select class="block w-full pl-3 pr-10 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer transition-all">
<option value="">All Levels</option>
<option value="safe">Safe (Green)</option>
<option value="moderate">Moderate (Yellow)</option>
<option value="advanced">Advanced (Red)</option>
</select>
<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
<span class="material-symbols-outlined text-text-secondary text-[20px]">expand_more</span>
</div>
</div>
</div>
</div>
</header>
<!-- Table Content -->
<div class="flex-1 overflow-y-auto px-8 pb-8 z-0">
<div class="rounded-xl border border-border-dark bg-surface-darker overflow-hidden shadow-xl">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-dark border-b border-border-dark text-xs uppercase tracking-wider text-text-secondary font-semibold">
<th class="px-6 py-4 w-1/3">Feature Name</th>
<th class="px-6 py-4">Category</th>
<th class="px-6 py-4">Risk Level</th>
<th class="px-6 py-4 text-center">Status</th>
<th class="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-border-dark">
<!-- Row 1 -->
<tr class="hover:bg-surface-dark/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
<span class="material-symbols-outlined">speed</span>
</div>
<div>
<h3 class="text-white text-sm font-semibold">Windows Debloater</h3>
<p class="text-text-secondary text-xs">Removes pre-installed bloatware</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-dark border border-border-dark text-white">
                                        System
                                    </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        Safe
                                    </span>
</td>
<td class="px-6 py-4 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-border-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors" title="Edit">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-dark/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
<span class="material-symbols-outlined">cleaning_services</span>
</div>
<div>
<h3 class="text-white text-sm font-semibold">Registry Cleaner</h3>
<p class="text-text-secondary text-xs">Cleans invalid registry keys</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-dark border border-border-dark text-white">
                                        Cleanup
                                    </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                        Moderate
                                    </span>
</td>
<td class="px-6 py-4 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-border-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors" title="Edit">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-dark/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
<span class="material-symbols-outlined">security</span>
</div>
<div>
<h3 class="text-white text-sm font-semibold">Telemetry Blocker</h3>
<p class="text-text-secondary text-xs">Prevents data collection services</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-dark border border-border-dark text-white">
                                        Privacy
                                    </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        Safe
                                    </span>
</td>
<td class="px-6 py-4 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-border-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors" title="Edit">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-surface-dark/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
<span class="material-symbols-outlined">memory</span>
</div>
<div>
<h3 class="text-white text-sm font-semibold">Service Optimizer</h3>
<p class="text-text-secondary text-xs">Disables unnecessary background services</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-dark border border-border-dark text-white">
                                        Performance
                                    </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                        Advanced
                                    </span>
</td>
<td class="px-6 py-4 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-border-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors" title="Edit">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
<!-- Row 5 -->
<tr class="hover:bg-surface-dark/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-4">
<div class="h-10 w-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
<span class="material-symbols-outlined">network_check</span>
</div>
<div>
<h3 class="text-white text-sm font-semibold">TCP/IP Optimization</h3>
<p class="text-text-secondary text-xs">Tunes network stack for low latency</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-dark border border-border-dark text-white">
                                        Network
                                    </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
<span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                        Moderate
                                    </span>
</td>
<td class="px-6 py-4 text-center">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-border-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors" title="Edit">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination -->
<div class="flex items-center justify-between mt-4 px-2">
<p class="text-sm text-text-secondary">Showing <span class="text-white font-medium">1</span> to <span class="text-white font-medium">5</span> of <span class="text-white font-medium">12</span> features</p>
<div class="flex gap-2">
<button class="px-3 py-1.5 rounded-lg border border-border-dark bg-surface-dark text-text-secondary text-sm disabled:opacity-50 hover:bg-surface-darker transition-colors" disabled="">Previous</button>
<button class="px-3 py-1.5 rounded-lg border border-border-dark bg-surface-dark text-white text-sm hover:bg-surface-darker transition-colors">Next</button>
</div>
</div>
</div>
</main>
</div>
</body></html>

    <!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>OptWin Script Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#6b5be6",
                        "background-light": "#f6f6f8",
                        "background-dark": "#131121",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
                },
            },
        }
    </script>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
<!-- Modal Backdrop / Wrapper -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-background-dark/80">
<!-- Modal Container -->
<div class="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#1a1828] shadow-2xl border border-slate-200 dark:border-slate-800">
<!-- Header Section -->
<div class="shrink-0 border-b border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-[#1a1828]">
<div class="flex flex-wrap items-start justify-between gap-4">
<div class="flex flex-col gap-1">
<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Script Preview</h2>
<p class="text-sm text-slate-500 dark:text-[#a19eb7]">Review your optimization script before downloading.</p>
</div>
<!-- Status Badges -->
<div class="flex flex-wrap gap-2">
<div class="flex items-center gap-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 border border-emerald-500/20">
<span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">check_circle</span>
<span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">Status: Ready</span>
</div>
<div class="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 border border-primary/20">
<span class="material-symbols-outlined text-primary text-[20px]">desktop_windows</span>
<span class="text-sm font-medium text-primary">Target: Windows 11</span>
</div>
</div>
</div>
</div>
<!-- Scrollable Content Area -->
<div class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
<!-- Code Block Area -->
<div class="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner group">
<div class="absolute right-4 top-4 z-10 opacity-100 transition-opacity">
<button class="flex items-center gap-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors border border-slate-700">
<span class="material-symbols-outlined text-[16px]">content_copy</span>
                            Copy Code
                        </button>
</div>
<!-- Code Content -->
<div class="p-6 font-mono text-sm leading-relaxed text-slate-300 overflow-x-auto">
<div class="flex gap-4">
<div class="flex flex-col select-none text-right text-slate-600 dark:text-slate-600 border-r border-slate-700 pr-4">
<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
</div>
<div class="whitespace-pre">
<span class="text-slate-500"># OptWin Generated Optimization Script</span>
<span class="text-slate-500"># Created: 2023-10-27</span>
<span class="text-purple-400">Write-Host</span> <span class="text-green-400">'Starting Optimization...'</span>
<span class="text-slate-500"># Telemetry Disabling</span>
<span class="text-blue-400">Disable-WindowsTelemetry</span>
<span class="text-purple-400">Set-Service</span> <span class="text-green-400">'DiagTrack'</span> <span class="text-blue-400">-StartupType</span> Disabled

<span class="text-slate-500"># Debloating</span>
<span class="text-purple-400">Remove-AppxPackage</span> <span class="text-blue-400">-AllUsers</span> *Microsoft.XboxGamingOverlay*
<span class="text-purple-400">Remove-AppxPackage</span> <span class="text-blue-400">-AllUsers</span> *Microsoft.YourPhone*

<span class="text-purple-400">Write-Host</span> <span class="text-green-400">'Optimization Complete!'</span> <span class="text-blue-400">-ForegroundColor</span> Green</div>
</div>
</div>
</div>
<!-- Instructions Section -->
<div class="mt-8">
<h3 class="mb-4 text-lg font-bold text-slate-900 dark:text-white">Instructions</h3>
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
<!-- Step 1 -->
<div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#201d2e] p-4">
<div class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">1</div>
<h4 class="mb-1 font-semibold text-slate-900 dark:text-white">Download Script</h4>
<p class="text-sm text-slate-500 dark:text-[#a19eb7]">Save the generated .ps1 file to a location you can easily access.</p>
</div>
<!-- Step 2 -->
<div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#201d2e] p-4">
<div class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">2</div>
<h4 class="mb-1 font-semibold text-slate-900 dark:text-white">Run PowerShell</h4>
<p class="text-sm text-slate-500 dark:text-[#a19eb7]">Right-click the Start button and select "Windows Terminal (Admin)".</p>
</div>
<!-- Step 3 -->
<div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#201d2e] p-4">
<div class="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">3</div>
<h4 class="mb-1 font-semibold text-slate-900 dark:text-white">Execute</h4>
<p class="text-sm text-slate-500 dark:text-[#a19eb7]">Drag the file into the window or type the path to execute.</p>
</div>
</div>
<div class="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400 border border-amber-500/20">
<span class="material-symbols-outlined text-[20px]">warning</span>
<span class="font-medium">Note:</span> A system restore point is recommended before running any script.
                    </div>
</div>
</div>
<!-- Footer Action Row -->
<div class="shrink-0 border-t border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-[#1a1828]">
<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
<button class="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-8 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors">
                        Close
                    </button>
<button class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a1828] transition-all">
<span class="material-symbols-outlined text-[20px]">download</span>
                        Download Script
                    </button>
</div>
</div>
</div>
</div>
</body></html>

