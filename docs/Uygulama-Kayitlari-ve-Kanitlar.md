# Uygulama Kayıtları ve Kanıtlar (İP 11, 13-19, 21-23, 25)

> Bu dosya, tarayıcı üzerinden (MetaMask, Faucet, Remix, Sepolia Etherscan ile)
> bizzat yapılacak manuel görevler için adım adım yönergeler ve
> doldurulacak hazır tablolar/*Benim yorumum* alanları içerir.
> Ekran görüntülerini [`docs/screenshots/`](screenshots/) klasörüne,
> açıklayıcı isimlerle (örn. `ip16-remix-register-tx.png`) kaydedin ve
> aşağıdaki ilgili satırlardan bağlantı verin.

---

## İP 11 — Git, GitHub, README, Commit, Push, Remix IDE, Solidity

### Kavram Açıklamaları
| Kavram | Kısa Açıklama |
|---|---|
| **Git** | Dosyalardaki değişiklikleri zaman içinde takip eden, dağıtık bir versiyon kontrol sistemi. |
| **GitHub** | Git depolarını (repository) internet üzerinden barındıran, işbirliği (PR, issue) araçları sunan platform. |
| **README** | Bir deponun ne olduğunu, nasıl kurulup çalıştırılacağını anlatan giriş dosyası (genelde `README.md`). |
| **Commit** | Değişikliklerin, açıklayıcı bir mesajla birlikte Git geçmişine kaydedilen anlık görüntüsü (snapshot). |
| **Push** | Yerel (local) commit'lerin uzak (remote, ör. GitHub) depoya gönderilmesi. |
| **Remix IDE** | Tarayıcı üzerinde çalışan, Solidity sözleşmelerini yazma/derleme/deploy/test etme aracı (remix.ethereum.org). |
| **Solidity** | Ethereum Virtual Machine (EVM) için akıllı sözleşme yazmaya yarayan, statik tipli programlama dili. |

### Benim yorumum
Git/GitHub ile Solidity/Remix arasındaki ilişki şöyle: Git bize **kodun
zaman içindeki geçmişini** güvenle takip etme imkânı verirken, blokzincirin
kendisi bize **state'in (verinin) zaman içindeki geçmişini** güvenle takip
etme imkânı veriyor — ikisi de "değiştirilemez geçmiş + denetlenebilirlik"
fikrine dayanıyor, sadece neyin geçmişini tuttukları (kod vs. veri)
farklı. Bu benzerlik, blokzincirin "neden immutable bir geçmiş önemli"
sorusunu anlamamı Git'i zaten bildiğim için kolaylaştırdı.

---

## İP 13 — MetaMask, EIP-55 Checksum ve Adres Doğrulama

### Adres Karşılaştırma Tablosu
| Alan | Değer |
|---|---|
| Uygulamada görünen adres (Modül 1 — Eğitim Cüzdanı Oluşturucu) | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` |
| MetaMask'teki aktif hesap adresi | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` |
| Birbirine eşit mi? | [x] Evet &nbsp;&nbsp; [ ] Hayır |

> Not: Modül 1'de üretilen mnemonic/private key, MetaMask'e manuel olarak
> içe aktarılmıştır (import). Bu, İP 24 Madde 7'deki izolasyon kuralını
> bozmaz — iki modül kod seviyesinde hâlâ birbirinden bağımsızdır, sadece
> aynı kişi aynı eğitim hesabını her iki yerde de kullanmayı tercih etmiştir.
> Ekran görüntüsü: [`ip13-adres-karsilastirma-ve-cuzdan-aktivitesi.png`](screenshots/ip13-adres-karsilastirma-ve-cuzdan-aktivitesi.png)

### EIP-55 Checksum Nedir?
Standart bir Ethereum adresi (`0x` + 40 hex karakter) **büyük/küçük harf
farkı olmadan** da geçerlidir (hex rakamları case-insensitive'dir). EIP-55,
adresin **harflerinin** (a-f) büyük/küçük yazımını, adresin kendisinin
Keccak-256 hash'ine göre belirleyen bir **karıştırılmış büyük/küçük harf
(mixed-case) checksum** standardıdır. Bu sayede aynı adres hem
"0xabc...": tamamen küçük harfle hem de doğru checksum'lı haliyle
yazılabilir; cüzdanlar checksum'lı formu kontrol ederek yazım hatalarını
(tek bir harfin yanlış girilmesi gibi) büyük olasılıkla yakalar.

### 1 Kelime/Karakter Değiştirme Deneyi
| Deneme | Değiştirilen Karakter | Sonuç |
|---|---|---|
| Orijinal adres | — | Checksum geçerli |
| 1 harf büyük/küçük değiştirildi | `_______` -> `_______` | [ ] Kabul edildi &nbsp; [ ] Reddedildi |

### Checksum'ın Matematiksel Hata Yakalama Sınırı
EIP-55 checksum'ı, adresin Keccak-256 hash'inin her bir hex hanesinin
**4 bitlik** bir değerinden türetilir (bu bit, ilgili harfin büyük mü küçük
mü yazılacağını belirler). Bu nedenle checksum'ın yakalayabileceği hata
alanı **4 bit** ile sınırlıdır: eğer bir karakter yanlış girilirse, yanlış
girilen karakterin checksum biti **rastgele** (~%50 ihtimalle) eski
checksum'la da uyuşabilir; ancak checksum'ın kapsadığı toplam hane sayısı
(adresteki harf sayısı) nedeniyle tüm adres için yanlış bir kelimenin de
hatalı biçimde "geçerli" görünme ihtimali daha düşüktür. Şartnamede verilen
**%6.25** oranı, `1/16`'ya eşittir (2⁻⁴) — yani **bir checksum biti yanlış
hesaplansa bile rastgele bir hata bitinin yine "doğru" ile çakışma
ihtimali 16'da 1'dir**. Bu, checksum'ın **kesin değil, olasılıksal** bir
hata yakalama mekanizması olduğunu gösterir: %100 garanti vermez, ama
yazım hatalarının büyük çoğunluğunu (yaklaşık %93.75 ihtimalle) yakalar.

### Benim yorumum
EIP-55'in "olasılıksal" bir doğrulama olması (checksum'ın %100 değil
~%93.75 ihtimalle hata yakalaması), onu kriptografik imzalardan
(ECDSA gibi, pratik olarak sahteleme ihtimali astronomik derecede düşük)
ayıran önemli bir noktadır. EIP-55 bir güvenlik mekanizması değil, bir
**kullanıcı hatası yakalama (typo-detection) yardımcısıdır** — adresi
kopyala-yapıştır yaparken genelde %100 güvenlidir (hash değişmez), ama elle
yazarken/okurken oluşan rastgele bir hatayı her zaman yakalayamayabileceğini
bilerek, kritik işlemlerde (özellikle büyük tutarlarda) adresi elle
yazmak yerine her zaman kopyala-yapıştır ya da QR kod kullanmayı tercih
ederim.

---

## İP 14 — Sepolia Faucet

### Faucet Bilgileri
| Alan | Değer |
|---|---|
| Kullanılan Faucet adresi | `_____________________________________________` (hangi faucet sitesini kullandığını buraya yaz — ör. sepoliafaucet.com, Alchemy, Google Cloud Web3 Faucet) |
| Talep edilen test ETH miktarı | — (cüzdandaki güncel bakiye 0.0403 ETH; deploy/register işlemlerinde gas olarak bir kısmı harcandı, bkz. ekran görüntüsü) |
| Cüzdan adresi | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` |
| Ekran görüntüsü | [`ip14-15-faucet-bakiyeleri-eth-ve-usdc.png`](screenshots/ip14-15-faucet-bakiyeleri-eth-ve-usdc.png) |

### PoW Faucet'teki Tarayıcı Madenciliği Neden Sepolia'da Blok Üretmekle Aynı Şey Değildir?
Bazı faucet'ler, kötüye kullanımı (bot'ların sürekli test ETH çekmesini)
önlemek için kullanıcıdan tarayıcısında kısa süreli bir **PoW (proof-of-work)
bulmaca** çözmesini ister. Bu, **tamamen Sepolia ağının kendi
konsensüs mekanizmasından (PoS) bağımsız, faucet'in kendi sunucusunun
uyguladığı yerel bir "spam/rate-limit önleme" koşuludur.** Sepolia ağının
kendisi zaten **PoS** ile çalışır (validator'lar blok üretir); tarayıcınızda
çözdüğünüz PoW bulmaca, hiçbir şekilde bir Sepolia bloğunun üretilmesine
katkı sağlamaz, sadece faucet'in "bu istek gerçek bir insana mı ait, yoksa
bir bot'a mı" sorusuna kabaca bir cevap üretmesine yarar — zincire tamamen
harici bir mekanizmadır.

### Benim yorumum
Bu ayrımı anlamadan "faucet'te madencilik yaptım" demek, Sepolia'nın hâlâ
PoW kullandığı yanılgısına yol açabilir. Gerçekte faucet'in PoW
bulmacası, bir **kapıdaki güvenlik testi** gibidir (botları yavaşlatmak
içindir), ağın kendisinin blok üretim mekanizmasıyla hiçbir ilgisi yoktur
— bu da "aynı terim (PoW), tamamen farklı iki bağlamda kullanılabilir"
ilkesinin iyi bir örneğidir.

---

## İP 15 — Sepolia USDC (ERC-20) Transferi

### Kaynaklar
- Circle resmî Sepolia USDC Faucet: https://faucet.circle.com/
- Sepolia USDC sözleşme adresi: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### Native ETH Transferi ile ERC-20 USDC Transferi Karşılaştırması
| Alan | Native ETH Transferi | ERC-20 USDC Transferi |
|---|---|---|
| **To** | Alıcının kendi cüzdan adresi | USDC **sözleşme adresi** (`0x1c7D...7238`) — alıcı adresi `Input Data` içinde kodludur |
| **Value** | Gönderilen ETH miktarı (wei) | `0` (ETH transferi yapılmaz, value alanı boştur) |
| **Input Data** | Boş (`0x`) | `transfer(address,uint256)` fonksiyon çağrısı + parametreler (hex kodlu) |
| **Gas / Ücret** | Daha düşük (basit transfer, ~21.000 gas) | Daha yüksek (sözleşme kodu çalıştırılır, storage güncellenir) |
| **Logs / Token Transfer** | Log üretilmez | `Transfer(from, to, value)` event'i log olarak yayınlanır; Etherscan bunu "Token Transfer" olarak ayrıca gösterir |

### `wallet_watchAsset` (Cüzdanda Göstermek) ile Zincirde Almak Arasındaki Fark
`wallet_watchAsset`, MetaMask'e **sadece görsel olarak** "bu token'ı
listende göster" demektir — token sözleşmesinin adresini/sembolünü/ondalık
hassasiyetini cüzdana tanıtır. Bu işlem **zincire hiçbir şey yazmaz**, gas
gerektirmez, bir işlem DEĞİLDİR. Zincirde USDC'yi **gerçekten almak** ise
ancak bir faucet'ten veya başka bir adresten gerçek bir `transfer()` işlemi
aldığınızda gerçekleşir — bu, zincirde kayıtlı bir state değişikliğidir.
Bir token'ı cüzdanınızda "görmeniz", zincirde o token'dan bakiyeniz
olduğu anlamına gelmez; sadece arayüzün o bakiyeyi (0 da olsa) göstermeyi
bildiği anlamına gelir.

### Benim yorumum (USDC gönderirken ücret neden ETH bakiyesinden karşılanır?)
USDC bir **token**'dır, Sepolia ağının **native varlığı değildir** — gas
ücretleri EVM protokolü seviyesinde her zaman ağın native varlığıyla
(Sepolia'da test ETH) ödenir, hangi token'ı transfer ettiğinizden
bağımsız olarak. USDC transferi de aslında "USDC sözleşmesinin
`transfer()` fonksiyonunu çalıştır" diyen bir **zincir işlemidir**, ve her
zincir işlemi EVM'i çalıştırmak için gas harcar; bu gas her zaman native
varlıkla ödenir. Yani cüzdanınızda 1000 USDC olsa bile, **test ETH'niz
sıfırsa hiçbir USDC işlemi gönderemezsiniz** — bu, "arabanın deposundaki
yakıt (ETH) ile arabanın taşıdığı yük (USDC) farklı şeylerdir" benzetmesiyle
açıklanabilir.

---

## İP 16 — Takımın QuantumKayit Sözleşmesine Kayıt

**Sözleşme adresi (Sepolia):** `0x81Dd700C459BF2806A1B5F2a349c89f0106A9036`
**Kontrol sitesi:** https://haloclineblockchain.vercel.app

### Adımlar
1. [Remix IDE](https://remix.ethereum.org)'ı açın.
2. Sol menüden **"Deploy & Run Transactions"** sekmesine gidin.
3. **Environment** olarak `Injected Provider - MetaMask` seçin (MetaMask
   Sepolia ağında olmalı).
4. "At Address" kutusuna `0x81Dd700C459BF2806A1B5F2a349c89f0106A9036`
   yazıp **At Address** düğmesine basın (ABI'yi eşleştirmek için önce
   bu depodaki [`contracts/QuantumKayit.sol`](../contracts/QuantumKayit.sol)
   dosyasını derleyin, aynı sekmede Solidity derleyicisini kullanın).
5. Sözleşme listede görününce `register` fonksiyonunu açın, parametre
   olarak `"emresert"` yazın ve **transact** düğmesine basın.
6. MetaMask penceresinde işlemi onaylayın, makbuzu (receipt) bekleyin.

### Kayıt Tablosu
| Alan | Değer |
|---|---|
| Kullanılan kullanıcı adı | `emresert` |
| Gönderen adres (MetaMask) | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` |
| Tx hash | [`0xc14274a0822a6ab814e4b7fcf8a4cc3afdd949b2ac8b03f80947a053ab88c158`](https://sepolia.etherscan.io/tx/0xc14274a0822a6ab814e4b7fcf8a4cc3afdd949b2ac8b03f80947a053ab88c158) |
| Blok | 11993822 — 25 Ekim 2026, 22:28:00 UTC |
| Status | [x] 1 (Başarılı) &nbsp; [ ] 0 (Revert) |
| Kayıt sırası (`sira`) | 5 — yani bizden önce 4 takım üyesi daha kayıt olmuştu |
| Ekran görüntüsü | Doğrulama doğrudan Sepolia Etherscan'den yapılmıştır (tx hash linkine tıklayarak kontrol edilebilir); ayrıca bkz. [`ip13-adres-karsilastirma-ve-cuzdan-aktivitesi.png`](screenshots/ip13-adres-karsilastirma-ve-cuzdan-aktivitesi.png) (MetaMask "Etkinlik" sekmesinde "Register — Onaylandı" kaydı görünür). |

### İkinci Kez `register` Denemesi
Aynı cüzdanla `register("emresert")` ikinci kez çağrıldığında, Remix
işlemi imzalatmadan ÖNCE **`eth_estimateGas`** (gas tahmini/simülasyon)
adımını çalıştırır; sözleşmedeki `require(!kayitli[msg.sender], ...)`
koşulu bu simülasyonda da tutmayacağı için Remix genellikle **"execution
reverted"** uyarısını MetaMask'e hiç gidilmeden konsolda gösterir. Bu,
hatanın "işlem zincire gönderilip reddedilmesi" değil, "zincire
gönderilmeden ÖNCE yerel olarak tahmin edilip yakalanması" olduğunu
kanıtlar — gas harcamadan hata bulmanın bir yoludur.

| Deneme | Beklenen | Gözlemlenen |
|---|---|---|
| 2. `register` çağrısı | Reddedilir (zaten kayıtlı) | [ ] Simülasyon aşamasında hata &nbsp; [ ] İmza penceresine gidip zincirde revert oldu |

### Kontrol Sitesi Doğrulaması
`https://haloclineblockchain.vercel.app` adresinde kendi cüzdan adresimle
kayıt durumumu kontrol ettim: `[x] Kayıtlı görünüyor` `[ ] Görünmüyor`

Site, zinciri her 30 saniyede bir okuyup listeyi güncellediği için canlı bir
doğrulamadır (statik bir veritabanı değildir). Listede "Emre Sert" kaydı,
adres `0x86fa...d6c8`, tx `0xc14274a0...88c158` ile görünüyor — bu da
yukarıdaki Etherscan verisiyle birebir örtüşüyor.

### Benim yorumum
İkinci kaydın simülasyon aşamasında (gas tahmini sırasında) yakalanması,
bana EVM'in "tahmin" (`eth_estimateGas`) ile "gerçek çalıştırma" arasında
aynı mantığı iki kez çalıştırdığını gösterdi: önce yerel bir düğüm
üzerinde deneme amaçlı simüle edilir (ücretsiz, imza gerektirmez), sonra
gerçekten gönderilirse zincirde de aynı sonuç (revert) tekrar üretilir. Bu
"önce simüle et, sonra gönder" yaklaşımı, kullanıcıları gereksiz gas
harcamaktan koruyan önemli bir mühendislik kararı.

---

## İP 17 — Etherscan Üzerinde İşlem Analizi

### İşlem Alanları Açıklaması
| Alan | Açıklama |
|---|---|
| **From** | İşlemi imzalayıp gönderen cüzdan adresi |
| **To** | İşlemin hedefi (burada: `QuantumKayit` sözleşme adresi) |
| **Gas Used** | İşlemin gerçekte harcadığı gas miktarı |
| **Nonce** | Gönderen adresin bu işlem öncesindeki toplam işlem sayısı |
| **Status** | `Success` (1) ya da `Fail` (0) — execution sonucu |
| **Input Data** | Çağrılan fonksiyonun ve parametrelerinin hex-kodlanmış hâli |

### Decode Input Data ve Event Log
- Etherscan'de işlem sayfasında **"Click to see More" -> "Decode Input
  Data"** ile `register("emresert")` çağrısının insan-okunabilir hâli
  görülebilir.
  Ekran görüntüsü: `docs/screenshots/ip17-decode-input.png`
- **"Logs"** sekmesinde `Registered(address,string)` event'inin
  yayınlandığı görülür.
  Ekran görüntüsü: `docs/screenshots/ip17-event-log.png`

### Okuma Sonuçları (Read Contract)
Bu sonuçlar Remix/Etherscan üzerinden değil, doğrudan bir Sepolia RPC
endpoint'ine (`eth_call`) ethers.js ile bağlanılarak canlı olarak okundu
(İP 06'da bahsedilen "Explorer olmadan doğrudan RPC ile sorgulama" yöntemi):

| Fonksiyon | Girilen Parametre | Dönen Sonuç |
|---|---|---|
| `kayitliMi` | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` (kendi adresim) | `true` |
| `kayitSayisi` | — | `17` (benden sonra da başka üyeler kayıt oldu) |
| `tumKayitlar` → benim satırım | — | `{ uye: 0x86FAb8...81D6c8, isim: "emresert", sira: 5, zaman: 1792967280 }` |

### İP 07 Akış Şemasının Gerçek Tx Hash ile Güncellenmiş Hâli
```text
Tx Hash: 0xc14274a0822a6ab814e4b7fcf8a4cc3afdd949b2ac8b03f80947a053ab88c158
Etherscan Linki: https://sepolia.etherscan.io/tx/0xc14274a0822a6ab814e4b7fcf8a4cc3afdd949b2ac8b03f80947a053ab88c158
Gözlemlenen Status: [x] 1 (Başarılı)   [ ] 0 (Revert)
Nonce: 1        İşlem Ücreti: 0.000875314508753145 ETH
Blok: 11993822 (25 Ekim 2026, 22:28:00 UTC)
```

### Benim yorumum
Etherscan'in "Decode Input Data" özelliği, ham hex veriyi (`0xabcd1234...`)
ABI bilgisiyle eşleştirip insan-okunabilir hâle çevirerek, verify edilmiş
bir sözleşmenin ne kadar "şeffaf" hale geldiğini somut olarak gösterdi —
verify edilmemiş bir sözleşmede bu decode işlemi yapılamaz, kullanıcı sadece
ham byte dizisini görür.

---

## İP 18 & İP 19 — Kendi QuantumKayit Kopyamı Deploy Etme ve Verify Etme

### Adımlar
1. Remix'te [`contracts/QuantumKayit.sol`](../contracts/QuantumKayit.sol)'u
   açın, derleyin (Solidity 0.8.20, optimizer açık/kapalı — kendi notunuzu
   düşün).
2. **Environment**'ı `Injected Provider - MetaMask` (Sepolia) yapın.
3. **Deploy** düğmesine basın (constructor parametresi yoktur), MetaMask'te
   onaylayın.
4. Deploy olan adresi not alın, Etherscan'de açın.
5. Etherscan'de **"Verify and Publish"**: derleyici sürümü (0.8.20),
   optimizer ayarı (Remix'teki ile birebir aynı) ve kaynak kodu yapıştırarak
   doğrulayın.

### Deploy Bilgileri
| Alan | Değer |
|---|---|
| Kendi deploy ettiğim adres | [`0x4914bBA9A4119d2a98172a7bbC4e500Ab9706eB0`](https://sepolia.etherscan.io/address/0x4914bBA9A4119d2a98172A7Bbc4e500Ab9706eB0) |
| Deploy tx hash | `0xb573bc53216ffe95a8f0005071ed2bb7f5044cbe6fcd141f840c01d741febfe7` |
| Deploy bloğu | 11993868 — 25 Ekim 2026, 22:37:24 UTC |
| Verify durumu | [x] Başarılı — "Source Code Verified", derleyici: Solidity 0.8.34, optimizer kapalı |
| Ekran görüntüsü (Deploy) | [`ip18-kendi-sozlesme-deploy-tx.png`](screenshots/ip18-kendi-sozlesme-deploy-tx.png) |

### Deploy vs At Address Farkı
**Deploy**, sıfırdan yeni bir bytecode + yeni, boş bir storage ile **yeni
bir adres** oluşturur (siz sahibisiniz, kendi state'inizle başlarsınız).
**At Address**, var olan (başka biri tarafından zaten deploy edilmiş) bir
adrese, sadece ABI eşleştirerek "bağlanmaktır" — yeni bir şey oluşturmaz,
mevcut state'i (ve varsa mevcut kayıtları) okur/değiştirirsiniz.

### Kendi Sözleşmeme Kayıt
| Alan | Değer |
|---|---|
| Kullanılan kullanıcı adı | `emresert` |
| Tx hash | [`0xf4d7b70b1ea6f36ce705e099071869ec2365bbd831c7012c803f690bb344de99`](https://sepolia.etherscan.io/tx/0xf4d7b70b1ea6f36ce705e099071869ec2365bbd831c7012c803f690bb344de99) |
| Blok | 11993926 — 25 Ekim 2026, 22:49:12 UTC |
| Status | [x] 1 &nbsp; [ ] 0 |

### Remix ve Etherscan Aynı Ağdaki Sözleşmelere Nasıl İşlem Gönderebiliyor?
Her ikisi de **aynı MetaMask cüzdanına** (`window.ethereum`) bağlanıp,
kullanıcıdan işlemi imzalamasını ister; imzalanan işlem her iki araçtan da
**aynı Sepolia RPC ağına** gönderilir. Hangi arayüzün (Remix'in web
sayfası mı, Etherscan'in "Write Contract" sekmesi mi) işlemi
oluşturduğu zincir için önemsizdir — zincir sadece imzalı, geçerli bir
işlem görür. Bu, "arayüz değişebilir ama zincirin kuralları ve cüzdanın
imza yetkisi sabittir" ilkesinin iyi bir gösterimidir.

### Benim yorumum
Kendi sözleşmemi deploy edip verify ederken, Remix'teki derleyici
ayarlarının (versiyon + optimizer) Etherscan'deki ayarlarla **birebir**
eşleşmesi gerektiğini öğrendim — bir hane farkı bile "bytecode does not
match" hatasına yol açıyor. Bu, verify sürecinin aslında "iki farklı
ortamda aynı girdiyle aynı çıktının üretildiğini" doğrulayan deterministik
bir süreç olduğunu net biçimde gösterdi.

---

## İP 20 & İP 23 — EtkinlikKayit_v3'ü Sepolia'ya Deploy Etme

v1 → v2 → v3 sürümleri [`contracts/`](../contracts/) klasöründe geliştirildi
ve hepsi [`test/EtkinlikKayit.test.js`](../test/EtkinlikKayit.test.js) ile
otomatik test edildi (bkz. aşağıdaki İP 21 & İP 22 deney tabloları). Final
sürüm (v3), Remix üzerinden gerçek Sepolia ağına deploy edildi:

| Alan | Değer |
|---|---|
| Deploy edilen sözleşme | `EtkinlikKayit_v3` |
| Sözleşme adresi (Sepolia) | [`0xa7Fc1B127dB1960fbFE32b8aD48ac623F9A9392E`](https://sepolia.etherscan.io/address/0xa7Fc1B127dB1960fbFE32b8aD48ac623F9A9392E) |
| Deploy eden adres | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` |
| Constructor parametresi (`_etkinlikAdi`) | `"Quantum Takimi Final Etkinligi"` |
| Zincirden doğrulanan `etkinlikAdi()` | `"Quantum Takimi Final Etkinligi"` ✅ |
| Zincirden doğrulanan `KAPASITE()` | `3` ✅ |
| Zincirden doğrulanan `gorevli()` | `0x86FAb8EDB3Dc20C63d3194DF43F5BCb87781D6c8` ✅ (deploy eden adresle eşleşiyor) |
| Etherscan Verify durumu | ⚠️ **Henüz yapılmadı** — bkz. aşağıdaki "Yapılacak" notu |
| `web/src/config/contractConfig.js` güncellendi mi? | ✅ Evet, `DEFAULT_CONFIG.address` bu adresle güncellendi |

### Modül 2 (Etkinlik dApp) ile Uçtan Uca Canlı Test (İP 24 & İP 25)

Web uygulaması gerçek MetaMask ile bu sözleşmeye bağlanarak test edildi:

| Adım | Sonuç | Kanıt |
|---|---|---|
| Cüzdan bağlama + ağ kontrolü | ✅ Sepolia'da bağlı, "Bağlı hesap GÖREVLİ" rozeti doğru çıktı | — |
| `kaydol("emresert")` | ✅ Başarılı | tx [`0xf2cf3046b9a688b0ada9792cee9257c7d05a8018860d557ce4bb7439c3be19cf`](https://sepolia.etherscan.io/tx/0xf2cf3046b9a688b0ada9792cee9257c7d05a8018860d557ce4bb7439c3be19cf) |
| Zincirden doğrulama: `kayitliMi` / `takmaAdlar` / `toplamKayitSayisi` | ✅ `true` / `"emresert"` / `1` | Doğrudan RPC `eth_call` ile bağımsız doğrulandı |
| `girisOnayla(kendi adresim)` (görevli olarak) | ✅ Başarılı | Arayüzde "İşlem Başarıyla Doğrulandı" |
| Zincirden doğrulama: `girisYapildiMi` | ✅ `true` | Doğrudan RPC `eth_call` ile bağımsız doğrulandı |
| 3 aşamalı işlem durumu (onay bekleniyor → zincir bekleniyor → doğrulandı) | ✅ Her iki işlemde de arayüzde gözlemlendi | — |

Bu, İP 24-25'teki "golden path" (temel başarı senaryosu) akışının gerçek
Sepolia ağında, gerçek bir MetaMask cüzdanıyla uçtan uca çalıştığını
kanıtlar. Hata senaryoları (boş ad, çift kayıt, kapasite dolu, yetkisiz
giriş onayı) ise [`test/EtkinlikKayit.test.js`](../test/EtkinlikKayit.test.js)
ile otomatik olarak doğrulanmıştır (11/11 test geçti) — aynı mantık hem
manuel hem otomatik olarak iki kez teyit edilmiş oldu.

> **Yapılacak (opsiyonel ama önerilir):** QuantumKayit'te yaptığın gibi
> (İP 19), bu sözleşmeyi de Etherscan'de **Verify and Publish** ile
> doğrula — derleyici sürümü ve optimizer ayarını Remix'teki ile birebir
> aynı tut. Verify etmeden de sözleşme tamamen çalışır durumda; verify
> sadece kaynak kodun şeffaf görünmesini sağlar.

### Benim yorumum
v1'den v3'e geçerken en çok dikkatimi çeken şey, her sürümün bir öncekinin
**üzerine kural eklemesiydi, mantığı değiştirmemesiydi** — v2, v1'in
`kaydol` fonksiyonunun iskeletini korudu, sadece başına `require`
kontrolleri ekledi; v3, v2'nin tüm state'ini (kayıt mapping'leri) aynen
devraldı, üstüne sadece `gorevli`/`girisYapildiMi` ekledi. Bu, akıllı
sözleşme geliştirmede neden "sıfırdan yazmak" yerine "küçük, test edilebilir
artışlarla büyütmek" tercih edildiğini net gösterdi: her adımda önceki
davranışı bozmadığımı otomatik testlerle (11/11 geçti) doğrulayabildim.

---

## İP 21 & İP 22 — Deney Tabloları

### İP 21 Deney Tablosu (EtkinlikKayit_v2 — 5 Senaryo)
| Deneme | Beklenen Sonuç | Gözlemlenen Sonuç | Açıklama |
|---|---|---|---|
| 1. Geçerli takma adla kayıt | Başarılı, `KayitYapildi` event'i | ✅ Başarılı (bkz. `test/EtkinlikKayit.test.js`) | `require` koşulları geçti, state güncellendi |
| 2. Boş takma ad ile kayıt | Reddedilir | ✅ `"Takma ad bos olamaz"` ile revert | `bytes(_takmaAd).length > 0` kontrolü |
| 3. Aynı adresle 2. kayıt | Reddedilir | ✅ `"Bu adres zaten kayitli"` ile revert | `kayitliMi[msg.sender]` kontrolü |
| 4. 4. kişi kayıt (kapasite 3 dolu) | Reddedilir | ✅ `"Etkinlik kapasitesi dolu"` ile revert | `toplamKayitSayisi < KAPASITE` kontrolü |
| 5. 3 farklı adresle sırayla kayıt | Hepsi başarılı, sayaç = 3 | ✅ Üçü de başarılı, `toplamKayitSayisi == 3` | Kapasite dolana kadar engel yok |

### İP 22 Deney Tablosu (EtkinlikKayit_v3 — 4 Senaryo)
| Deneme | Beklenen Sonuç | Gözlemlenen Sonuç | Açıklama |
|---|---|---|---|
| 1. Deploy eden adres gorevli mi? | `gorevli == deployer` | ✅ Eşleşiyor | `constructor`'da `gorevli = msg.sender` |
| 2. Görevli, kayıtlı katılımcıya giriş onayı | Başarılı, `GirisYapildi` event'i | ✅ Başarılı | `onlyGorevli` + kayıt kontrolleri geçti |
| 3. Görevli OLMAYAN hesap giriş onaylamaya çalışır | Reddedilir | ✅ `"Sadece gorevli bu islemi yapabilir"` ile revert | `onlyGorevli` modifier'ı |
| 4. Kayıtsız adrese giriş verilmeye çalışılır | Reddedilir | ✅ `"Bu adres kayitli degil"` ile revert | `kayitliMi[_katilimci]` kontrolü |

> Bu tablodaki tüm senaryolar [`test/EtkinlikKayit.test.js`](../test/EtkinlikKayit.test.js)
> dosyasında otomatik test olarak da doğrulanmıştır (`npx hardhat test`
> çalıştırıldığında 11/11 test başarılı).

### Benim yorumum (İP 21)
Bu deney tablosunu doldururken en çok öğretici olan şey, "beklenen" ile
"gözlemlenen" arasındaki farkı **otomatik testlerle** de doğrulayabilmemdi
— manuel Remix denemesiyle elde ettiğim sonuç, yazdığım Hardhat testiyle
birebir örtüştü. Bu, akıllı sözleşme geliştirmede manuel QA'in otomatik
testlerin yerini tutmadığını, ama ikisinin birbirini doğrulayan tamamlayıcı
adımlar olduğunu gösterdi.

### Benim yorumum (İP 22)
`onlyGorevli` modifier'ının reddettiği bir işlemin, arayüzde hiçbir özel
kontrol olmadan sadece zincirin kendisi tarafından durdurulması, "güvenliğin
asla sadece frontend'e güvenilerek sağlanamayacağı" ilkesini en net
gösteren deneyimdi — bu yüzden Modül 2'deki web uygulamasında bilerek
görevli olmayan bir hesaptan da "Girişi Onayla" düğmesine basılmasına izin
verdik; arayüz engellese de, engellemese de, asıl güvenlik sınırı zaten
sözleşmenin kendisinde.
