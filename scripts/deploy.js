const hre = require("hardhat");

/**
 * Kullanım:
 *   npx hardhat run scripts/deploy.js --network sepolia -- QuantumKayit
 *   npx hardhat run scripts/deploy.js --network sepolia -- EtkinlikKayit_v3 "Quantum Oryantasyon"
 *
 * İlk argüman deploy edilecek sözleşme adı, kalan argümanlar constructor
 * parametreleridir. QuantumKayit'in constructor'ı yoktur; EtkinlikKayit_v1/v2/v3
 * tek bir "etkinlikAdi" (string) parametresi alır.
 */
async function main() {
  const args = process.argv.slice(2);
  const contractName = args[0] || "EtkinlikKayit_v3";
  const constructorArgs = args.slice(1);

  console.log(`"${contractName}" sözleşmesi deploy ediliyor...`);
  console.log("Constructor argümanları:", constructorArgs);

  const Factory = await hre.ethers.getContractFactory(contractName);
  const contract = await Factory.deploy(...constructorArgs);
  await contract.waitForDeployment();

  const adres = await contract.getAddress();
  console.log(`✅ "${contractName}" başarıyla deploy edildi.`);
  console.log(`Sözleşme adresi: ${adres}`);
  console.log(
    `Etherscan'de doğrulamak için (Sepolia):\n` +
      `npx hardhat verify --network sepolia ${adres} ${constructorArgs
        .map((a) => `"${a}"`)
        .join(" ")}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
