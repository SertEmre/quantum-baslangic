// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * EtkinlikKayit_v1 (İP 20 - İlk Sürüm)
 * -------------------------------------
 * Bu, kendi etkinlik kayıt sistemimizin EN İLK ve EN BASİT sürümüdür.
 * Kasıtlı olarak kural/kapasite/yetki kontrolü İÇERMEZ; bunlar v2 ve v3'te
 * eklenecek. İP 21'de istendiği gibi bu dosya SİLİNMEDEN korunuyor, çünkü
 * değişikliklerin geçmişini (v1 -> v2 -> v3) depoda görünür tutmak istiyoruz.
 */
contract EtkinlikKayit_v1 {
    // public: Solidity otomatik olarak bir "getter" fonksiyonu üretir.
    // Yani dışarıdan etkinlikAdi() çağrısıyla okunabilir.
    string public etkinlikAdi;

    // mapping(address => string): her Ethereum adresinin KENDİSİNE ait
    // TEK BİR takma ad alanı vardır. Veri EVM'in "storage" bölgesinde,
    // yani zincirde kalıcı ve herkese açık (şifreli değil, sadece okunabilir).
    // Anahtar (adres) yoksa varsayılan değer boş string ("") döner; mapping'de
    // "var mı yok mu" bilgisi tutulmaz, bu yüzden boş string ile "hiç kayıt
    // olmamış" durumu v1'de ayırt edilemez (bu sınırlamayı v2 çözüyor).
    mapping(address => string) public takmaAdlar;

    constructor(string memory _etkinlikAdi) {
        etkinlikAdi = _etkinlikAdi;
    }

    /**
     * kaydol: çağıran kişi (msg.sender) kendi adına bir takma ad kaydeder.
     * msg.sender, EVM'in işlemi gönderen hesabı otomatik olarak sözleşmeye
     * ilettiği global değişkendir; bu sayede kullanıcı "ben" demek için
     * ekstra bir kimlik doğrulama yapmaz -- imza zaten kimliktir.
     * Burada HENÜZ boş ad kontrolü, tekrar kayıt kontrolü veya kapasite
     * sınırı YOKTUR (bilinçli olarak v1'de basit tutuldu).
     */
    function kaydol(string calldata _takmaAd) external {
        takmaAdlar[msg.sender] = _takmaAd;
    }

    // Herhangi bir adresin takma adını dışarıdan okumak için view fonksiyon.
    function takmaAdGetir(address _adres) external view returns (string memory) {
        return takmaAdlar[_adres];
    }
}
