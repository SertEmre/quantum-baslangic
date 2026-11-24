// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * EtkinlikKayit_v3 (İP 22 & İP 23 - Final Sürüm)
 * -------------------------------------------------
 * v2'nin üzerine "giriş kontrolü" (check-in) ekliyoruz:
 *   - Sözleşmeyi deploy eden adres otomatik olarak "gorevli" (yetkili) olur.
 *   - SADECE gorevli, kayıtlı bir katılımcıyı "giriş yaptı" olarak
 *     işaretleyebilir (onlyGorevli modifier'ı ile).
 *   - Kayıtsız bir adrese giriş verilemez, aynı adrese iki kez giriş
 *     verilemez.
 *   - Yetki kontrolü SÖZLEŞMEDE yapılır; arayüz (frontend) sadece bir
 *     kolaylık katmanıdır, güvenlik sınırı DEĞİLDİR (İP 24 Madde 5'te
 *     bilerek görevli olmayan bir hesaptan deneme yapılabilmesinin nedeni
 *     budur: arayüz engellese de asıl ret burada, zincirde gerçekleşir).
 */
contract EtkinlikKayit_v3 {
    string public etkinlikAdi;
    uint256 public constant KAPASITE = 3;
    uint256 public toplamKayitSayisi;

    // Sözleşmeyi deploy eden (constructor'ı çalıştıran) adres. Bu adres
    // değişmez bir "admin" rolü üstlenir; private key'i kimsede olmayan
    // bir hesabın gorevli olması, giriş onaylarının sonsuza dek
    // yapılamaması anlamına gelir -- bu yüzden gerçek projelerde rol
    // değiştirme (transferOwnership gibi) fonksiyonları eklenir, ama bu
    // eğitim sürümünde kasıtlı olarak sabit tutuldu.
    address public gorevli;

    mapping(address => string) public takmaAdlar;
    mapping(address => bool) public kayitliMi;

    // Katılımcının etkinliğe fiziksel/sanal girişinin onaylanıp
    // onaylanmadığını tutan mapping.
    mapping(address => bool) public girisYapildiMi;

    event KayitYapildi(address indexed katilimci, string takmaAd);
    // GirisYapildi: hem giriş yapan katılımcıyı hem de onu onaylayan
    // görevliyi "indexed" olarak tutar, böylece Etherscan/indexer'da
    // "bu görevli kimleri içeri aldı" diye de filtrelenebilir.
    event GirisYapildi(address indexed katilimci, address indexed onaylayanGorevli);

    // modifier: tekrar eden bir "require" kontrolünü isimlendirip birden
    // fazla fonksiyonda yeniden kullanmamızı sağlar. "_;" yerine asıl
    // fonksiyon gövdesi çalışır.
    modifier onlyGorevli() {
        require(msg.sender == gorevli, "Sadece gorevli bu islemi yapabilir");
        _;
    }

    constructor(string memory _etkinlikAdi) {
        etkinlikAdi = _etkinlikAdi;
        gorevli = msg.sender;
    }

    function kaydol(string calldata _takmaAd) external {
        require(bytes(_takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(toplamKayitSayisi < KAPASITE, "Etkinlik kapasitesi dolu");

        takmaAdlar[msg.sender] = _takmaAd;
        kayitliMi[msg.sender] = true;
        toplamKayitSayisi += 1;

        emit KayitYapildi(msg.sender, _takmaAd);
    }

    /**
     * girisOnayla: SADECE gorevli çağırabilir (onlyGorevli). Hedef adresin
     * önce kayıtlı olması, sonra da henüz giriş yapmamış olması gerekir.
     * Görevli olmayan biri bu fonksiyonu çağırmayı denerse, EVM işlemi
     * cüzdana imzalatmadan ÖNCE (gas tahmini aşamasında) ya da işlem
     * zincire girdiğinde "revert" ile geri çevirir; arayüz bu düğmeyi
     * gizlemese bile zincir güvenliği bozulmaz.
     */
    function girisOnayla(address _katilimci) external onlyGorevli {
        require(kayitliMi[_katilimci], "Bu adres kayitli degil");
        require(!girisYapildiMi[_katilimci], "Bu adres zaten giris yapti");

        girisYapildiMi[_katilimci] = true;

        emit GirisYapildi(_katilimci, msg.sender);
    }

    function takmaAdGetir(address _adres) external view returns (string memory) {
        return takmaAdlar[_adres];
    }
}
