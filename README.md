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

## Karakterler, efektler ve müzik

- **Buzcu:** ilk sürümdeki bere ve atkılı karakter.
- **Groove:** afro saçlı, koyu tenli popstar; altın gözlük, mor sahne ceketi.
- **Riva:** sarışın, kulaklıklı tekno dansçısı.
- Tur öncesinde, tur sonunda veya duraklatma ekranında karakter seçilebilir. Seçim cihazda saklanır; bütün karakterlerin fizik ve çarpışma kutusu aynıdır.
- **Aktif 2–19× kombo:** ayaklardan çıkan küçük, renkli dört uçlu yıldızlar.
- **Aktif 20× ve üzeri:** küçük sıcak renkli alev izi. En fazla 24 parçacık; efekt kombonun sona ermesiyle söner. Azaltılmış hareket tercihinde izler gösterilmez.
- **100. kat ve üzeri — Mor Sızıntı:** mor taşlar, slime kaplı yeşil platformlar, duvar sızıntıları, havada süzülen baloncuklar. Yeni tur buz temasına döner.
- **138 BPM özgün tekno:** Web Audio ile davul, hi-hat, bas ve synth arpeji. Ses dosyası veya haricî müzik servisi gerekmez; orijinal Icy Tower müziği kullanılmaz.
- Nota düğmesi müziği bağımsız açar/kapatır; hoparlör hem müziği hem efektleri sessize alır. Tercihler saklanır. Müzik ilk kullanıcı etkileşiminden sonra yalnızca oyun sürerken çalar; duraklatma, tur sonu ve sekme değişiminde durur.

## Teknoloji ve yapı

React 19, JavaScript/JSX, HTML Canvas 2D, Web Audio API, Lucide React; Vinext/Vite derleme altyapısı. Framework giriş dosyaları TypeScript'tir; oyun simülasyonu ve çizimi saf JavaScript'tir. Ek oyun motoru, ücretli servis veya API anahtarı gerekmez.

- `game/engine.mjs`: platform üretimi, fizik, çarpışma, skor ve oyun durumları. 120 Hz sabit zaman adımı; rastgele sayı üreticisi testlerde değiştirilebilir.
- `game/renderer.mjs`: buz ve slime temalı Canvas sahneleri.
- `game/characters.mjs`: üç özgün piksel karakterin ortak çizimi.
- `game/effects.mjs`: kombo ayak izleri ve tema eşikleri.
- `game/music.mjs`: özgün tekno bestesi, ses saatiyle nota planlama ve müzik yaşam döngüsü.
- `app/character-picker.jsx`: klavye ve dokunmatik uyumlu karakter seçimi.
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

## Görsel katman — stilize 2D yenileme

Üç karakterin renkleri ve aksesuarları korunur. Yumuşak konturlar, gölgeli yüz/saç/kıyafet yüzeyleri, eklemli koşu ve havada pozlar kullanılır. Buz ve slime platformlarında pah hissi, kenar parıltıları ve temas gölgeleri; duvarlarda önbellekli yüzey varyasyonu bulunur.

Oyun Canvas 2D kalır: gerçek 3D mesh/topology veya normal-map shader eklenmemiştir. Hacim ve kabartma hissi 2D ışık/gölge ile üretilir. Tek bir 384×160 karakter baş atlası (240 KiB RGBA), en fazla dört 256×128 duvar önbelleği (toplam 512 KiB) ve 2× DPR sınırı kullanılır. 380 CSS piksel altındaki oyun alanında ince duvar detayları kaldırılır, ortam parçacıkları yarıya indirilir; bu 2D detay seviyesi çarpışmaları etkilemez. Atlaslar oturum boyunca paylaşılır ve sabit boyutludur. Yeni indirilmesi gereken görsel dosya veya bağımlılık yoktur.

Motor, hitbox, skor, kombo, müzik ve dokunmatik kontrol mantığı değiştirilmemiştir. 17 otomatik test geçer; fizik değişmezliği ve çizim dönüşümlerinin dengesi de kontrol edilir. Gerçek cihaz FPS ölçümü ve görsel tarayıcı testi yapılmamıştır.

## Mobil çizim optimizasyonu

Çizim en fazla 60 FPS; fizik mevcut 120 Hz sabit adımla çalışır. Platformlar, karakter materyalleri ve ışık katmanları 8 MiB / 128 giriş sınırı olan ortak LRU önbellekten çizilir. Önceki baş ve duvar atlasları ayrıca sabit sınırlarını korur. Çözünürlük ölçeği cihazın DPR değerinden (en çok 2×) başlar; iki saniyelik aktif oyun örneklerinde 48 FPS altı veya 12 ms üstü ortalama çizim süresinde 0,25 azalır (en az 1×). Dört rahat ölçüm penceresinden sonra 0,25 yükselir. Duraklama ve sekmeden dönüş örnekleri sıfırlanır. Çözünürlük yalnızca çizim tamponunu değiştirir, oyun koordinatlarını değiştirmez.

60/90/120/144 Hz zaman çizelgeleri, çözünürlük histerezisi, önbellek sınırı ve sıcak önbellekte materyal/platform gradyanlarının tekrar oluşturulmaması otomatik test edilir. Bu ölçümler gerçek telefon FPS ölçümü değildir.
