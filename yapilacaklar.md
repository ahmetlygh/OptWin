## Faz 6: Son Rötuşlar, Akıcılık ve Hata Giderme
- [x] **Arayüz (UI) ve Sayfa Yapısı**:
    - [x] Sayfanın tamamının tek sayfa (single-page) yapısında olması, sayfanın sağında (body seviyesinde) genel scroll bar çıkmaması sağlanacak.
    - [x] Elemanların sıkışık durmaması, modern ve ferah boşluklara sahip olması sağlanacak.
- [x] **Buton ve Metin İyileştirmeleri**:
    - [x] "GEMINI" olan butonun adı "AI-ÇEVİRİ" olarak değiştirilecek.
    - [x] "UI MODU" ve "RAW JSON" geçiş butonlarının hem normal hem de hover durumları daha estetik ve güzel hale getirilecek.
- [x] **Raw JSON Editör Hataları**:
    - [x] Raw JSON editöründeki kaydırma (scroll) sorunu kesin olarak çözülecek (Derin analiz yapılacak).
    - [x] Raw moddan UI moduna geçildiğinde sayfanın "bom boş" kalması (veya key'lerin yüklenmemesi) sorunu çözülecek.

## Faz 7: Stabilizasyon, Derin Bug Fix ve Performans Audit
- [x] **Global Layout ve Scroll Fix**:
    - [x] Ana sayfa (Language Dashboard) ve editör sayfasındaki çift scroll/kayma sorunu kesin olarak çözülecek. `h-screen` ve `overflow-hidden` stratejisi tüm admin paneline yayılacak.
- [x] **Eksik Navigasyonu (Jump to Next)**:
    - [x] "Eksik gösteriyor ama bulamıyor" hatası giderildi. Arama filtresi otomatik temizleme ve SEO/PT alanlarını kapsama eklendi.
- [x] **Raw JSON Editör Devrimi**:
    - [x] **İmleç/Focus Sorunu**: Textarea ve Highlighter arasındaki hizalama (14px font vs leading) mükemmel hale getirildi.
    - [x] **Yapı Koruması**: JSON anahtarlarının değiştirilmesi engellenecek, sadece değerlerin düzenlenmesine izin verilecek (Shallow diff/merge).
    - [x] **Anlık Senkron**: Sidebar veya diğer modallardan yapılan değişikliklerin JSON editörüne anında (useEffect/ref) yansıması sağlandı.

- [x] **UI Modu Performans Audit**:
    - [x] `TranslationRow` bileşeni `React.memo` ile optimize edilecek.
    - [x] Virtualizer'ın "overscan" ve "estimateSize" değerleri dinamik ölçümle (`measureElement`) stabilize edilecek.
    - [x] DOM öğelerinin "unload-load" (mount/unmount) sırasında yarattığı layout thrashing engellenecek.
- [x] **Veri Bütünlüğü**:
    - [x] Raw -> UI geçişinde labellerin kaybolması sorunu için `setTranslations` ve `setLanguage` akışları `Promise.all` veya ardışık state batching ile garanti altına alınacak.

- [x] **Senkronizasyon ve Performans**:
    - [x] UI ve Raw JSON arası anlık (real-time) çift yönlü senkronizasyon sağlandı.
    - [x] Raw JSON Editor başlığı inceltildi ve referans header ile uyumlu hale getirildi.
    - [x] Tablo kaydırma performansı (virtualization) yeniden optimize edildi.

## Performans Audit & Akıcılık Çözümleri (Özet)
Dil düzenleme sayfasındaki kaydırma ve yükleme performansını "yağ gibi" yapmak için şu teknikler uygulandı:

1. **Memoization (Satır Bazlı)**: `TranslationRow` bileşeni, sadece kendi verisi değiştiğinde render olacak şekilde `memo` ile sarmalandı. Bu, 1000 satırlık bir listede tek bir harf yazıldığında diğer 999 satırın boşuna render olmasını engeller.
2. **Virtualizer Stabilization**: `useVirtualizer` üzerinde `estimateSize` tablodaki ortalama satır yüksekliğine (82px) çekildi ve `overscan` değeri 10'a çıkarıldı. Bu, hızlı kaydırmalarda beyaz ekran görünmesini engeller.
3. **Scroll Element Isolation**: `parentRef` üzerinden doğrudan scroll yönetimi yapılarak `window.scroll` tetiklemeleri engellendi.
4. **CSS Optimization**: Satır hover ve focus animasyonları `will-change: transform` veya sadece `opacity/background` üzerinden yapılarak tarayıcının GPU'su kullanıldı.
5. **Batch State Updates**: Raw moddan UI moda geçerken state güncellemeleri topluca yapıldığı için (Batching), React'in gereksiz ara-render yapması engellendi.
6. **Force Measurement**: Modlar arası geçişte `virtualizer.measure()` tetiklenerek gizli kalan elemanların yükseklikleri anında hesaplanması sağlandı.



## Tamamlananlar (Arşiv)
- [x] Temel UI/UX Modernizasyonu (Glassmorphism, Neon Aksanlar).
- [x] Sıkı Türkçe Tipografi Denetimi.
- [x] Sidebar Yapılandırması (Dil Durumu, İlerleme önceliklendirme).
- [x] Toggle Tasarım Uyumu.
- [x] Düzenleme Modalı (UTC Offset butonu, Büyük boyut).
- [x] Dinamik Sayfa Başlıkları.
- [x] Varsayılan Dil Değişim Onay Ekranı.
- [x] İçe/Dışa Aktarma Butonları.
- [x] JSON Syntax Highlighting (Arama vurgulu).
- [x] Akıllı "Sonraki Eksik" Navigasyonu (Sidebarları otomatik açan).
- [x] Global Kısayollar (Ctrl+F, Ctrl+S).
- [x] Tablo Yüksekliği ve Kaydırma sınırlandırmaları.
- [x] Performans Optimizasyonu (Virtualization iyileştirmeleri).
- [x] İlerleme Sayacı ve Mantık Hatası (Sayım metinleri düzeltildi).
- [x] Dinamik UI Elementleri (Tamamlanana göre buton gizleme).
- [x] Header Temizliği (Varsayılan rozeti ve Düzenle butonu kaldırıldı).
---
*Not: Bu dosya süreç boyunca güncel tutulacaktır.*
