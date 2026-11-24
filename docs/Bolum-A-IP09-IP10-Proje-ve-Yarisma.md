# Bölüm A: Proje ve Yarışma İncelemesi (İP 09 - İP 10)

## İP 09 — Gerçek Bir Blokzincir Projesini İncele: ENS (Ethereum Name Service)

**Resmî site:** https://ens.domains/
**Dokümantasyon:** https://docs.ens.domains/

### 1. Hangi problemi, kimler için çözüyor? On-chain / off-chain ayrımı

**Problem:** Ethereum adresleri (`0x81Dd700C459BF2806A1B5F2a349c89f0106A9036`
gibi) insan için okunması, hatırlanması ve hatasız kopyalanması zor
dizilerdir. ENS, bu adresleri `isim.eth` gibi okunabilir isimlere
eşleştirerek "blokzincirin DNS'i" rolünü oynar. Hedef kullanıcılar: kendi
adreslerini kolay hatırlanır bir isme bağlamak isteyen bireysel kullanıcılar,
kullanıcı adreslerini okunabilir göstermek isteyen cüzdan/dApp geliştiricileri
ve profil/sosyal bilgi (avatar, Twitter, e-posta) taşımak isteyen Web3
kimlikleri.

**On-chain (zincirde) olanlar:**
- `.eth` isimlerinin sahiplik kaydı (ENS Registry sözleşmesi).
- İsim → adres (ve adres → isim, "reverse resolution") eşleştirmelerini
  tutan **Resolver** sözleşmeleri.
- İsimlerin açık artırmayla/doğrudan kaydedilmesi ve yenileme işlemleri.

**Off-chain (zincir dışı) olanlar:**
- ENS'in resmî web arayüzü (app.ens.domains) — isim arama, satın alma,
  yönetim paneli; bu bir frontend'dir, zincirin kendisi değildir.
- Birçok cüzdan/uygulamanın ENS isimlerini *gösterirken* kullandığı
  önbellekleme/indexleme servisleri (performans için; nihai doğruluk kaynağı
  hep zincirdir).
- DNS entegrasyonu gibi bazı köprü özellikleri kısmen off-chain
  bileşenler içerir.

### 2. Neden blokzincir kullanıyor? Normal veritabanıyla ne değişirdi?

ENS blokzincir kullanıyor çünkü bir ismin sahipliği, **tartışmasız ve
kurcalanamaz** olmalı: kim bir ismi ilk kaydettiyse (ve ücretini/yenilemesini
ödediyse) o isim gerçekten ona aittir, hiçbir merkezi otorite (ENS'i
geliştiren ekip dahil) bunu tek taraflı olarak geri alamaz veya başkasına
veremez. Eğer normal bir veritabanıyla yapılsaydı: isimlerin sahipliği
veritabanını işleten şirkete bağlı olurdu (klasik bir DNS kayıt şirketi
gibi) — şirket isterse bir ismi geri alabilir, sansürleyebilir, ya da şirket
kapanırsa tüm kayıt sistemi ortadan kalkabilirdi. Blokzincir, bu güveni
"şirkete güven"den "matematiksel kurallara güven"e taşıyor.

### 3. Kullanıcı kime hangi konularda güveniyor?

- **ENS DAO'ya / akıllı sözleşme koduna:** İsim kayıt kurallarının
  (süre, ücret, yenileme mantığı) doğru ve adil kodlandığına güvenilir —
  kod açık kaynak ve denetlenmiştir ama hâlâ bir "insan tarafından yazılmış
  kurallara güven" unsuru taşır.
  <br>
- **Frontend'e (app.ens.domains):** Kullanıcı arayüzünün, gösterdiği
  bilgiyi (fiyat, sahiplik durumu) doğru yansıttığına güvenir — teorik
  olarak kötü niyetli bir frontend kullanıcıyı yanlış bir işlemi imzalamaya
  yönlendirebilir (zincirin kendisi bunu önlemez, kullanıcının işlemi
  dikkatlice okuması gerekir).
  <br>
- **Resolver sözleşmesine:** İsmin hangi adrese yönlendirildiği bilgisinin
  doğru tutulduğuna güvenilir (bu sözleşme kurcalanabilirse "isim.eth"
  yanlış bir adrese yönlendirilebilir — bu yüzden resolver seçimi/sahipliği
  kritik bir güven noktasıdır).

### Benim yorumum
**Güçlü taraf:** ENS'in isim sahipliğini zincirde tutması, isim
piyasasını tamamen şeffaf ve sansüre dirençli yapıyor — kimse "bu ismi senin
elinden alalım" diyemiyor, bu da özellikle Web3 kimliği/marka değeri olan
projeler için güçlü bir güven unsuru. **Sınırlama:** Kullanıcı deneyimi hâlâ
klasik DNS'e göre daha pahalı (her işlem gas gerektirir) ve daha yavaştır
(blok onayı beklemek gerekir); ayrıca "isim.eth hangi adrese işaret ediyor"
bilgisini güncellemeyi unutan ya da resolver'ı yanlış yapılandıran bir
kullanıcı, kendi hatasıyla fonlarını yanlış adrese yönlendirebilir —
merkezi bir DNS sağlayıcısının sunduğu "destek hattı/geri alma" güvenlik
ağı burada yoktur.

---

## İP 10 — Blokzincir Yarışması Şartnamesi İncelemesi (TEKNOFEST Blokzincir Yarışması)

> **Not:** Aşağıdaki inceleme, TEKNOFEST Blokzincir Yarışması'nın güncel
> şartnamesinin kendisinden gelen tam metin yerine, takımın paylaşacağı
> resmî şartnameye göre doldurulacak bir **şablon** olarak hazırlanmıştır.
> Güncel yıl şartnamesi teknofest.org üzerinden kontrol edilip aşağıdaki
> başlıklar doldurulmalıdır.

### Genel Çözülmesi İstenen Problemler (şablon)
- [ ] Gerçek bir sektör probleminin (finans, kimlik, tedarik zinciri, oy
  verme, sertifikasyon vb.) blokzincir ile çözülmesi.
- [ ] Çözümün sadece "blokzincir kullanmak için blokzincir kullanmak"
  olmaması; projenin neden merkezi bir sistemle çözülemediğinin
  gerekçelendirilmesi.
- [ ] Akıllı sözleşme(ler)in bir test ağında (testnet) çalışır biçimde
  deploy edilmiş olması.

### Beklenen Çıktılar (şablon)
| Çıktı | Açıklama |
|---|---|
| Ön başvuru / proje detay formu | Problem tanımı, çözüm özeti, teknik mimari |
| Teknik rapor | Mimari diyagramlar, kullanılan teknolojiler, sözleşme adresleri |
| Kaynak kod deposu | GitHub üzerinde README, kurulum talimatları ile |
| Sunum / demo videosu | Çalışan prototipin uçtan uca gösterimi |
| Jüri sunumu (varsa final aşaması) | Canlı demo + soru-cevap |

### Değerlendirme Ölçütleri (şablon — tipik kriterler)
- **Özgünlük / yenilikçilik:** Problem seçimi ve çözümün farklılığı.
- **Teknik yeterlilik:** Kodun çalışması, sözleşmelerin güvenliği, test
  kapsamı.
- **Uygulanabilirlik / etki:** Çözümün gerçek bir ihtiyacı karşılama
  potansiyeli.
- **Sunum kalitesi:** Problemin ve çözümün açık, anlaşılır anlatımı.
- **Takım çalışması ve zaman yönetimi:** Projenin zamanında ve eksiksiz
  teslim edilmesi.

> Takım lideri/mentor şartnamenin güncel PDF/duyuru metnini paylaştığında bu
> tablo, şartnamedeki birebir madde numaraları ve ağırlıklarla
> güncellenmelidir.

### Benim yorumum
Bu oryantasyon programında öğrendiğim konulardan yarışmada en çok işime
yarayacağını düşündüklerim: **(1) İşlemin yolculuğu (İP 07)** —
cüzdan onayı, pending, receipt/status ayrımını bilmek, demo sırasında "neden
işlem hâlâ bekliyor" gibi soruları canlı olarak doğru açıklayabilmemi
sağlayacak; **(2) Güvenlik kontrolünün sözleşmede olması gerektiği ilkesi
(İP 22-25)** — jürinin "arayüzü atlayıp doğrudan sözleşmeye saldırsam ne
olur" diye sorması çok olası bir senaryo, ve bizim projemizde yetki
kontrolünün (`onlyGorevli`) frontend'de değil zincirde olduğunu
gösterebilmek güçlü bir teknik yeterlilik kanıtı olacak; **(3) Test ağı/
mainnet ayrımı ve gas/ücret mantığı (İP 04, İP 07)** — jüriye "bu prototip
gerçek parayla aynı güvenlik garantilerine sahip, sadece ekonomik değeri
yok" diye doğru çerçevede sunum yapabilmemi sağlayacak.
