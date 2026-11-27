const hre = require("hardhat");

async function main() {
  const [a1, a2] = await hre.ethers.getSigners();
  const Factory = await hre.ethers.getContractFactory("EtkinlikKayit_v1");
  const v1 = await Factory.deploy("Quantum Deneme Etkinligi");
  await v1.waitForDeployment();

  await (await v1.connect(a1).kaydol("ilkKullanici")).wait();
  await (await v1.connect(a2).kaydol("")).wait();

  console.log("Hesap 1 (" + a1.address + ") takma adi:", await v1.takmaAdGetir(a1.address));
  console.log(
    "Hesap 2 (" + a2.address + ") takma adi (bos string, reddedilmedi):",
    JSON.stringify(await v1.takmaAdGetir(a2.address))
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
