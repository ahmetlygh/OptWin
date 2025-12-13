# 📋 OptWin v1.2 → v2.0 Geliştirme Planı

> Son güncelleme: 2025-12-12  
> Tamamlanan: 7/10 ana görev

---

## ⭐⭐⭐⭐ Yüksek Öncelik

### 🏗️ Proje Yapısı Düzenlemesi
- [x] **1. Dosya yapısını yeniden düzenle** ✅ TAMAMLANDI
  - [x] `features.js` dosyası oluştur (optimizasyon özellikleri için)
  - [x] `config.js` dosyası oluştur (site ayarları, translations için)
  - [x] `script.js` ana kontrol dosyası olarak kalsın
  - [x] `css/` klasörü oluştur ve style.css'i taşı
  - [x] `js/` klasörü oluştur ve JS dosyalarını taşı
  - [x] HTML dosyalarındaki referansları güncelle

### ⚡ PowerShell'e Geçiş
- [x] **2. Script çıktısı CMD → PowerShell'e geçir** ✅ TAMAMLANDI
  - [x] `.bat` yerine `.ps1` formatında script oluştur
  - [x] OptWin.tech imzası/branding ekle (ASCII art banner)
  - [x] Renkli ve daha profesyonel çıktı (Write-Host -ForegroundColor)
  - [x] Hata yönetimi iyileştir (try-catch, ErrorAction)
  - [x] Kullanım talimatlarını güncelle (sağ tık → PowerShell ile çalıştır)

### 🔢 Seçilen Özellik Sayacı
- [x] **3. Seçilen özellik sayacı ekle** ✅ TAMAMLANDI
  - [x] Ana sayfada "X özellik seçildi" göstergesi
  - [x] Dinamik güncelleme
  - [x] Animasyonlu geçiş efekti (pulse animation)
  - [x] 0 seçildiğinde gizle

### ⚠️ Risk Göstergesi Sistemi
- [x] **4. Risk göstergesi ekle** ✅ TAMAMLANDI
  - [x] Her özellik için risk seviyesi tanımla (low/medium/high)
  - [x] Yeşil (düşük risk) - Geri alınabilir, güvenli
  - [x] Sarı (orta risk) - Bazı değişiklikler kalıcı olabilir
  - [x] Kırmızı (yüksek risk) - Sistem davranışını değiştirir
  - [x] Risk badge'ini feature card'lara ekle
  - [ ] Toplam risk özeti göster (opsiyonel)

### 🎮 Gamer Mode Preset
- [x] **5. Gamer Mode preset'i ekle** ✅ TAMAMLANDI
  - [x] Gaming için optimize edilmiş ayarlar:
    - Ultimate Performance
    - Disable Game DVR
    - Disable Xbox Services
    - Disable Mouse Acceleration
    - Disable Transparency
    - Disable Notifications
    - Network Throttling Off
    - GPU Scheduling (yeni)
  - [x] Preset butonuna ikon ve stil ekle (turuncu gradient)

### 🔍 Arama Özelliği
- [x] **6. Özellik arama sistemi ekle** ✅ TAMAMLANDI
  - [x] Arama input alanı (preset'lerin altında)
  - [x] Gerçek zamanlı filtreleme
  - [x] Kategori bazlı filtreleme (boş kategoriler gizlenir)
  - [ ] Arama sonucu vurgulama (opsiyonel)
  - [ ] "Sonuç bulunamadı" durumu (opsiyonel)

### 🆕 Yeni Optimizasyon Özellikleri
- [x] **7. Yeni özellikler ekle (10 adet)** ✅ TAMAMLANDI
  - [x] Disable Cortana - Cortana'yı devre dışı bırak
  - [x] Disable OneDrive - OneDrive'ı kaldır/devre dışı bırak
  - [x] Clear Browser Cache - Tüm tarayıcı önbelleklerini temizle
  - [x] Disable Background Apps - Arka plan uygulamalarını kapat
  - [x] Hardware GPU Scheduling - Donanım GPU zamanlamasını etkinleştir
  - [x] Disable Location Services - Konum servislerini kapat
  - [x] Disable Clipboard History - Pano geçmişini kapat
  - [x] Disable Activity History - Aktivite geçmişini kapat
  - [x] Clear Font Cache - Font önbelleğini temizle
  - [x] Disable News and Interests - Görev çubuğu haber widget'ını kapat

---

## ⭐⭐⭐ Orta Öncelik

### 📄 Changelog Sayfası
- [ ] **8. Changelog bölümü oluştur**
  - [ ] index.html'de changelog section ekle
  - [ ] Versiyon geçmişi (v1.0, v1.1, v1.2...)
  - [ ] Her versiyonda yapılan değişiklikler
  - [ ] Tarih bilgisi

### 📱 Mobil UX İyileştirmeleri
- [ ] **9. Mobil deneyimi geliştir**
  - [x] Touch-friendly butonlar (minimum 44px)
  - [ ] Hamburger menü (768px altı)
  - [ ] Swipe gesture desteği (kategoriler arası)
  - [ ] Bottom sheet modal (mobilde)
  - [x] Daha iyi spacing ve padding (responsive CSS eklendi)

---

## ⭐⭐ Düşük Öncelik

### 📲 PWA Desteği (Opsiyonel)
- [ ] **10. PWA kurulumu**
  - [ ] `manifest.json` oluştur
  - [ ] Service Worker ekle
  - [ ] Offline çalışma desteği
  - [ ] "Ana ekrana ekle" özelliği
  
> **Not:** PWA, sitenin mobilde uygulama gibi yüklenebilmesini sağlar. İsteğe bağlı.

---

## ✅ Tamamlananlar

| # | Görev | Tarih |
|---|-------|-------|
| 1 | Dosya yapısı düzenlemesi | 2025-12-12 |
| 2 | PowerShell'e geçiş | 2025-12-12 |
| 3 | Seçilen özellik sayacı | 2025-12-12 |
| 4 | Risk göstergesi sistemi | 2025-12-12 |
| 5 | Gamer Mode preset | 2025-12-12 |
| 6 | Arama özelliği | 2025-12-12 |
| 7 | 10 yeni optimizasyon özelliği | 2025-12-12 |

---

## 📝 Notlar

- **Versiyon planı:** v1.1 → v1.2 (Yüksek öncelik) → v1.5 (Orta öncelik) → v2.0 (Tüm özellikler)
- **Script formatı:** CMD (.bat) → PowerShell (.ps1) geçişi ✅
- **Kod organizasyonu:** Modüler JS yapısı ✅

---

## 🗂️ Yeni Dosya Yapısı

```
OptWin v1.2/
├── index.html
├── progress.md
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── script.js (ana kontrol)
│   ├── features.js (optimizasyon özellikleri + PowerShell komutları)
│   └── config.js (ayarlar, çeviriler)
├── assets/
│   ├── favicon.png
│   └── optwin.png
└── api/
    ├── stats.php
    └── stats.json
```

---

## 🎯 Hızlı İlerleme Takibi

| Kategori | Toplam | Tamamlanan | Durum |
|----------|--------|------------|-------|
| Yüksek Öncelik | 7 | 7 | ✅ Tamamlandı |
| Orta Öncelik | 2 | 0 | ⏳ Bekliyor |
| Düşük Öncelik | 1 | 0 | ⏳ Bekliyor |
| **TOPLAM** | **10** | **7** | **%70** |

---

## 🆕 Eklenen Yeni Özellikler Özeti

### Yeni Kategori: Privacy & Security
- Disable Cortana
- Disable OneDrive  
- Disable Location
- Disable Clipboard History
- Disable Activity History
- Disable News & Interests

### Extra Tweaks'e Eklenenler
- Clear Browser Cache
- Disable Background Apps
- GPU Scheduling

### Maintenance'e Eklenenler
- Clear Font Cache
