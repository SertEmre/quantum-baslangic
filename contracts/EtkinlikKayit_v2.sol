// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * EtkinlikKayit_v2 (İP 21 - Kapasite ve Kurallar Sürümü)
 * --------------------------------------------------------
 * v1'in üzerine üç kural ekliyoruz:
 *   1) Boş takma ad reddedilir.
 *   2) Aynı adres ikinci kez kayıt olamaz (artık "kayıtlı mı" bilgisini
 *      ayrı bir mapping ile net biçimde tutuyoruz; v1'deki "boş string mi
 *      yoksa hiç kayıt yok mu" belirsizliği burada çözülüyor).
 *   3) Toplam kayıt sayısı KAPASITE'yi (3 kişi) aşamaz.
 */
contract EtkinlikKayit_v2 {
    string public etkinlikAdi;

    // constant: derleme zamanında sabitlenir, storage'da yer kaplamaz,
    // okuması normal bir state değişkeninden daha ucuzdur (gas açısından).
    uint256 public constant KAPASITE = 3;

    // Şu ana kadar başarıyla kayıt olan kişi sayısı. Her başarılı kaydol()
    // çağrısında 1 artar; kapasite kontrolü bu sayaç üzerinden yapılır.
    uint256 public toplamKayitSayisi;

    mapping(address => string) public takmaAdlar;

    // v1'deki "boş string = kayıtsız" belirsizliğini ortadan kaldıran,
    // adresin kayıtlı olup olmadığını açıkça tutan mapping.
    mapping(address => bool) public kayitliMi;

    // Başarılı bir kayıt olduğunda zincire yazılan log. Frontend bu event'i
    // dinleyerek (ya da geçmiş loglarını tarayarak) ekranı güncelleyebilir,
    // her kayıt için ayrıca state okuma (eth_call) yapmak zorunda kalmaz.
    event KayitYapildi(address indexed katilimci, string takmaAd);

    constructor(string memory _etkinlikAdi) {
        etkinlikAdi = _etkinlikAdi;
    }

    /**
     * kaydol: üç "require" kontrolü sırayla çalışır; herhangi biri
     * başarısız olursa TÜM işlem geri alınır (revert) ve state hiç
     * değişmez -- kullanılan gas yine de harcanır (bu yüzden Remix/cüzdan
     * göndermeden önce eth_estimateGas ile bu hataları önceden yakalar).
     */
    function kaydol(string calldata _takmaAd) external {
        require(bytes(_takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(toplamKayitSayisi < KAPASITE, "Etkinlik kapasitesi dolu");

        takmaAdlar[msg.sender] = _takmaAd;
        kayitliMi[msg.sender] = true;
        toplamKayitSayisi += 1;

        emit KayitYapildi(msg.sender, _takmaAd);
    }

    function takmaAdGetir(address _adres) external view returns (string memory) {
        return takmaAdlar[_adres];
    }
}
