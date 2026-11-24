/**
 * crypto.js — Modül 1'in TÜM kriptografik mantığı burada toplanır.
 * Bu dosya SADECE saf (pure) fonksiyonlar içerir, DOM'a dokunmaz.
 *
 * KURAL: Math.random() veya Wallet.createRandom() gibi "kutu kapalı" kısa
 * yollar KULLANILMAZ. Her adım, ilgili düşük seviyeli kütüphane
 * çağrısıyla AYRI AYRI yapılır, böylece her adımın ne işe yaradığı
 * izlenebilir ve ekranda gösterilebilir.
 */

import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";
import { secp256k1 } from "@noble/curves/secp256k1";
import {
  entropyToMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";

export const ETH_DERIVATION_PATH = "m/44'/60'/0'/0/0";

// ---------------------------------------------------------------------------
// ADIM 1: 128-bit Kriptografik Olarak Güvenli Entropi
// ---------------------------------------------------------------------------
/**
 * window.crypto.getRandomValues, işletim sisteminin kriptografik olarak
 * güvenli rastgele sayı üretecini (CSPRNG) kullanır. Math.random() ise
 * tahmin edilebilir bir sözde-rastgele üreteçtir (PRNG) ve ASLA
 * anahtar/mnemonic üretiminde kullanılmamalıdır — bu yüzden burada
 * kesinlikle Math.random() çağrılmaz.
 */
export function generateEntropy128() {
  const entropy = new Uint8Array(16); // 16 byte = 128 bit
  window.crypto.getRandomValues(entropy);
  return entropy;
}

export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex) {
  const clean = hex.replace(/^0x/, "");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

export function bytesToBinary(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// ADIM 1b: Checksum (BIP39) — SHA-256(entropi)'nin ilk 4 biti
// ---------------------------------------------------------------------------
/**
 * BIP39, 128-bit entropiye, bütünlük kontrolü için SHA-256 hash'inin
 * ilk (entropyBitLength / 32) bitini ekler. 128 bit için bu 128/32 = 4 bit.
 * 128 + 4 = 132 bit → 132 / 11 = 12 kelime (her kelime 11 bit = 2048
 * kelimelik sözlükten bir indeks).
 */
export function computeChecksumBits(entropy) {
  const hash = sha256(entropy);
  const hashBinary = bytesToBinary(hash);
  const checksumBitLength = entropy.length / 4; // 16 byte -> 4 bit
  return hashBinary.slice(0, checksumBitLength);
}

export function entropyAndChecksumToBits(entropy) {
  return bytesToBinary(entropy) + computeChecksumBits(entropy);
}

// ---------------------------------------------------------------------------
// ADIM 2: 132 biti 12 x 11-bit gruba bölüp BIP39 İngilizce sözlüğünden
// kelimelere çevirmek
// ---------------------------------------------------------------------------
export function bitsToWordIndices(bits132) {
  const indices = [];
  for (let i = 0; i < 12; i++) {
    const chunk = bits132.slice(i * 11, i * 11 + 11);
    indices.push(parseInt(chunk, 2));
  }
  return indices;
}

export function wordIndicesToWords(indices) {
  return indices.map((i) => wordlist[i]);
}

/**
 * Entropiden mnemonic üretir. @scure/bip39'un entropyToMnemonic fonksiyonu
 * yukarıdaki checksum + bit bölme adımlarını kütüphane içinde standart
 * BIP39 algoritmasıyla uygular; biz bu fonksiyonu "resmi referans" olarak
 * kullanırken, YUKARIDAKİ manuel fonksiyonlarla AYNI sonucu üretip
 * üretmediğini de karşılaştırarak öğrenci ekranında gösteriyoruz.
 */
export function entropyToWords(entropy) {
  const mnemonic = entropyToMnemonic(entropy, wordlist);
  return mnemonic.split(" ");
}

// ---------------------------------------------------------------------------
// ADIM 3: Seed (512-bit) — PBKDF2-HMAC-SHA512, 2048 iterasyon, salt "mnemonic"
// ---------------------------------------------------------------------------
export function mnemonicToSeed(mnemonic, passphrase = "") {
  // @scure/bip39: PBKDF2(HMAC-SHA512, mnemonic, salt="mnemonic"+passphrase, 2048 iter, 64 byte)
  return mnemonicToSeedSync(mnemonic, passphrase);
}

// ---------------------------------------------------------------------------
// ADIM 4: HD Cüzdan Türetme (BIP32 / BIP44) — m/44'/60'/0'/0/0
// ---------------------------------------------------------------------------
export function deriveHDNode(seed, path = ETH_DERIVATION_PATH) {
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);
  return { master, child };
}

/** BIP44 yolunun her kırılımının anlamını açıklayan yapı (eğitim amaçlı). */
export const DERIVATION_PATH_EXPLAINED = [
  { segment: "m", meaning: "Master (kök) anahtar — seed'ten doğrudan türetilir." },
  { segment: "44'", meaning: "Amaç (purpose): BIP44 standardını kullandığımızı belirtir (sabit)." },
  { segment: "60'", meaning: "Coin type: 60 = Ethereum (SLIP-44 kayıt listesine göre)." },
  { segment: "0'", meaning: "Hesap (account) indeksi: aynı seed'den birden fazla bağımsız 'hesap' türetilebilir." },
  { segment: "0", meaning: "Değişim (change): Bitcoin'den kalma bir alan; Ethereum'da genelde 0 (dış/external) kullanılır." },
  { segment: "0", meaning: "Adres indeksi: aynı hesap altında 0, 1, 2... şeklinde çoklu adres türetilebilir." },
];

// ---------------------------------------------------------------------------
// ADIM 5-6: Private Key / Public Key (secp256k1)
// ---------------------------------------------------------------------------
export function getUncompressedPublicKey(compressedPubKeyBytes) {
  const point = secp256k1.ProjectivePoint.fromHex(compressedPubKeyBytes);
  return point.toRawBytes(false); // 65 byte, 0x04 prefix + X(32) + Y(32)
}

// ---------------------------------------------------------------------------
// ADIM 7: Ethereum Adresi — keccak256(uncompressedPubKey[1:])'in son 20 byte'ı
// ---------------------------------------------------------------------------
export function publicKeyToAddress(uncompressedPubKeyBytes) {
  // uncompressedPubKeyBytes[0] = 0x04 prefix'tir, adres hesabına katılmaz.
  const pubKeyWithoutPrefix = uncompressedPubKeyBytes.slice(1);
  const hash = keccak_256(pubKeyWithoutPrefix);
  const addressBytes = hash.slice(-20); // son 20 byte (160 bit)
  return "0x" + bytesToHex(addressBytes);
}

/** EIP-55 checksum adresi: keccak256(lowercase adres STRING'i)'ne göre harf büyütme. */
export function toChecksumAddress(address) {
  const addr = address.toLowerCase().replace("0x", "");
  const hashBytes = keccak_256(new TextEncoder().encode(addr));
  const hashHex = bytesToHex(hashBytes);

  let result = "0x";
  for (let i = 0; i < addr.length; i++) {
    const char = addr[i];
    if (/[0-9]/.test(char)) {
      result += char; // rakamlar büyük/küçük harf taşımaz
      continue;
    }
    // hashHex'in ilgili hex hanesi >= 8 ise (yani ilk bit 1 ise) büyük harf
    const nibble = parseInt(hashHex[i], 16);
    result += nibble >= 8 ? char.toUpperCase() : char;
  }
  return result;
}

export function isValidChecksumAddress(address) {
  const stripped = address.startsWith("0x") ? address : "0x" + address;
  return toChecksumAddress(stripped) === stripped;
}

// ---------------------------------------------------------------------------
// TÜM AŞAMALARI ZİNCİRLEYEN YARDIMCI FONKSİYON
// ---------------------------------------------------------------------------
export function generateFullEducationalWallet(passphrase = "") {
  const entropy = generateEntropy128();
  const entropyHex = bytesToHex(entropy);
  const entropyBinary = bytesToBinary(entropy);
  const checksumBits = computeChecksumBits(entropy);
  const words = entropyToWords(entropy);
  const mnemonic = words.join(" ");

  const seed = mnemonicToSeed(mnemonic, passphrase);
  const { master, child } = deriveHDNode(seed, ETH_DERIVATION_PATH);

  const privateKey = child.privateKey; // Uint8Array(32)
  const publicKeyCompressed = child.publicKey; // Uint8Array(33)
  const publicKeyUncompressed = getUncompressedPublicKey(publicKeyCompressed);

  const rawAddress = publicKeyToAddress(publicKeyUncompressed);
  const checksumAddress = toChecksumAddress(rawAddress);

  return {
    entropy,
    entropyHex,
    entropyBinary,
    checksumBits,
    totalBits132: entropyBinary + checksumBits,
    words,
    mnemonic,
    seed,
    seedHex: bytesToHex(seed),
    masterKeyHex: bytesToHex(master.privateKey),
    path: ETH_DERIVATION_PATH,
    privateKey,
    privateKeyHex: bytesToHex(privateKey),
    publicKeyCompressed,
    publicKeyCompressedHex: bytesToHex(publicKeyCompressed),
    publicKeyUncompressed,
    publicKeyUncompressedHex: bytesToHex(publicKeyUncompressed),
    rawAddress,
    checksumAddress,
  };
}

// ---------------------------------------------------------------------------
// BIP39 RESMİ TEST VEKTÖRÜ DOĞRULAYICI (İP 12 - İsteğe bağlı görev)
// ---------------------------------------------------------------------------
/**
 * Resmi BIP39 test vektörlerinden biri (trezor/bip39 test suite):
 * entropi = 16 byte sıfır, passphrase = "TREZOR"
 */
export const OFFICIAL_TEST_VECTOR = {
  entropyHex: "00000000000000000000000000000000",
  expectedMnemonic:
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  defaultPassphrase: "TREZOR",
  expectedSeedHex:
    "c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e53495531f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04",
};

export function runOfficialTestVector(passphrase) {
  const entropy = hexToBytes(OFFICIAL_TEST_VECTOR.entropyHex);
  const mnemonic = entropyToWords(entropy).join(" ");
  const seed = mnemonicToSeed(mnemonic, passphrase);
  const seedHex = bytesToHex(seed);

  return {
    computedMnemonic: mnemonic,
    mnemonicMatches: mnemonic === OFFICIAL_TEST_VECTOR.expectedMnemonic,
    computedSeedHex: seedHex,
    seedMatches:
      passphrase === OFFICIAL_TEST_VECTOR.defaultPassphrase
        ? seedHex === OFFICIAL_TEST_VECTOR.expectedSeedHex
        : null, // farklı passphrase ile resmi seed karşılaştırması anlamsızdır
  };
}

// ---------------------------------------------------------------------------
// BIP39 KELİME DEĞİŞTİRME DENEY ALANI (İP 13 Madde 3)
// ---------------------------------------------------------------------------
export function wordToElevenBits(word) {
  const index = wordlist.indexOf(word);
  if (index === -1) return null;
  return index.toString(2).padStart(11, "0");
}

/**
 * 12 kelimelik bir mnemonic dizisinde tek bir kelimeyi değiştirip,
 * checksum'ın hâlâ geçerli olup olmadığını (Kabul/Ret) döner.
 * Hem manuel bit hesabını hem de kütüphanenin validateMnemonic sonucunu
 * birlikte göstererek ikisinin örtüştüğünü kanıtlar.
 */
export function experimentWordSwap(originalWords, indexToChange, newWord) {
  const newWords = [...originalWords];
  newWords[indexToChange] = newWord;
  const newMnemonic = newWords.join(" ");

  const bitsPerWord = newWords.map((w) => wordToElevenBits(w));
  if (bitsPerWord.includes(null)) {
    return {
      valid: false,
      reason: "Geçersiz BIP39 kelimesi (sözlükte yok)",
      newWords,
      newMnemonic,
    };
  }

  const totalBits = bitsPerWord.join("");
  const entropyBits = totalBits.slice(0, 128);
  const claimedChecksumBits = totalBits.slice(128);

  // entropyBits (string) -> byte dizisine çevir
  const entropyBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    entropyBytes[i] = parseInt(entropyBits.slice(i * 8, i * 8 + 8), 2);
  }
  const expectedChecksumBits = computeChecksumBits(entropyBytes);

  const manualValid = expectedChecksumBits === claimedChecksumBits;
  const libraryValid = validateMnemonic(newMnemonic, wordlist);

  return {
    valid: manualValid && libraryValid,
    manualValid,
    libraryValid,
    newWords,
    newMnemonic,
    entropyBits,
    claimedChecksumBits,
    expectedChecksumBits,
  };
}

export function getWordlist() {
  return wordlist;
}
