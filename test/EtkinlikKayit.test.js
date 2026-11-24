const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Bu test dosyası, İP 21 (EtkinlikKayit_v2) ve İP 22 (EtkinlikKayit_v3)
 * şartnamesinde istenen tüm kabul/ret senaryolarını otomatik olarak
 * doğrular. Hardhat'in yerel ağı (in-memory) kullanılır; gerçek Sepolia'ya
 * hiç dokunulmaz, bu yüzden test tamamen ücretsiz ve hızlıdır.
 */
describe("EtkinlikKayit_v2 (İP 21 senaryoları)", function () {
  let v2;
  let sahipler;

  beforeEach(async function () {
    sahipler = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EtkinlikKayit_v2");
    v2 = await Factory.deploy("Quantum Takimi Oryantasyon Etkinligi");
    await v2.waitForDeployment();
  });

  it("Deneme 1: Geçerli bir takma adla kayıt başarılı olmalı", async function () {
    const [katilimci] = sahipler;
    await expect(v2.connect(katilimci).kaydol("emresert"))
      .to.emit(v2, "KayitYapildi")
      .withArgs(katilimci.address, "emresert");

    expect(await v2.kayitliMi(katilimci.address)).to.equal(true);
    expect(await v2.takmaAdlar(katilimci.address)).to.equal("emresert");
    expect(await v2.toplamKayitSayisi()).to.equal(1n);
  });

  it("Deneme 2: Boş takma ad ile kayıt reddedilmeli", async function () {
    const [katilimci] = sahipler;
    await expect(v2.connect(katilimci).kaydol("")).to.be.revertedWith(
      "Takma ad bos olamaz"
    );
  });

  it("Deneme 3: Aynı adresin ikinci kez kayıt olması reddedilmeli", async function () {
    const [katilimci] = sahipler;
    await v2.connect(katilimci).kaydol("ilkKayit");
    await expect(v2.connect(katilimci).kaydol("ikinciKayit")).to.be.revertedWith(
      "Bu adres zaten kayitli"
    );
  });

  it("Deneme 4: Kapasite (3 kişi) dolduktan sonra 4. kayıt reddedilmeli", async function () {
    const [k1, k2, k3, k4] = sahipler;
    await v2.connect(k1).kaydol("katilimci1");
    await v2.connect(k2).kaydol("katilimci2");
    await v2.connect(k3).kaydol("katilimci3");

    expect(await v2.toplamKayitSayisi()).to.equal(3n);

    await expect(v2.connect(k4).kaydol("katilimci4")).to.be.revertedWith(
      "Etkinlik kapasitesi dolu"
    );
  });

  it("Deneme 5: Farklı adresler kapasite dolana kadar sırayla kayıt olabilmeli", async function () {
    const [k1, k2, k3] = sahipler;
    await v2.connect(k1).kaydol("a");
    await v2.connect(k2).kaydol("b");
    await v2.connect(k3).kaydol("c");

    expect(await v2.toplamKayitSayisi()).to.equal(3n);
    expect(await v2.kayitliMi(k1.address)).to.equal(true);
    expect(await v2.kayitliMi(k2.address)).to.equal(true);
    expect(await v2.kayitliMi(k3.address)).to.equal(true);
  });
});

describe("EtkinlikKayit_v3 (İP 22 senaryoları)", function () {
  let v3;
  let gorevli, katilimci1, katilimci2, yabanci;

  beforeEach(async function () {
    [gorevli, katilimci1, katilimci2, yabanci] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EtkinlikKayit_v3");
    // deploy eden hesap (gorevli) otomatik olarak sözleşmenin "gorevli"si olur.
    v3 = await Factory.connect(gorevli).deploy("Quantum Takimi Final Etkinligi");
    await v3.waitForDeployment();
  });

  it("Deneme 1: Deploy eden adres otomatik olarak gorevli olmalı", async function () {
    expect(await v3.gorevli()).to.equal(gorevli.address);
  });

  it("Deneme 2: Görevli, kayıtlı bir katılımcının girişini onaylayabilmeli", async function () {
    await v3.connect(katilimci1).kaydol("emresert");

    await expect(v3.connect(gorevli).girisOnayla(katilimci1.address))
      .to.emit(v3, "GirisYapildi")
      .withArgs(katilimci1.address, gorevli.address);

    expect(await v3.girisYapildiMi(katilimci1.address)).to.equal(true);
  });

  it("Deneme 3: Görevli olmayan bir hesabın giriş onaylaması reddedilmeli", async function () {
    await v3.connect(katilimci1).kaydol("emresert");

    await expect(
      v3.connect(yabanci).girisOnayla(katilimci1.address)
    ).to.be.revertedWith("Sadece gorevli bu islemi yapabilir");
  });

  it("Deneme 4: Kayıtsız bir adrese giriş verilmesi reddedilmeli", async function () {
    await expect(
      v3.connect(gorevli).girisOnayla(katilimci2.address)
    ).to.be.revertedWith("Bu adres kayitli degil");
  });

  it("Deneme 5 (ek): Aynı adrese iki kez giriş onayı verilmesi reddedilmeli", async function () {
    await v3.connect(katilimci1).kaydol("emresert");
    await v3.connect(gorevli).girisOnayla(katilimci1.address);

    await expect(
      v3.connect(gorevli).girisOnayla(katilimci1.address)
    ).to.be.revertedWith("Bu adres zaten giris yapti");
  });

  it("Deneme 6 (ek): v3 de v2'deki kapasite ve tekrar-kayıt kurallarını korumalı", async function () {
    await v3.connect(katilimci1).kaydol("a");
    await expect(v3.connect(katilimci1).kaydol("b")).to.be.revertedWith(
      "Bu adres zaten kayitli"
    );
    await expect(v3.connect(katilimci2).kaydol("")).to.be.revertedWith(
      "Takma ad bos olamaz"
    );
  });
});
