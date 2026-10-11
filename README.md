# Purrfect Run

[English](#english) | [Türkçe](#turkish)

[Play online / Çevrim içi oyna](https://purrfectrun.oxog.dev)

<a id="english"></a>

## English

A cozy 3D endless cat runner set in a pastel neighborhood, with no external model or texture downloads. Built with Next.js App Router, React Three Fiber, Drei, and Tailwind CSS.

### Getting started

```powershell
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires Node.js 20.9+; verified with Bun 1.4.3 and Node 24.

```powershell
bun run typecheck
bun run test
bun run build
bun run start
```

### Controls

| Action         | One button                      | Classic                                   |
| -------------- | ------------------------------- | ----------------------------------------- |
| Jump           | Space / tap the screen          | Space / ↑ / swipe up on mobile            |
| Glide          | Hold Space or your touch        | —                                         |
| Change lanes   | —                               | A / D or ← / → / swipe sideways on mobile |
| Slide          | —                               | S / ↓ / swipe down on mobile              |
| Pause / resume | P / Escape / HUD button         | P / Escape / HUD button                   |
| Restart        | R or the button after game over | R or the button after game over           |

Classic mode also offers on-screen buttons on mobile. The game pauses when the tab is hidden or the window loses focus; resume manually when you return. Control mode is locked during a run.

### Game mechanics

- Start with three lives. Collisions grant 1.5 seconds of invulnerability. Fish restore one life, up to a maximum of three.
- Energy drains at 2.8% per second. Milk restores 25% energy and awards 50 points. Below 20%, the cat slows down; at 0%, the run ends. Above 90%, enjoy a 12% speed bonus and sparkles.
- Golden paws award 100 points; fish award 150 points. Score combines whole meters traveled and collection bonuses.
- Every 500 meters increases base speed by 10%. Themes cycle through daytime → sunset → neon night, with glowing road edges at night. Obstacle spacing increases with the level to preserve reaction time.
- In one-button mode, every object stays in the middle lane and only jumpable boxes and fences appear. Classic mode adds laundry lines to slide under and tall kennels/bins to dodge by changing lanes.
- High score, total milk collected, and best level are automatically saved under `purrfect-run:records:v1`. Invalid records fall back to safe defaults. If storage is blocked, records remain in session memory and the UI indicates this.

### Files and integration

- `components/game/CatRunnerGame.tsx`: client entry point, HUD, touch/keyboard controls, start/pause/results screens, and localStorage.
- `components/game/GameScene.tsx`: lazy-loaded Canvas, follow camera, pooled world/objects, themes, and instanced sparkles.
- `components/game/Models.tsx`: cat built from primitive geometries, procedural leg/tail animation, milk and paw models.
- `lib/engine.ts`: render-independent simulation with fixed 120 Hz steps, swept AABB collisions, physics, and game rules.
- `lib/storage.ts`: versioned, validated records.
- `lib/i18n.ts`: Turkish/English translations and persistent language preference.
- `tests/engine.test.ts`: game rules and malformed-record tests.
- `tests/i18n.test.ts`: language preference and storage-failure tests.

To integrate into an existing Next.js project, copy `components/game`, `lib`, the dependencies, and the styles in `app/globals.css`. The `@/*` alias points to the project root. Render `<CatRunnerGame />` on your page; Three.js loads only in the browser.

### Rendering and performance

The game uses WebGL2 to support MeshToonMaterial, Drei ContactShadows, and broad device compatibility. Three.js WebGPU support is not required. React Three Fiber disposes geometries on unmount. Sixteen objects and ten ground segments are recycled, so the scene does not accumulate objects indefinitely. Sparkles use a single instanced draw call. DPR is capped at 1–1.5 and the shadow map is 1024 px. The React HUD updates at approximately 12 Hz; storage writes occur at most once per second, except on status changes.

The camera and physics are independent of frame rate. Long render gaps are capped at 100 ms, and switching away from the tab explicitly pauses the game. AABB bounds are tailored to the gameplay geometry; Box3 is not recalculated for every scene mesh.

### Versions

Stable versions verified against the NPM `latest` channel on October 11, 2026 are pinned: Next 16.4.0, React 19.3.0, Three 0.186.1, Fiber 9.8.1, Drei 10.7.9, Tailwind 4.3.3, and TypeScript 7.0.2. `bun.lock` provides reproducible installs. Canary/alpha packages are not used.

### Languages

The **TR / EN** buttons at the top right switch between Turkish and English. The HUD, start/pause/results screens, guide, scene labels, and accessibility labels change together; number grouping follows the selected language. Switching languages preserves the current run and score records.

The preference is stored under `purrfect-run:language:v1`. Turkish is the default; if storage is blocked, the selection still works for the session. Extend the dictionaries in `lib/i18n.ts` to add languages; TypeScript checks for missing translation keys.

### Cat profiles

Choose a companion above the game: **Marmalade** (ginger tabby), **Olive** (tuxedo), **Mocha** (Siamese), or **Patches** (calico). Each has its own coat pattern, eye color, paws, and collar, built from the same procedural geometry. All profiles share the same gameplay rules.

Choose before starting or after game over; selection is locked while running or paused. Your choice is restored from `purrfect-run:cat:v1` after a reload. Invalid IDs safely select Marmalade, and blocked storage keeps your choice available for the session. Profile names and descriptions follow the selected UI language. Definitions are in `lib/cat-profiles.ts`; the selector is in `components/game/CatSelector.tsx`.

Pause and game-over dialogs feature the selected companion with animated breathing, tail sways, blinking, and a profile-specific line. Resting cats doze with floating Zs; lost lives bring a sad face, a bandage, and a comforting heart; an empty milk tank brings a tired face and a floating milk bottle. Modal entry and button animations respect reduced-motion preferences.

### GitHub Pages deployment

Live site: [purrfectrun.oxog.dev](https://purrfectrun.oxog.dev).

`.github/workflows/pages.yml` checks formatting, TypeScript, and game tests on every push to `main`, exports the Next.js site into `out/`, and deploys it to GitHub Pages. You can also trigger it using **Run workflow** in Actions. Action versions are pinned to verified release commits.

Set the GitHub Pages source to **GitHub Actions**. The custom domain is `purrfectrun.oxog.dev`, its DNS CNAME target is `ersinkoc.github.io`, and HTTPS is enabled. The domain file is copied into the export from `public/CNAME`. No `basePath` is needed because the site runs at the root of the custom domain.

To produce the same static export locally:

```powershell
$env:GITHUB_PAGES = 'true'
bun run check
Remove-Item Env:GITHUB_PAGES
```

Serve `out/` with any static HTTP server. `GITHUB_PAGES` is only used for static builds; regular `bun run dev`, `bun run build`, and `bun run start` continue to use Next.js server mode.

---

<a id="turkish"></a>

## Türkçe

Pastel bir mahallede geçen, dış model veya doku indirmeyen 3D sonsuz kedi koşusu. Next.js App Router, React Three Fiber, Drei ve Tailwind CSS.

### Çalıştırma

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

### Kontroller

| Eylem            | Tek tuş                        | Gelişmiş                             |
| ---------------- | ------------------------------ | ------------------------------------ |
| Zıpla            | Space / ekrana dokun           | Space / ↑ / mobil yukarı kaydır      |
| Süzül            | Space veya dokunuşu basılı tut | —                                    |
| Şerit            | —                              | A / D veya ← / → / mobil yana kaydır |
| Kay              | —                              | S / ↓ / mobil aşağı kaydır           |
| Duraklat / devam | P / Escape / HUD düğmesi       | P / Escape / HUD düğmesi             |
| Yeniden başlat   | Oyun sonunda R veya düğme      | Oyun sonunda R veya düğme            |

Mobil gelişmiş modda ekran düğmeleri de vardır. Sekme gizlenirse ya da pencere odağını kaybederse oyun duraklar; devam etmek kullanıcıya bırakılır. Kontrol modu tur sırasında kilitlidir.

### Mekanikler

- 3 can; darbe sonrası 1,5 saniye dokunulmazlık. Balık +1 can (en fazla 3).
- Enerji saniyede %2,8 azalır. Süt +%25 enerji ve +50 puan. %20 altında hız düşer, %0'da oyun biter. %90 üzerinde +%12 hız ve parıltılar.
- Altın pati +100 puan, balık +150 puan. Skor = tam sayı mesafe + toplama puanları.
- Her 500 m'de temel hız %10 artar. Gündüz → günbatımı → neon gece döngüsü; gece yol kenarları parlar. Engel aralıkları seviyeye göre büyüyerek tepki süresini korur.
- Tek tuş modunda tüm nesneler orta şerittir; sadece zıplanabilir kutu ve çitler çıkar. Gelişmiş modda çamaşır ipi kaymayı, yüksek kulübe/çöp kutusu şerit değiştirmeyi gerektirir.
- Yüksek skor, toplam süt ve en iyi seviye `purrfect-run:records:v1` anahtarında otomatik kaydedilir. Hatalı kayıtlar güvenli varsayılana döner. Depolama engelliyse oturum belleği kullanılır ve UI bunu belirtir.

### Dosyalar ve entegrasyon

- `components/game/CatRunnerGame.tsx`: istemci giriş noktası, HUD, mobil/klavye kontrolleri, başlangıç/duraklama/sonuç ekranları, localStorage.
- `components/game/GameScene.tsx`: lazy-loaded Canvas, takip kamerası, havuzlanmış dünya/nesneler, tema, instanced parıltılar.
- `components/game/Models.tsx`: primitive geometrilerle kedi, procedural bacak/kuyruk animasyonu, süt ve pati modelleri.
- `lib/engine.ts`: render bağımsız 120 Hz sabit adımlı simülasyon; swept AABB çarpışması, fizik ve oyun kuralları.
- `lib/storage.ts`: sürümlü ve doğrulanan kayıt.
- `lib/i18n.ts`: Türkçe ve İngilizce çeviriler, dil tercihinin kalıcılığı.
- `tests/engine.test.ts`: oyun kuralları ve hatalı kayıt testleri.
- `tests/i18n.test.ts`: dil tercihi ve depolama hatası testleri.

Mevcut bir Next.js projesine eklemek için `components/game`, `lib`, bağımlılıklar ve `app/globals.css` stillerini taşıyın. `@/*` alias'ı köke karşılık gelir. Sayfada `<CatRunnerGame />` render edin; Three.js yalnızca tarayıcıda yüklenir.

### Render ve performans

WebGL2 kullanılır; bu seçim MeshToonMaterial, Drei ContactShadows ve geniş cihaz uyumluluğunu korur. Three.js WebGPU desteği zorunlu değildir. Geometriler React Three Fiber tarafından unmount sırasında temizlenir. 16 nesne ve 10 zemin segmenti tekrar kullanılır; sahne sonsuz nesne biriktirmez. Parıltılar tek instanced draw call'dur. DPR 1–1,5, gölge haritası 1024 px; React HUD güncellemeleri yaklaşık 12 Hz, depolama yazıları en fazla saniyede birdir (durum değişikliği hariç).

Kamera ve fizik frame rate'den bağımsızdır. Uzun render gecikmeleri 100 ms ile sınırlandırılır; sekme değişimi açıkça duraklatılır. AABB kutuları oyun geometrilerine göre tasarlanır; sahnedeki her mesh için yeniden Box3 hesaplanmaz.

### Sürümler

11 Ekim 2026'da NPM `latest` kanalından doğrulanan kararlı sürümler sabitlenmiştir: Next 16.4.0, React 19.3.0, Three 0.186.1, Fiber 9.8.1, Drei 10.7.9, Tailwind 4.3.3, TypeScript 7.0.2. `bun.lock` tekrarlanabilir kurulumu sağlar. Canary/alpha paketler kullanılmaz.

### Dil seçenekleri

Sağ üstteki **TR / EN** düğmeleri Türkçe ve İngilizce arasında geçiş yapar. HUD, başlangıç/duraklama/sonuç ekranları, rehber, sahne ve erişilebilirlik etiketleri birlikte çevrilir; sayının binlik ayıracı da seçilen dile uyar. Dil değişikliği mevcut turu ve skor kayıtlarını sıfırlamaz.

Tercih `purrfect-run:language:v1` anahtarında saklanır. Varsayılan dil Türkçedir; depolama engelliyse tercih oturum boyunca çalışır. Yeni diller `lib/i18n.ts` sözlüğüne eklenebilir; TypeScript eksik çeviri anahtarlarını kontrol eder.

### Kedi profilleri

Oyunun üstünden yol arkadaşını seç: **Mırmır** (turuncu tekir), **Zeytin** (smokin), **Moka** (Siyam) veya **Benek** (üç renkli). Her profil aynı procedural geometrilerle farklı kürk deseni, göz rengi, pati ve tasmaya sahiptir. Oyun kuralları tüm profillerde aynıdır.

Seçim tur başlamadan veya oyun bittikten sonra yapılır; koşarken ve duraklatılmışken kilitlidir. Tercihin `purrfect-run:cat:v1` üzerinden sayfa yenilenince geri yüklenir. Geçersiz kimlikler güvenle Mırmır’a döner; depolama engelliyse seçim oturum boyunca çalışır. Profil adları ve açıklamaları arayüz dilini takip eder. Tanımlar `lib/cat-profiles.ts`, seçim bileşeni `components/game/CatSelector.tsx` içindedir.

Duraklama ve oyun sonu ekranlarında seçili kedinin animasyonlu portresi ve profile özel repliği görünür. Molada uyuklama ve uçuşan Z’ler, canlar bitince üzgün yüz, yara bandı ve teselli kalbi, süt bitince yorgun yüz ve süt şişesi kullanılır. Nefes, kuyruk, göz kırpma, modal giriş ve düğme animasyonları hareketi azaltma tercihine uyar.

### GitHub Pages yayını

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
