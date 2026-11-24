# Quantum Team — Blokzincir Takımı Oryantasyon Projesi

Bu depo, Quantum Team Blokzincir Takımı yeni üye oryantasyon iş paketinin
(İP 01 - İP 25, opsiyonel dApp kısmı İP 24-25 dahil) **tam uygulamasıdır**:
teorik araştırma dokümanları, manuel görev kanıt şablonları, Solidity
akıllı sözleşmeleri, otomatik testler ve iki modüllü bir web uygulaması.

## Amaç ve Öğrenilen Konular

- Blokzincir, konsensüs, kriptografi (hash/şifreleme/imza) ve cüzdan
  temelleri (İP 01-03).
- Bitcoin/Ethereum farkları, token standartları, akıllı sözleşme/ABI/EVM
  kavramları (İP 04-05).
- RPC, block explorer, event/log, bir işlemin uçtan uca yolculuğu
  (İP 06-07).
- Geniş Web3 ekosistemi (L1/L2, DeFi, DAO, Oracle, ZK) ve gerçek bir
  projenin (ENS) incelenmesi (İP 08-09).
- Git/GitHub/Remix/Solidity araç zinciri, MetaMask, EIP-55 checksum,
  Sepolia faucet'leri, ERC-20 (USDC) transferleri (İP 11, 13-15).
- Takımın mevcut `QuantumKayit` sözleşmesine Remix/Etherscan üzerinden
  işlem gönderme, kendi kopyasını deploy edip verify etme (İP 16-19).
- Sıfırdan bir etkinlik kayıt sözleşmesini üç sürüm halinde (v1 → v2 → v3)
  geliştirme: kurallar, kapasite, yetkilendirme (İP 20-23).
- BIP39/BIP32/BIP44'e dayalı bir eğitim cüzdanı oluşturucu ve MetaMask
  ile uçtan uca çalışan bir etkinlik dApp'i (İP 12, 24-25).

## Proje Klasör Mimarisi

```
quantum-baslangic/
├── contracts/                   # Solidity akıllı sözleşmeleri
│   ├── QuantumKayit.sol         # İP 16-19: takımın sözleşmesinin arayüzü
│   ├── EtkinlikKayit_v1.sol     # İP 20: ilk basit sürüm
│   ├── EtkinlikKayit_v2.sol     # İP 21: kapasite + kurallar
│   └── EtkinlikKayit_v3.sol     # İP 22-23: görevli/giriş kontrolü (final)
├── test/
│   └── EtkinlikKayit.test.js    # Hardhat testleri (İP 21 & İP 22 senaryoları)
├── scripts/
│   └── deploy.js                # Sepolia'ya deploy yardımcı script'i
├── docs/
│   ├── Bolum-A-Blokzincir-Temelleri-ve-Kavramlar.md   # İP 01-08
│   ├── Bolum-A-IP09-IP10-Proje-ve-Yarisma.md          # İP 09-10
│   ├── Uygulama-Kayitlari-ve-Kanitlar.md              # İP 11,13-19,21-23,25
│   └── screenshots/              # Manuel görevlerin ekran görüntüleri
├── web/                          # Web uygulaması (Vite + Vanilla JS)
│   ├── index.html
│   └── src/
│       ├── wallet/                # Modül 1: Eğitim Cüzdanı Oluşturucu (İP 12-13)
│       │   ├── crypto.js          # Tüm kriptografik hesaplamalar (saf fonksiyonlar)
│       │   └── walletUI.js        # Arayüz katmanı
│       ├── dapp/                  # Modül 2: Etkinlik Kayıt dApp (İP 24-25)
│       │   └── dappUI.js          # Cüzdan bağlantısı + sözleşme çağrıları + arayüz
│       ├── config/
│       │   └── contractConfig.js  # Sözleşme adresi/ABI yapılandırması
│       └── main.js                # Sekme (tab) geçişi, iki modülü birbirinden izole bağlar
├── hardhat.config.js
├── package.json                  # Kök (Hardhat/sözleşme) bağımlılıkları
├── .env.example                  # Hangi ortam değişkenlerinin gerektiğinin örneği
└── .gitignore                    # .env, node_modules, dist, build çıktıları hariç tutulur
```

## Kurulan Araçlar

| Araç | Amaç |
|---|---|
| **VS Code** | Kod editörü |
| **Git / GitHub** | Versiyon kontrolü ve depo barındırma |
| **Node.js (npm)** | JavaScript bağımlılık yönetimi ve script çalıştırma |
| **MetaMask** | Tarayıcı cüzdanı; Sepolia test ağına bağlanmak ve işlem imzalamak için |
| **Remix IDE** | Solidity sözleşmelerini yazma/derleme/deploy/manuel test |
| **Solidity (^0.8.20)** | Akıllı sözleşme dili |
| **Hardhat** | Sözleşmeleri yerel olarak derleme, otomatik test etme, Sepolia'ya deploy etme |
| **Vite + ethers.js v6** | Web uygulamasının geliştirme/derleme araçları ve zincirle konuşma kütüphanesi |
| **@scure/bip39, @scure/bip32, @noble/hashes, @noble/curves** | Modül 1'deki tüm BIP39/BIP32/secp256k1 hesaplamalarını düşük seviyede, adım adım yapan kütüphaneler |

## Kurulum ve Çalıştırma

### 1) Akıllı Sözleşmeler (kök dizin)

```bash
npm install
npm run compile
npm test
```

Sepolia'ya deploy etmek için önce `.env.example` dosyasını `.env` olarak
kopyalayıp kendi (SADECE test amaçlı) RPC URL / private key / Etherscan API
key bilgilerinizi girin, sonra:

```bash
npx hardhat run scripts/deploy.js --network sepolia -- EtkinlikKayit_v3 "Quantum Takimi Final Etkinligi"
```

### 2) Web Uygulaması (`web/` dizini)

```bash
cd web
npm install
npm run dev      # geliştirme sunucusu
npm run build    # production build (dist/ klasörüne)
```

Deploy ettiğiniz `EtkinlikKayit_v3` sözleşmesinin adresini,
[`web/src/config/contractConfig.js`](web/src/config/contractConfig.js)
dosyasındaki `DEFAULT_CONFIG.address` alanından **veya** doğrudan
uygulamanın "⚙️ Ayarlar" kutusundan güncelleyin.

## İP 19 Madde 5 — Remix ve Etherscan Aynı Ağdaki Sözleşmelere Nasıl İşlem Gönderebiliyor?

Her ikisi de kendi başlarına bir "cüzdan" değildir; her ikisi de tarayıcıda
kurulu **aynı MetaMask eklentisine** (`window.ethereum`) bağlanır ve
kullanıcıdan işlemi imzalamasını ister. İmzalanan işlem, hangi arayüzden
(Remix'in "Deploy & Run" sekmesi mi, Etherscan'in "Write Contract"
sekmesi mi) geldiğinden bağımsız olarak **aynı Sepolia RPC ağına**
gönderilir. Zincir, kendisine ulaşan imzalı işlemin hangi web sayfasından
tetiklendiğini bilmez/umursamaz — sadece imzanın geçerli olup olmadığını
ve `nonce`/`chainId` gibi alanların doğruluğunu kontrol eder. Bu yüzden
Remix'te deploy ettiğiniz bir sözleşmeye, hiçbir ek ayar yapmadan
Etherscan üzerinden de (verify ettikten sonra "Write Contract" ile) işlem
gönderebilirsiniz — ikisi de sadece MetaMask'e "şu işlemi imzala" diyen
birer arayüzdür.

## İP 24 Madde 7 — Modül 1 (Cüzdan Oluşturucu) ile Modül 2 (Etkinlik dApp) Nasıl İzole Tutuluyor?

Mimari olarak iki modül **hiçbir ortak state veya import'a sahip
değildir**:

- [`web/src/wallet/`](web/src/wallet/) (Modül 1), kendi içinde
  entropi/mnemonic/seed/private key üretir ve bunları **sadece kendi
  bileşenlerinin belleğinde** (`currentWallet` değişkeni,
  [`walletUI.js`](web/src/wallet/walletUI.js) içinde) tutar. Bu veriler
  hiçbir `export` ile dışarı açılmaz, `localStorage`'a yazılmaz,
  `console.log`'a basılmaz ve hiçbir ağ isteğine dahil edilmez.
- [`web/src/dapp/`](web/src/dapp/) (Modül 2), `wallet/` klasöründen
  **hiçbir dosya import etmez** — [`dappUI.js`](web/src/dapp/dappUI.js)
  yalnızca `ethers`'ın `BrowserProvider`'ını kullanarak
  `window.ethereum` (MetaMask) üzerinden cüzdan bağlar ve işlem
  imzalatır. Aynı eğitim hesabını kullanmak isteyen bir kullanıcı,
  Modül 1'de ürettiği mnemonic'i **kendi MetaMask'ine manuel olarak içe
  aktarır (import)**; iki modül arasında kod seviyesinde hiçbir otomatik
  veri akışı yoktur — bağlantı noktası sadece "aynı insanın aynı anda
  kullandığı MetaMask eklentisi"dir, kodun kendisi değil.

Bu ayrım kasıtlıdır: Modül 1'in ürettiği hassas veriler bir eğitim
amacına hizmet eder ve tarayıcıdan asla çıkmaması gerekir; Modül 2 ise
gerçek (test) işlemler gönderdiği için imzalamayı her zaman MetaMask'in
kendi güvenli ortamına devretmelidir.

## Kodda Cüzdan Bağlantısı / Sözleşme Çağrısı (write) / Veri Okuma (read) Referansları

| İşlem | Dosya · Fonksiyon |
|---|---|
| Cüzdan bağlama (`eth_requestAccounts`) | [`web/src/dapp/dappUI.js`](web/src/dapp/dappUI.js) → `connectWallet()` |
| Ağ (chainId) kontrolü ve Sepolia'ya geçiş | `dappUI.js` → `detectNetwork()`, `isOnSepolia()`, `switchToSepolia()` |
| Hesap/ağ değişikliği dinleme | `dappUI.js` → `mountDappModule()` içindeki `accountsChanged` / `chainChanged` listener'ları |
| Veri okuma (view call) | `dappUI.js` → `refreshAll()` ve `handleQuery()` (`etkinlikAdi`, `KAPASITE`, `toplamKayitSayisi`, `gorevli`, `kayitliMi`, `takmaAdlar`, `girisYapildiMi`) |
| State değiştiren işlem (write/transaction) — Kayıt | `dappUI.js` → `handleRegister()` → sözleşmenin `kaydol(nickname)` fonksiyonu |
| State değiştiren işlem (write/transaction) — Giriş Onayı | `dappUI.js` → `handleCheckIn()` → sözleşmenin `girisOnayla(adres)` fonksiyonu |
| 3 aşamalı işlem durumu yönetimi (onay/bekleme/makbuz) | `dappUI.js` → `runTransaction()` |
| Hata ayrıştırma ve Türkçeleştirme | `dappUI.js` → `extractErrorMessage()` |
| Sözleşme adresi/ABI yapılandırması | [`web/src/config/contractConfig.js`](web/src/config/contractConfig.js) |

## Akıllı Sözleşme Testleri

```bash
npm test
```

[`test/EtkinlikKayit.test.js`](test/EtkinlikKayit.test.js) dosyası, İP 21
(kapasite/kural testleri) ve İP 22 (görevli/giriş kontrolü testleri)
şartnamesindeki tüm senaryoları kapsar; tüm testler (11/11) yerel Hardhat
ağında başarıyla geçer.

## Güvenlik Notları

- Repoda hiçbir gerçek/test private key, mnemonic, seed veya API anahtarı
  **yoktur**; bu tür değerler sadece yerel, `.gitignore` ile dışarıda
  tutulan bir `.env` dosyasında tutulur (bkz. [`.env.example`](.env.example)).
- Modül 1'deki hassas alanlar varsayılan olarak bulanıktır ve hiçbir
  zaman `console.log`'a veya ağa gönderilmez.
- Modül 2'deki yetki kontrolü (giriş onayı) **sözleşmenin kendisinde**
  (`onlyGorevli` modifier'ı) uygulanır; arayüz bu kontrolü sadece bilgi
  amaçlı gösterir, tek güvenlik katmanı olarak kullanılmaz.
