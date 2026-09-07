# Frost Hop ❄️

Icy Tower'ın ivmeli koşu ve dikey tırmanış fikrinden esinlenen, özgün karakter ve çizimlerle hazırlanmış mobil web oyunu. Arayüz Türkçedir. Orijinal oyunun kodunu, müziklerini veya görsellerini içermez; resmî bir Icy Tower ürünü değildir.

## Çalıştırma

Node.js 22.13+ gerekir.

```bash
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi aç. Aynı ağdaki telefondan bilgisayarın yerel IP adresiyle bağlanmak için `npm run dev -- --host 0.0.0.0` kullan.

```bash
npm run build
npm start
```

## Oynanış

- Sol/sağ ok veya A/D: ivmeli koşu.
- Boşluk, yukarı ok veya W: zıplama. Basılı tutunca inişin ardından yeniden zıplanır.
- ESC veya P: duraklat/devam et.
- Telefonda yön ve zıplama tuşlarına aynı anda basılabilir.
- Koşu hızı zıplama yüksekliğini artırır. Duvarlar yatay momentumu yansıtır.
- Tek zıplayışta en az 2 kat ilerlemek kombo verir. 3,5 saniye içinde tekrarla.
- Puan: ulaşılan kat × 100 + her kombo inişinde geçilen kat × kombo × 50.
- İlk üst kata inişten 5 saniye sonra kamera kendiliğinden yükselir; gittikçe hızlanır. Görüntünün altında kalırsan tur biter.
- Rekor ve ses tercihi yalnızca mevcut tarayıcının localStorage alanında tutulur. Hesap veya sunucuya skor gönderimi yoktur.
- Sekme gizlendiğinde veya pencere odağını kaybettiğinde otomatik duraklatılır.

## Teknoloji ve yapı

React 19, JavaScript/JSX, HTML Canvas 2D, Web Audio API, Lucide React; Vinext/Vite derleme altyapısı. Framework giriş dosyaları TypeScript'tir; oyun simülasyonu ve çizimi saf JavaScript'tir. Ek oyun motoru, ücretli servis veya API anahtarı gerekmez.

- `game/engine.mjs`: platform üretimi, fizik, çarpışma, skor ve oyun durumları. 120 Hz sabit zaman adımı; rastgele sayı üreticisi testlerde değiştirilebilir.
- `game/renderer.mjs`: Canvas sahnesi ve özgün piksel karakter.
- `app/frost-hop.jsx`: React arayüzü, çoklu dokunma, klavye, ses, kayıt ve yaşam döngüsü.
- `app/globals.css`: telefon, tablet ve masaüstü düzenleri.
- `tests/engine.test.mjs`: kritik oynanış testleri.
- `tests/rendered-html.test.mjs`: derlenmiş Worker yanıtı testi.

```bash
node --test tests/engine.test.mjs
npm test
```

Mobil görünüm dar ekranlara uyarlanır. Tam ekran API desteği olmayan tarayıcılarda sayfa içi genişletme kullanılır. `prefers-reduced-motion` parçacıkları ve dekoratif hareketleri kapatır. Ses oynatma kullanıcı etkileşimiyle başlar; desteklenmezse oyun sessiz çalışır. Klavye oynanışı için ekran okuyucu anlatımı sunulmamaktadır.

## Yayınlama ve geliştirme

Sites yayını için `.openai/hosting.json` dosyasındaki kimlik bu dağıtıma aittir. Başka bir Site olarak kopyalarken bu kimliği yeniden kullanma. GitHub depo olarak kaynak kodunu barındırır; bu Worker çıktısı doğrudan GitHub Pages'e konulamaz. Cloudflare Workers veya Vinext destekleyen sunucuda çalıştırılabilir.

Uygulama ağ üzerinden başka servis çağırmaz. Projeye gizli anahtar, `.env`, `node_modules` veya derleme çıktısı commit edilmemelidir. `status.md` ilerleme ve doğrulama notlarını içerir.
