# Purrfect Run

Pastel bir mahallede geçen, dış model veya doku indirmeyen 3D sonsuz kedi koşusu. Next.js App Router, React Three Fiber, Drei ve Tailwind CSS.

## Çalıştırma

```powershell
bun install --frozen-lockfile
bun run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın. Node.js 20.9+ gerekir; bu proje Bun 1.4.3 ve Node 24 ile doğrulandı.

```powershell
bun run typecheck
bun run test
bun run build
bun run start
```

## Kontroller

| Eylem            | Tek tuş                        | Gelişmiş                             |
| ---------------- | ------------------------------ | ------------------------------------ |
| Zıpla            | Space / ekrana dokun           | Space / ↑ / mobil yukarı kaydır      |
| Süzül            | Space veya dokunuşu basılı tut | —                                    |
| Şerit            | —                              | A / D veya ← / → / mobil yana kaydır |
| Kay              | —                              | S / ↓ / mobil aşağı kaydır           |
| Duraklat / devam | P / Escape / HUD düğmesi       | P / Escape / HUD düğmesi             |
| Yeniden başlat   | Oyun sonunda R veya düğme      | Oyun sonunda R veya düğme            |

Mobil gelişmiş modda ekran düğmeleri de vardır. Sekme gizlenirse ya da pencere odağını kaybederse oyun duraklar; devam etmek kullanıcıya bırakılır. Kontrol modu tur sırasında kilitlidir.

## Mekanikler

- 3 can; darbe sonrası 1,5 saniye dokunulmazlık. Balık +1 can (en fazla 3).
- Enerji saniyede %2,8 azalır. Süt +%25 enerji ve +50 puan. %20 altında hız düşer, %0'da oyun biter. %90 üzerinde +%12 hız ve parıltılar.
- Altın pati +100 puan, balık +150 puan. Skor = tam sayı mesafe + toplama puanları.
- Her 500 m'de temel hız %10 artar. Gündüz → günbatımı → neon gece döngüsü; gece yol kenarları parlar. Engel aralıkları seviyeye göre büyüyerek tepki süresini korur.
- Tek tuş modunda tüm nesneler orta şerittir; sadece zıplanabilir kutu ve çitler çıkar. Gelişmiş modda çamaşır ipi kaymayı, yüksek kulübe/çöp kutusu şerit değiştirmeyi gerektirir.
- Yüksek skor, toplam süt ve en iyi seviye `purrfect-run:records:v1` anahtarında otomatik kaydedilir. Hatalı kayıtlar güvenli varsayılana döner. Depolama engelliyse oturum belleği kullanılır ve UI bunu belirtir.

## Dosyalar ve entegrasyon

- `components/game/CatRunnerGame.tsx`: istemci giriş noktası, HUD, mobil/klavye kontrolleri, başlangıç/duraklama/sonuç ekranları, localStorage.
- `components/game/GameScene.tsx`: lazy-loaded Canvas, takip kamerası, havuzlanmış dünya/nesneler, tema, instanced parıltılar.
- `components/game/Models.tsx`: primitive geometrilerle kedi, procedural bacak/kuyruk animasyonu, süt ve pati modelleri.
- `lib/engine.ts`: render bağımsız 120 Hz sabit adımlı simülasyon; swept AABB çarpışması, fizik ve oyun kuralları.
- `lib/storage.ts`: sürümlü ve doğrulanan kayıt.
- `tests/engine.test.ts`: oyun kuralları ve hatalı kayıt testleri.

Mevcut bir Next.js projesine eklemek için `components/game`, `lib`, bağımlılıklar ve `app/globals.css` stillerini taşıyın. `@/*` alias'ı köke karşılık gelir. Sayfada `<CatRunnerGame />` render edin; Three.js yalnızca tarayıcıda yüklenir.

## Render ve performans

WebGL2 kullanılır; bu seçim MeshToonMaterial, Drei ContactShadows ve geniş cihaz uyumluluğunu korur. Three.js WebGPU desteği zorunlu değildir. Geometriler React Three Fiber tarafından unmount sırasında temizlenir. 16 nesne ve 10 zemin segmenti tekrar kullanılır; sahne sonsuz nesne biriktirmez. Parıltılar tek instanced draw call'dur. DPR 1–1,5, gölge haritası 1024 px; React HUD güncellemeleri yaklaşık 12 Hz, depolama yazıları en fazla saniyede birdir (durum değişikliği hariç).

Kamera ve fizik frame rate'den bağımsızdır. Uzun render gecikmeleri 100 ms ile sınırlandırılır; sekme değişimi açıkça duraklatılır. AABB kutuları oyun geometrilerine göre tasarlanır; sahnedeki her mesh için yeniden Box3 hesaplanmaz.

## Sürümler

11 Ekim 2026'da NPM `latest` kanalından doğrulanan kararlı sürümler sabitlenmiştir: Next 16.4.0, React 19.3.0, Three 0.186.1, Fiber 9.8.1, Drei 10.7.9, Tailwind 4.3.3, TypeScript 7.0.2. `bun.lock` tekrarlanabilir kurulumu sağlar. Canary/alpha paketler kullanılmaz.

## Dil seçenekleri

Sağ üstteki **TR / EN** düğmeleri Türkçe ve İngilizce arasında geçiş yapar. HUD, başlangıç/duraklama/sonuç ekranları, rehber, sahne ve erişilebilirlik etiketleri birlikte çevrilir; sayının binlik ayıracı da seçilen dile uyar. Dil değişikliği mevcut turu ve skor kayıtlarını sıfırlamaz.

Tercih `purrfect-run:language:v1` anahtarında saklanır. Varsayılan dil Türkçedir; depolama engelliyse tercih oturum boyunca çalışır. Yeni diller `lib/i18n.ts` sözlüğüne eklenebilir; TypeScript eksik çeviri anahtarlarını kontrol eder.

## GitHub Pages yayını

Canlı adres: [purrfectrun.oxog.dev](https://purrfectrun.oxog.dev).

`.github/workflows/pages.yml`, `main` dalına her push sonrası biçimlendirme, TypeScript ve oyun testlerini çalıştırır; Next.js statik çıktısını `out/` klasörüne üretip GitHub Pages’e yükler. Actions ekranındaki **Run workflow** düğmesiyle elle de çalıştırılabilir. Actions sürümleri doğrulanan release commit’lerine sabitlenmiştir.

GitHub Pages kaynağı **GitHub Actions** olmalıdır. Özel alan adı `purrfectrun.oxog.dev`, DNS CNAME hedefi `ersinkoc.github.io` ve HTTPS etkin olacak şekilde ayarlanır. Alan adı dosyası `public/CNAME` üzerinden export’a kopyalanır. Özel alan adı kökünde çalıştığından `basePath` gerekmez.

Yerelde aynı statik export’u üretmek için:

```powershell
$env:GITHUB_PAGES = 'true'
bun run check
Remove-Item Env:GITHUB_PAGES
```

`out/` herhangi bir statik HTTP sunucusuyla servis edilebilir. `GITHUB_PAGES` yalnızca statik build için kullanılır; normal `bun run dev`, `bun run build` ve `bun run start` Next.js sunucu modunda çalışmaya devam eder.
