/**
 * contractConfig.js — İP 23'te Sepolia'ya deploy edilen EtkinlikKayit_v3
 * sözleşmesinin adresi, ABI'si ve ağ bilgilerini tutan tek merkezi dosya.
 *
 * Kapasite (3 kişi) dolup yeni bir sözleşme deploy edildiğinde, buradaki
 * DEFAULT_ADDRESS'i güncellemek YETERLİDİR — ayrıca arayüz üzerindeki
 * "Ayarlar" kutusundan da (kalıcı olarak tarayıcının localStorage'ında
 * saklanır) adres değiştirilebilir, kod değişikliği gerekmez.
 */

export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
export const SEPOLIA_NETWORK_NAME = "Sepolia Test Ağı";
export const SEPOLIA_ETHERSCAN_BASE = "https://sepolia.etherscan.io";

// --- Derleme Ayarları (İP 23'te Remix/Hardhat ile deploy ederken kullanılan) ---
export const COMPILER_SETTINGS = {
  solidityVersion: "0.8.20",
  optimizer: { enabled: true, runs: 200 },
  evmTarget: "paris",
};

/**
 * DEĞİŞTİRİLECEK ALAN: İP 23'te kendi deploy ettiğiniz EtkinlikKayit_v3
 * sözleşmesinin Sepolia adresini buraya yazın (veya arayüzdeki Ayarlar
 * kutusunu kullanın).
 */
const DEFAULT_CONFIG = {
  address: "0xa7Fc1B127dB1960fbFE32b8aD48ac623F9A9392E",
  deployTxHash: "",
  etkinlikAdi: "Quantum Takimi Final Etkinligi",
};

const STORAGE_KEY = "quantum_etkinlik_kayit_v3_config";

// Human-readable ABI (ethers v6 bu formatı doğrudan anlar).
export const ETKINLIK_KAYIT_V3_ABI = [
  "function etkinlikAdi() view returns (string)",
  "function KAPASITE() view returns (uint256)",
  "function toplamKayitSayisi() view returns (uint256)",
  "function gorevli() view returns (address)",
  "function takmaAdlar(address) view returns (string)",
  "function kayitliMi(address) view returns (bool)",
  "function girisYapildiMi(address) view returns (bool)",
  "function kaydol(string _takmaAd)",
  "function girisOnayla(address _katilimci)",
  "event KayitYapildi(address indexed katilimci, string takmaAd)",
  "event GirisYapildi(address indexed katilimci, address indexed onaylayanGorevli)",
];

export function getContractConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_CONFIG, ...stored };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setContractConfig(partial) {
  const current = getContractConfig();
  const next = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetContractConfig() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_CONFIG };
}
