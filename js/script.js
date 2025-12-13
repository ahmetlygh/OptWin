/**
 * OptWin Main Controller
 * Ana uygulama kontrolü - UI, Events, Script Generation
 * Dependencies: config.js, features.js
 */

// ===== STATE =====
let currentLang = localStorage.getItem('selectedLang') || CONFIG.defaultLang;
let currentTheme = localStorage.getItem('theme') || CONFIG.defaultTheme;
let selectedFeatures = new Set();
let selectedDnsProvider = 'cloudflare';
let currentBatFilename = '';
let currentBatContent = '';
let searchQuery = '';

// ===== STATISTICS SYSTEM =====
let globalStats = { totalVisits: 0, totalScripts: 0 };

async function initStats() {
    try {
        const response = await fetch(`${CONFIG.statsApi}?action=visit`);
        const data = await response.json();
        if (data.success) {
            globalStats.totalVisits = data.totalVisits;
            globalStats.totalScripts = data.totalScripts;
            updateStatsDisplay();
        }
    } catch (error) {
        console.log('Stats API not available, using cached data');
    }
    return globalStats;
}

async function recordScriptGeneration() {
    try {
        const response = await fetch(`${CONFIG.statsApi}?action=script`);
        const data = await response.json();
        if (data.success) {
            globalStats.totalVisits = data.totalVisits;
            globalStats.totalScripts = data.totalScripts;
            updateStatsDisplay();
        }
    } catch (error) {
        console.log('Stats API not available');
    }
}

function getStats() {
    return globalStats;
}

// ===== DOM ELEMENTS =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
const langOpts = document.querySelectorAll('.lang-opt');
const featuresContainer = document.getElementById('features-container');
const generateBtn = document.getElementById('generate-btn');
const dnsSettingsPanel = document.getElementById('dns-settings-panel');
const pingTestBtn = document.getElementById('ping-test-btn');

const btnRecommended = document.getElementById('btn-recommended');
const btnSelectAll = document.getElementById('btn-select-all');
const btnReset = document.getElementById('btn-reset');
const btnGamerMode = document.getElementById('btn-gamer-mode');

const restoreModal = document.getElementById('restore-modal');
const modalYesBtn = document.getElementById('modal-yes');
const modalNoBtn = document.getElementById('modal-no');
const modalCloseBtn = document.getElementById('modal-close');

const warningModal = document.getElementById('warning-modal');
const warningCloseBtn = document.getElementById('warning-close');
const warningMsg = document.getElementById('warning-msg');

const searchInput = document.getElementById('search-input');
const selectedCountEl = document.getElementById('selected-count');

// ===== INITIALIZATION =====
function init() {
    const savedLang = localStorage.getItem('selectedLang') || CONFIG.defaultLang;
    currentLang = savedLang;

    if (langOpts.length) {
        langOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === savedLang));
    }

    initStats();
    applyTheme(currentTheme);
    renderFeatures();
    updateTexts();
    updateSelectedCount();

    // Event Listeners
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (langOpts.length) langOpts.forEach(opt => opt.addEventListener('click', () => setLang(opt.dataset.lang)));
    if (generateBtn) generateBtn.addEventListener('click', initiateGeneration);
    if (pingTestBtn) pingTestBtn.addEventListener('click', generatePingTest);

    // Preset Listeners
    if (btnRecommended) btnRecommended.addEventListener('click', () => applyPreset('recommended'));
    if (btnSelectAll) btnSelectAll.addEventListener('click', () => applyPreset('all'));
    if (btnReset) btnReset.addEventListener('click', () => applyPreset('reset'));
    if (btnGamerMode) btnGamerMode.addEventListener('click', () => applyPreset('gamer'));

    // Search Listener
    const searchClearBtn = document.getElementById('search-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterFeatures();
            // Toggle clear button visibility
            if (searchClearBtn) {
                searchClearBtn.classList.toggle('visible', e.target.value.length > 0);
            }
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                filterFeatures();
                searchClearBtn.classList.remove('visible');
                searchInput.focus();
            }
        });
    }

    // Modal Listeners
    if (modalYesBtn) modalYesBtn.addEventListener('click', () => { closeModal(); finalizeGeneration(true); });
    if (modalNoBtn) modalNoBtn.addEventListener('click', () => { closeModal(); finalizeGeneration(false); });
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (warningCloseBtn) warningCloseBtn.addEventListener('click', closeWarning);

    // Close modals on click outside or Escape
    window.addEventListener('click', (e) => {
        if (e.target === restoreModal) closeModal();
        if (e.target === warningModal) closeWarning();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeWarning();
            closeMobileNav();
        }
    });

    // DNS Radio Listeners
    document.querySelectorAll('input[name="dns-provider"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                selectedDnsProvider = val;
                selectedFeatures.add('changeDNS');
                const card = document.querySelector('.feature-card[data-fid="changeDNS"]');
                if (card) card.classList.add('selected');
                updateSelectedCount();
            }
        });
    });

    const defaultRadio = document.querySelector('input[value="cloudflare"]');
    if (defaultRadio) defaultRadio.checked = true;

    // ===== LAZY LOADING OBSERVER =====
    initLazyLoading();

    // ===== HAMBURGER MENU =====
    initMobileNav();

    // ===== UPDATE BUTTON STATE =====
    updateGenerateButtonState();
}

// ===== MOBILE NAVIGATION =====
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const mobileLangOpts = document.querySelectorAll('.mobile-lang');
    const mobileCloseBtn = document.getElementById('mobile-nav-close');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileNav);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileNav);
    }

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileNav);
    }

    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            toggleTheme();
            // Sync mobile icon with desktop
            const icon = mobileThemeToggle.querySelector('i');
            if (icon) icon.className = currentTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        });
    }

    if (mobileLangOpts.length) {
        mobileLangOpts.forEach(opt => {
            opt.addEventListener('click', () => {
                setLang(opt.dataset.lang);
                // Sync mobile lang switch
                mobileLangOpts.forEach(o => o.classList.toggle('active', o.dataset.lang === opt.dataset.lang));
                closeMobileNav();
            });
        });
    }

    // Home link - smooth scroll to top
    const mobileHomeLink = document.getElementById('mobile-home-link');
    const mobileNavLogo = document.getElementById('mobile-nav-home-logo');

    if (mobileHomeLink) {
        mobileHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileNav();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (mobileNavLogo) {
        mobileNavLogo.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileNav();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Close nav on other link clicks
    document.querySelectorAll('.mobile-nav-link:not(#mobile-home-link)').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}

function toggleMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');

    hamburgerBtn?.classList.toggle('active');
    mobileNav?.classList.toggle('active');
    mobileOverlay?.classList.toggle('active');
    document.body.style.overflow = mobileNav?.classList.contains('active') ? 'hidden' : '';
}

function closeMobileNav() {
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');

    hamburgerBtn?.classList.remove('active');
    mobileNav?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== THEME LOGIC =====
function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

function toggleTheme() {
    if (!themeIcon) return;
    themeIcon.classList.add('spin-anim');
    setTimeout(() => themeIcon.classList.remove('spin-anim'), 600);
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ===== LANGUAGE LOGIC =====
function setLang(lang) {
    if (currentLang === lang) return;
    currentLang = lang;
    localStorage.setItem('selectedLang', lang);
    langOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === lang));
    updateTexts();
    renderFeatures();

    // Preserve search after language change
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        filterFeatures();
    }
}

function updateTexts() {
    const t = translations[currentLang];

    const safe = (id, val, html = false) => {
        const el = document.getElementById(id);
        if (el) html ? el.innerHTML = val : el.textContent = val;
    };

    const safeQ = (selector, val, html = false) => {
        const el = document.querySelector(selector);
        if (el) html ? el.innerHTML = val : el.textContent = val;
    };

    // Basic UI
    safe('app-title', t.title);
    safe('hero-title', t.heroTitle);
    safe('hero-desc', t.heroDesc);
    safe('btn-text', t.btnText);
    safe('contact-message-text', t.contactMessage);
    safe('footer-text', t.footerText);
    safe('github-text', t.github || 'GitHub');
    safe('home-text', t.homeText);
    safe('about-text', t.aboutText);

    // Search placeholder
    if (searchInput) searchInput.placeholder = t.searchPlaceholder || 'Search features...';

    // About Section
    if (t.aboutSection) {
        safe('about-title', t.aboutSection.title);
        safe('about-subtitle', t.aboutSection.subtitle);
        safe('mission-title', t.aboutSection.missionTitle);
        safe('mission-desc', t.aboutSection.missionDesc);
        safe('value-safe-title', t.aboutSection.valueSafeTitle);
        safe('value-safe-desc', t.aboutSection.valueSafeDesc);
        safe('value-open-title', t.aboutSection.valueOpenTitle);
        safe('value-open-desc', t.aboutSection.valueOpenDesc);
        safe('value-transparent-title', t.aboutSection.valueTransparentTitle);
        safe('value-transparent-desc', t.aboutSection.valueTransparentDesc);
    }

    // Support Section
    if (t.support) {
        safe('support-title', t.support.title);
        safe('support-desc', t.support.desc);
        safe('donate-btn-text', t.support.btnText);
        safe('support-note', t.support.note);
        safe('badge-free', t.support.badgeFree);
        safe('badge-opensource', t.support.badgeOpensource);
        safe('badge-secure', t.support.badgeSecure);
    }

    // DNS Panel
    safe('dns-title', t.dnsTitle);
    safe('ping-btn-text', t.pingBtn);

    // Modal
    safe('modal-title', t.restoreModal.title);
    safe('modal-desc', t.restoreModal.desc);
    safe('modal-yes', '<i class="fa-solid fa-check"></i> ' + t.restoreModal.yes, true);
    safe('modal-no', t.restoreModal.no);

    // Category Titles
    document.querySelectorAll('[data-cat-id]').forEach(el => {
        const catId = el.getAttribute('data-cat-id');
        if (t.categories[catId]) el.textContent = t.categories[catId];
    });

    // Warning
    if (warningMsg) warningMsg.textContent = t.warningModal.msg;

    // Presets
    safe('txt-recommended', t.presets.recommended);
    safe('txt-select-all', t.presets.selectAll);
    safe('txt-reset', t.presets.reset);
    safe('txt-gamer-mode', t.presets.gamerMode);

    // Overlay
    const overlay = t.overlay;
    safeQ('.overlay-header h2', overlay.title);
    safe('badge-run', overlay.badgeRun);
    safe('badge-ready', overlay.badgeReady);
    safe('btn-download', overlay.downloadBtn);
    safe('btn-close', overlay.closeBtn);

    const copyBtn = document.getElementById('copy-script-btn');
    if (copyBtn && !copyBtn.classList.contains('copied')) {
        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> ' + overlay.copyBtn;
    }

    safe('instr-title', '<i class="fa-solid fa-book"></i> ' + overlay.instrTitle, true);
    safe('step-1', overlay.step1, true);
    safe('step-2', overlay.step2, true);
    safe('step-3', overlay.step3, true);
    if (overlay.note) {
        safe('overlay-note', '<i class="fa-solid fa-info-circle"></i> ' + overlay.note, true);
    }

    // Mobile Menu Texts
    safe('mobile-home-text', t.homeText);
    safe('mobile-about-text', t.aboutText);
    safe('mobile-support-text', currentLang === 'tr' ? 'OptWin\'i Destekle' : 'Support OptWin');

    // Search placeholder
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
    }

    updateStatsDisplay();
    updateSelectedCount();
}

function updateStatsDisplay() {
    const stats = getStats();
    const labels = {
        'en': { 'visits': 'Site Visits', 'downloads': 'Scripts Downloaded' },
        'tr': { 'visits': 'Site Ziyaretleri', 'downloads': 'İndirilen Scriptler' }
    };
    const l = labels[currentLang] || labels['en'];

    const visitsEl = document.getElementById('stats-total-visits');
    if (visitsEl) visitsEl.textContent = stats.totalVisits;

    const downloadsEl = document.getElementById('stats-total-downloads');
    if (downloadsEl) downloadsEl.textContent = stats.totalScripts;

    const visitsLabelEl = document.getElementById('stats-visits-label');
    if (visitsLabelEl) visitsLabelEl.textContent = l.visits;

    const downloadsLabelEl = document.getElementById('stats-downloads-label');
    if (downloadsLabelEl) downloadsLabelEl.textContent = l.downloads;

    // Mobile stats
    const mobileVisits = document.getElementById('mobile-stats-visits');
    if (mobileVisits) mobileVisits.textContent = stats.totalVisits;

    const mobileDownloads = document.getElementById('mobile-stats-downloads');
    if (mobileDownloads) mobileDownloads.textContent = stats.totalScripts;
}

// ===== SELECTED COUNT =====
function updateSelectedCount() {
    if (!selectedCountEl) return;
    const count = selectedFeatures.size;
    const t = translations[currentLang];

    if (count === 0) {
        selectedCountEl.classList.remove('visible');
    } else {
        selectedCountEl.classList.add('visible');
        selectedCountEl.innerHTML = '<i class="fa-solid fa-check-circle"></i> <span>' + count + ' ' + t.selectedCount + '</span>';
    }

    // Update generate button state
    updateGenerateButtonState();
}

// ===== GENERATE BUTTON STATE =====
function updateGenerateButtonState() {
    if (!generateBtn) return;
    const count = selectedFeatures.size;
    const wasInactive = generateBtn.classList.contains('btn-inactive');

    if (count === 0) {
        generateBtn.classList.add('btn-inactive');
    } else {
        generateBtn.classList.remove('btn-inactive');
        // Add activation animation when button becomes active
        if (wasInactive) {
            generateBtn.classList.add('btn-activated');
            generateBtn.addEventListener('animationend', () => {
                generateBtn.classList.remove('btn-activated');
            }, { once: true });
        }
    }
}

// ===== LAZY LOADING & UNLOADING =====
function initLazyLoading() {
    const loadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;

            if (entry.isIntersecting) {
                // Load - card entering viewport
                card.classList.remove('lazy-unloaded');
                if (!card.classList.contains('lazy-loaded')) {
                    card.classList.add('lazy-loaded', 'lazy-reveal');
                    card.addEventListener('animationend', () => {
                        card.classList.remove('lazy-reveal');
                    }, { once: true });
                }
            } else {
                // Unload - card leaving viewport (performance boost)
                if (card.classList.contains('lazy-loaded')) {
                    card.classList.add('lazy-unloaded');
                }
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.05
    });

    // Observe all feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        loadObserver.observe(card);
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(message, duration = 4000) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (!toast) return;

    if (toastMsg && message) toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===== RENDER FEATURES =====
function renderFeatures() {
    if (!featuresContainer) return;
    featuresContainer.innerHTML = '';
    const tCats = translations[currentLang].categories;
    const tFeats = translations[currentLang].features;
    const tRisk = translations[currentLang].riskLevels;

    categorizedFeatures.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.setAttribute('data-category', cat.id);

        const title = document.createElement('h3');
        title.className = 'category-title';
        title.textContent = tCats[cat.id] || cat.id;
        title.setAttribute('data-cat-id', cat.id);
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'features-grid';

        cat.items.forEach(f => {
            const card = document.createElement('div');
            card.className = 'feature-card' + (selectedFeatures.has(f.id) ? ' selected' : '');
            card.onclick = () => toggleFeature(f.id, card);
            card.setAttribute('data-fid', f.id);
            card.setAttribute('data-risk', f.risk);

            const fTitle = tFeats[f.id] ? tFeats[f.id].title : f.id;
            const fDesc = tFeats[f.id] ? tFeats[f.id].desc : '';
            const iconClass = f.type === 'brands' ? 'fa-brands' : 'fa-solid';

            // Risk badge - hide for noRisk features
            let riskBadgeHtml = '';
            if (!f.noRisk) {
                const riskClass = 'risk-' + f.risk;
                const riskText = tRisk[f.risk] || f.risk;
                riskBadgeHtml = '<span class="risk-badge ' + riskClass + '">' + riskText + '</span>';
            }

            card.innerHTML = '<div class="feature-icon"><i class="' + iconClass + ' ' + f.icon + '"></i></div>' +
                '<div class="feature-info"><h3>' + fTitle + '</h3><p>' + fDesc + '</p>' + riskBadgeHtml + '</div>' +
                '<div class="checkbox-indicator"></div>';
            grid.appendChild(card);
        });

        section.appendChild(grid);
        featuresContainer.appendChild(section);
    });
}

function filterFeatures() {
    const cards = document.querySelectorAll('.feature-card');
    const tFeats = translations[currentLang].features;
    const t = translations[currentLang];
    let visibleCount = 0;

    cards.forEach(card => {
        const fid = card.getAttribute('data-fid');
        const feat = tFeats[fid];
        if (!feat) return;

        const title = feat.title.toLowerCase();
        const desc = feat.desc.toLowerCase();
        const matches = title.includes(searchQuery) || desc.includes(searchQuery) || fid.toLowerCase().includes(searchQuery);

        const wasHidden = card.style.display === 'none';
        const titleEl = card.querySelector('.feature-info h3');
        const descEl = card.querySelector('.feature-info p');

        if (matches) {
            card.style.display = '';

            // Highlight matched text
            if (searchQuery.length > 1 && titleEl && descEl) {
                titleEl.innerHTML = highlightText(feat.title, searchQuery);
                descEl.innerHTML = highlightText(feat.desc, searchQuery);
            } else if (titleEl && descEl) {
                // Reset to original text
                titleEl.textContent = feat.title;
                descEl.textContent = feat.desc;
            }

            // Animate "found" effect when card becomes visible (typing or deleting)
            if (wasHidden && searchQuery.length >= 0) {
                card.classList.remove('search-found'); // Reset animation
                void card.offsetWidth; // Force reflow
                card.classList.add('search-found');
                card.addEventListener('animationend', () => {
                    card.classList.remove('search-found');
                }, { once: true });
            }
            visibleCount++;
        } else {
            card.style.display = 'none';
            // Reset text when hidden
            if (titleEl) titleEl.textContent = feat.title;
            if (descEl) descEl.textContent = feat.desc;
        }
    });

    // Show/hide category sections based on visible cards
    document.querySelectorAll('.category-section').forEach(section => {
        const hasVisible = Array.from(section.querySelectorAll('.feature-card')).some(c => c.style.display !== 'none');
        section.style.display = hasVisible ? '' : 'none';
    });

    // Show/hide "no results" message
    let noResultsEl = document.getElementById('no-results-message');
    if (visibleCount === 0 && searchQuery.length > 0) {
        if (!noResultsEl && featuresContainer) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'no-results-message';
            noResultsEl.className = 'no-results';
            noResultsEl.innerHTML = '<i class="fa-solid fa-search"></i><p>' + t.noResults + '</p>';
            featuresContainer.appendChild(noResultsEl);
        }
        if (noResultsEl) noResultsEl.style.display = 'flex';
    } else {
        if (noResultsEl) noResultsEl.style.display = 'none';
    }
}

// Highlight text helper
function highlightText(text, query) {
    if (!query || query.length < 2) return text;
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function toggleFeature(id, card) {
    const isSelecting = !selectedFeatures.has(id);

    // Mutual Exclusion for Performance Modes
    if (id === 'highPerformance' && isSelecting) {
        if (selectedFeatures.has('ultimatePerformance')) {
            selectedFeatures.delete('ultimatePerformance');
            const ultCard = document.querySelector('.feature-card[data-fid="ultimatePerformance"]');
            if (ultCard) ultCard.classList.remove('selected');
        }
    }
    if (id === 'ultimatePerformance' && isSelecting) {
        if (selectedFeatures.has('highPerformance')) {
            selectedFeatures.delete('highPerformance');
            const highCard = document.querySelector('.feature-card[data-fid="highPerformance"]');
            if (highCard) highCard.classList.remove('selected');
        }
    }

    if (isSelecting) {
        selectedFeatures.add(id);
        card.classList.add('selected');
    } else {
        selectedFeatures.delete(id);
        card.classList.remove('selected');
    }

    if (id === 'changeDNS') toggleDnsPanel(selectedFeatures.has('changeDNS'));
    updateSelectedCount();
}

function toggleDnsPanel(show) {
    if (dnsSettingsPanel) {
        dnsSettingsPanel.classList.toggle('hidden', !show);
    }
}

// ===== PRESET LOGIC =====
function applyPreset(type) {
    const allCards = document.querySelectorAll('.feature-card');

    if (type === 'reset') {
        selectedFeatures.clear();
        allCards.forEach(c => c.classList.remove('selected'));
        toggleDnsPanel(false);
        updateSelectedCount();
        return;
    }

    if (type === 'recommended') {
        selectedFeatures.clear();
        recommendedFeatures.forEach(id => selectedFeatures.add(id));
    }

    if (type === 'gamer') {
        selectedFeatures.clear();
        gamerModeFeatures.forEach(id => selectedFeatures.add(id));
    }

    if (type === 'all') {
        if (selectedFeatures.has('highPerformance')) selectedFeatures.delete('highPerformance');
        categorizedFeatures.forEach(cat => {
            cat.items.forEach(item => {
                if (item.id === 'highPerformance') return;
                selectedFeatures.add(item.id);
            });
        });
        // Show warning toast for Select All
        const toastMsg = currentLang === 'tr'
            ? 'Tüm ayarlar sisteminizde istenmeyen değişiklikler yapabilir. Lütfen çalıştırmadan önce inceleyin.'
            : 'All settings may cause unwanted changes. Please review before running.';
        showToast(toastMsg);
    }

    allCards.forEach(c => {
        const fid = c.getAttribute('data-fid');
        c.classList.toggle('selected', selectedFeatures.has(fid));
    });

    toggleDnsPanel(selectedFeatures.has('changeDNS'));
    updateSelectedCount();
}

// ===== MODAL LOGIC =====
function initiateGeneration() {
    if (selectedFeatures.size === 0) {
        warningModal.classList.remove('hidden');
        if (warningMsg) warningMsg.textContent = translations[currentLang].warningModal.msg;
        return;
    }

    if (selectedFeatures.has('highPerformance') && selectedFeatures.has('ultimatePerformance')) {
        warningModal.classList.remove('hidden');
        if (warningMsg) warningMsg.textContent = translations[currentLang].warningModal.conflict;
        return;
    }

    if (selectedFeatures.has('changeDNS') && !selectedDnsProvider) {
        alert(currentLang === 'tr' ? 'Lütfen bir DNS sağlayıcısı seçin.' : 'Please select a DNS provider.');
        dnsSettingsPanel.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    restoreModal.classList.remove('hidden');
}

function closeModal() {
    if (restoreModal) restoreModal.classList.add('hidden');
}

function closeWarning() {
    if (warningModal) warningModal.classList.add('hidden');
}

// ===== SCRIPT GENERATION (PowerShell with Self-Elevation) =====
function finalizeGeneration(createRestorePoint) {
    recordScriptGeneration();

    const t = translations[currentLang].scriptMsgs;
    const sm = scriptMessages[currentLang];
    const isEn = currentLang === 'en';
    const dateStr = new Date().toLocaleString();

    // Bilingual labels
    const labels = isEn ? {
        scriptTitle: 'OptWin - Windows Optimization Script',
        version: 'Version',
        date: 'Date',
        developer: 'Developer',
        website: 'Website',
        openSource: 'This script is open source and free to use.',
        bannerTitle: 'Windows Optimization Script',
        openSourceShort: 'Open Source | Free to Use',
        adminRequest: '[INFO] Requesting Administrator privileges...',
        adminPrompt: 'Please click Yes on the UAC prompt.',
        adminError: '[ERROR] Could not elevate to Administrator.',
        adminHint: 'Please right-click the script and select Run with PowerShell',
        pressAnyKey: 'Press any key to exit...'
    } : {
        scriptTitle: 'OptWin - Windows Optimizasyon Scripti',
        version: 'Versiyon',
        date: 'Tarih',
        developer: 'Gelistirici',
        website: 'Website',
        openSource: 'Bu script acik kaynaklidir ve ucretsiz kullanilabilir.',
        bannerTitle: 'Windows Optimizasyon Scripti',
        openSourceShort: 'Acik Kaynak | Ucretsiz',
        adminRequest: '[BILGI] Yonetici izni isteniyor...',
        adminPrompt: 'Lutfen UAC penceresinde Evet i tiklayin.',
        adminError: '[HATA] Yonetici olarak calistirilamadi.',
        adminHint: 'Lutfen scripte sag tiklayin ve PowerShell ile Calistir secin',
        pressAnyKey: 'Cikmak icin herhangi bir tusa basin...'
    };

    // Build PowerShell script with self-elevation
    let script = '<#\n';
    script += '    ' + labels.scriptTitle + '\n';
    script += '    ' + labels.version + '   : ' + CONFIG.version + '\n';
    script += '    ' + labels.date + '      : ' + dateStr + '\n';
    script += '    ' + labels.developer + ' : ' + CONFIG.author + '\n';
    script += '    ' + labels.website + '   : ' + CONFIG.siteUrl + '\n';
    script += '    GitHub    : https://github.com/ahmetlygh/optwin\n';
    script += '    ' + labels.openSource + '\n';
    script += '#>\n\n';

    // Self-elevation code
    script += '# ===== SELF-ELEVATION =====\n';
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + labels.adminRequest + '" -ForegroundColor Yellow\n';
    script += '    Write-Host "  ' + labels.adminPrompt + '" -ForegroundColor Cyan\n';
    script += '    Write-Host ""\n';
    script += '    $scriptPath = $MyInvocation.MyCommand.Definition\n';
    script += '    try {\n';
    script += '        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs\n';
    script += '    } catch {\n';
    script += '        Write-Host "  ' + labels.adminError + '" -ForegroundColor Red\n';
    script += '        Write-Host "  ' + labels.adminHint + '" -ForegroundColor Yellow\n';
    script += '        pause\n';
    script += '    }\n';
    script += '    exit\n';
    script += '}\n\n';

    // Set execution policy
    script += 'Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue\n\n';

    // Set window title
    script += '$host.UI.RawUI.WindowTitle = "OptWin Optimizer Script"\n\n';

    // Header - Display ASCII Banner when script runs
    script += 'Clear-Host\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "       OOOO  PPPP  TTTTT W   W  III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P   P   T   W   W   I   NN  N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O PPPP    T   W W W   I   N N N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P       T   WW WW   I   N  NN" -ForegroundColor Cyan\n';
    script += 'Write-Host "       OOOO  P       T    W W   III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "    ' + labels.bannerTitle + '" -ForegroundColor White\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.version + '   : ' + CONFIG.version + '" -ForegroundColor Gray\n';
    script += 'Write-Host "    ' + labels.date + '      : ' + dateStr + '" -ForegroundColor Gray\n';
    script += 'Write-Host "    ' + labels.developer + ' : ' + CONFIG.author + '" -ForegroundColor Gray\n';
    script += 'Write-Host "    ' + labels.website + '   : ' + CONFIG.siteUrl + '" -ForegroundColor Gray\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.openSourceShort + '" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    GitHub: github.com/ahmetlygh/optwin" -ForegroundColor DarkGray\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "       ' + t.header + '" -ForegroundColor Green\n';
    script += 'Write-Host ""\n\n';

    // Restore point
    if (createRestorePoint) {
        script += 'Write-Host "  [*] ' + sm.restorePoint + '" -ForegroundColor Cyan\n';
        script += 'try {\n';
        script += '    Enable-ComputerRestore -Drive "C:\\" -ErrorAction SilentlyContinue\n';
        script += '    Checkpoint-Computer -Description "OptWin Optimization" -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop\n';
        script += '    Write-Host "      ' + sm.restoreSuccess + '" -ForegroundColor Green\n';
        script += '} catch {\n';
        script += '    Write-Host "      ' + sm.restoreFail + '" -ForegroundColor Yellow\n';
        script += '}\n';
        script += 'Write-Host ""\n\n';
    }

    // Add selected features
    const orderedFeatureIds = [];
    categorizedFeatures.forEach(cat => cat.items.forEach(item => orderedFeatureIds.push(item.id)));

    orderedFeatureIds.forEach(id => {
        if (!selectedFeatures.has(id)) return;
        if (id === 'changeDNS') return; // Handle separately

        let command = featureCommands[id];
        const msg = sm[id];
        if (command && msg) {
            script += 'Write-Host "  ' + msg + '" -ForegroundColor Cyan\n';
            script += command;
            script += 'Write-Host "      ' + sm.done + '" -ForegroundColor Green\n';
            script += 'Write-Host ""\n';
        }
    });

    // Handle DNS separately
    if (selectedFeatures.has('changeDNS')) {
        const dns = dnsProviders[selectedDnsProvider] || dnsProviders.cloudflare;
        let dnsCommand = featureCommands.changeDNS;
        dnsCommand = dnsCommand.replace(/\{\{PRIMARY_DNS\}\}/g, dns.primary);
        dnsCommand = dnsCommand.replace(/\{\{SECONDARY_DNS\}\}/g, dns.secondary);
        script += 'Write-Host "  ' + sm.changeDNS + '" -ForegroundColor Cyan\n';
        script += dnsCommand;
        script += 'Write-Host "      ' + sm.done + ' (' + dns.name + ')" -ForegroundColor Green\n';
        script += 'Write-Host ""\n';
    }

    // Completion message
    script += '\nWrite-Host ""\n';
    script += 'Write-Host "  ========================================" -ForegroundColor Green\n';
    script += 'Write-Host "       ' + t.complete + '" -ForegroundColor Green\n';
    script += 'Write-Host "       ' + t.success + '" -ForegroundColor Green\n';
    script += 'Write-Host "  ========================================" -ForegroundColor Green\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + t.thankYou + '" -ForegroundColor Cyan\n';
    script += 'Write-Host "  ' + t.author + '" -ForegroundColor Gray\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + labels.pressAnyKey + '" -ForegroundColor Gray\n';
    script += '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';

    currentBatContent = script;
    currentBatFilename = 'OptWin_Optimizer.ps1';

    // Update preview
    const previewEl = document.getElementById('preview-code');
    if (previewEl) previewEl.textContent = script;

    // Show overlay
    const overlay = document.getElementById('script-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ===== PING TEST =====
function generatePingTest() {
    const isEn = currentLang === 'en';

    // Bilingual labels for DNS test
    const labels = isEn ? {
        title: 'OptWin DNS Latency Test',
        developer: 'Developer',
        website: 'Website',
        openSource: 'Open Source - https://github.com/ahmetlygh/optwin',
        bannerTitle: 'DNS Latency Test',
        openSourceShort: 'Open Source | Free to Use'
    } : {
        title: 'OptWin DNS Gecikme Testi',
        developer: 'Gelistirici',
        website: 'Website',
        openSource: 'Acik Kaynak - https://github.com/ahmetlygh/optwin',
        bannerTitle: 'DNS Gecikme Testi',
        openSourceShort: 'Acik Kaynak | Ucretsiz'
    };

    let script = '<#\n';
    script += '    ' + labels.title + '\n';
    script += '    ' + labels.developer + ' : ' + CONFIG.author + '\n';
    script += '    ' + labels.website + '   : ' + CONFIG.siteUrl + '\n';
    script += '    ' + labels.openSource + '\n';
    script += '#>\n\n';

    // Self-elevation
    script += '$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)\n';
    script += 'if (-not $isAdmin) {\n';
    script += '    $scriptPath = $MyInvocation.MyCommand.Definition\n';
    script += '    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs\n';
    script += '    exit\n';
    script += '}\n\n';

    // Window title
    script += '$host.UI.RawUI.WindowTitle = "OptWin DNS Test"\n\n';

    script += 'Clear-Host\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "       OOOO  PPPP  TTTTT W   W  III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P   P   T   W   W   I   NN  N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O PPPP    T   W W W   I   N N N" -ForegroundColor Cyan\n';
    script += 'Write-Host "      O    O P       T   WW WW   I   N  NN" -ForegroundColor Cyan\n';
    script += 'Write-Host "       OOOO  P       T    W W   III  N   N" -ForegroundColor Cyan\n';
    script += 'Write-Host "" -ForegroundColor Magenta\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host "    ' + labels.bannerTitle + '" -ForegroundColor White\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.developer + ' : ' + CONFIG.author + '" -ForegroundColor Gray\n';
    script += 'Write-Host "    ' + labels.website + '   : ' + CONFIG.siteUrl + '" -ForegroundColor Gray\n';
    script += 'Write-Host "  ----------------------------------------------------------------" -ForegroundColor DarkGray\n';
    script += 'Write-Host "    ' + labels.openSourceShort + '" -ForegroundColor DarkGray\n';
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + (isEn ? 'Testing DNS Latency...' : 'DNS Gecikme Testi Yapiliyor...') + '" -ForegroundColor Cyan\n';
    script += 'Write-Host ""\n\n';

    script += '$dnsServers = @(\n';
    script += '    @{Name="Cloudflare"; IP="1.1.1.1"},\n';
    script += '    @{Name="Google"; IP="8.8.8.8"},\n';
    script += '    @{Name="OpenDNS"; IP="208.67.222.222"},\n';
    script += '    @{Name="Quad9"; IP="9.9.9.9"},\n';
    script += '    @{Name="AdGuard"; IP="94.140.14.14"}\n';
    script += ')\n\n';

    // Store results for recommendation using PSCustomObject for proper sorting
    script += '$results = @()\n\n';

    script += 'foreach ($dns in $dnsServers) {\n';
    script += '    Write-Host "  Testing $($dns.Name) ($($dns.IP))..." -ForegroundColor Yellow\n';
    script += '    $result = Test-Connection -ComputerName $dns.IP -Count 4 -ErrorAction SilentlyContinue\n';
    script += '    if ($result) {\n';
    script += '        $avg = ($result | Measure-Object -Property ResponseTime -Average).Average\n';
    script += '        Write-Host "      Average: $([math]::Round($avg, 2)) ms" -ForegroundColor Green\n';
    script += '        $results += [PSCustomObject]@{Name=$dns.Name; IP=$dns.IP; Latency=[double]$avg}\n';
    script += '    } else {\n';
    script += '        Write-Host "      Failed to reach" -ForegroundColor Red\n';
    script += '    }\n';
    script += '    Write-Host ""\n';
    script += '}\n\n';

    // Find and display best result - sort by Latency ascending
    script += 'Write-Host "  ================================================================" -ForegroundColor Magenta\n';
    script += 'if ($results.Count -gt 0) {\n';
    script += '    $best = $results | Sort-Object -Property Latency | Select-Object -First 1\n';
    script += '    Write-Host ""\n';
    script += '    Write-Host "  ' + (isEn ? 'Based on your results, the best option is:' : 'Sonuclariniza gore en iyi secenek:') + '" -ForegroundColor White\n';
    script += '    Write-Host "  $($best.Name) ($($best.IP)) - $([math]::Round($best.Latency, 2)) ms" -ForegroundColor Green\n';
    script += '}\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + (isEn ? 'You can select the best DNS at optwin.tech' : 'En iyi DNS i optwin.tech de secebilirsiniz.') + '" -ForegroundColor Gray\n';
    script += 'Write-Host ""\n';
    script += 'Write-Host "  ' + (isEn ? 'Press any key to exit...' : 'Cikmak icin herhangi bir tusa basin...') + '" -ForegroundColor DarkGray\n';
    script += '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';

    currentBatContent = script;
    currentBatFilename = 'OptWin_DNS_Test.ps1';

    const previewEl = document.getElementById('preview-code');
    if (previewEl) previewEl.textContent = script;

    const overlay = document.getElementById('script-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ===== OVERLAY LOGIC =====
const scriptOverlay = document.getElementById('script-overlay');
const closeOverlayBtn = document.getElementById('close-overlay-btn');
const downloadScriptBtn = document.getElementById('download-script-btn');
const copyScriptBtn = document.getElementById('copy-script-btn');

if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener('click', () => {
        scriptOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (downloadScriptBtn) {
    downloadScriptBtn.addEventListener('click', () => {
        downloadFile(currentBatFilename, currentBatContent);
    });
}

if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', () => {
        if (currentBatContent) {
            navigator.clipboard.writeText(currentBatContent).then(() => {
                const t = translations[currentLang].overlay;
                copyScriptBtn.classList.add('copied');
                copyScriptBtn.innerHTML = '<i class="fa-solid fa-check"></i> ' + t.copiedBtn;
                setTimeout(() => {
                    copyScriptBtn.classList.remove('copied');
                    copyScriptBtn.innerHTML = '<i class="fa-solid fa-copy"></i> ' + t.copyBtn;
                }, 2000);
            });
        }
    });
}

function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ===== START =====
init();
