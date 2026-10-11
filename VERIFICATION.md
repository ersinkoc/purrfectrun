# Doğrulama — 11 Ekim 2026

- `bun install --frozen-lockfile`: başarılı, lockfile ile kurulum doğrulandı.
- `bun run format:check`: başarılı.
- `bun run typecheck`: başarılı.
- `bun run test`: 23 başarılı, 0 başarısız, 107 assertion.
- `bun run build`: başarılı; `/` statik prerender, 3D sahne istemcide lazy-load edilir.
- Production sunucusunda masaüstü ve 390 × 844 mobil görünüm açıldı. Yatay taşma görülmedi.
- Başlatma, tek tuş ve gelişmiş mod seçimi, mobil şerit düğmeleri, Space, P ile duraklama/devam, rehber ve Escape ile kapanma denendi.
- Kontrol düğmesi odaktayken P ile duraklama ayrıca doğrulandı.
- Game Over ekranı gözlendi; yeniden başlatılan turlar ve korunmuş lifetime kayıtları gözlendi.
- Sayfa yenilemesinde yüksek skor ve toplam süt kaydı korundu.
- Tarayıcı konsolunda uygulama hatası görülmedi. Fiber'ın kullandığı `THREE.Clock` için Three 0.186.1 bir deprecation uyarısı veriyor; bu çalışma hatası değildir. Eski PCFSoftShadowMap yerine güncel PCFShadowMap açıkça seçildi.

500 m seviye geçişleri, enerji eşikleri, can yenileme, dokunulmazlık, kayma, zıplama, frame-rate tutarlılığı ve bounded nesne havuzu simülasyon testlerinde doğrulandı. Bütün seviyeler ve cihazlar tarayıcıda ayrı ayrı oynanmadı. Mobil görünüm testi viewport doğrulamasıdır; fiziksel telefon performans sertifikası değildir.

Klasör başlangıçta boştu ve Git deposu değildir; mevcut kullanıcı dosyası değiştirilmedi. Yayın/deploy yapılmadı.

## Türkçe / İngilizce dil seçimi

TR / EN geçişi production sunucusunda denendi. İngilizce HUD, başlangıç ve duraklama ekranları, rehber, erişilebilirlik etiketleri ve sayı biçimleri doğrulandı. Yenileme sonrası EN seçimi ve HTML `lang="en"` korundu. Duraklatılmış turda TR’ye geçiş mesafe, skor ve enerjiyi değiştirmedi. İngilizce görünüm 390 × 844 viewport’ta yatay taşma oluşturmadı. Dil tercihinin kalıcılığı, geçersiz tercih ve engellenmiş depolama 3 yeni testle doğrulandı.

## Kedi profilleri

Mırmır/Marmalade, Zeytin/Olive, Moka/Mocha ve Benek/Patches seçimleri eklendi. Smokin ve üç renkli kedilerin farklı 3D kürkleri görsel olarak kontrol edildi. Seçim Türkçe/İngilizce etiketlerle çalışıyor ve yenilemede korunuyor. Koşu ve duraklama sırasında dört seçim düğmesi de devre dışı kalıyor. 390 × 844 mobil viewport’ta profil kartları iki sütuna geçiyor ve yatay taşma yok. Tarayıcı konsolunda hata görülmedi. Tercihin kalıcılığı, geçersiz profil kimliği ve engellenmiş depolama iki yeni testte doğrulandı.

## Duruma özel kedi portreleri

Duraklamada uyuklayan, canlar bitince üzgün ve yara bantlı, süt bitince yorgun portre seçili kediye göre çizilir. Her kedinin iki dilde üç ayrı repliği vardır. CSS nefes, kuyruk, pati, göz kırpma, gözyaşı, sembol ve modal giriş hareketlerini içerir; hareketi azaltma media kuralı bu animasyonları kapatır. Mola ve can kaybı ekranları gerçek koşuda tarayıcıda görüldü. 390 × 844 viewport’ta mola kartı sığdı; uzun sonuç kartı 464 px görünür yükseklikte, 516 px içerikle kaydırılabilir kaldı. Space ile devam etme, R ile yeniden başlatma ve İngilizce portre/replik doğrulandı. Açlık portresi React render testinde doğrulandı; açlıktan biten tur tarayıcıda ayrıca oynanmadı. Durum eşleme ve profil/dil replikleri üç yeni testte, gerçek portre render’ı bir yeni testte doğrulandı.
