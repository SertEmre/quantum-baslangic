/**
 * walletUI.js — Modül 1 (İP 12 & İP 13): Kriptografik Eğitim Cüzdanı
 * Oluşturucu'nun DOM/arayüz katmanı. Tüm hesaplamalar crypto.js'den gelir;
 * burada SADECE görüntüleme ve kullanıcı etkileşimi vardır.
 *
 * GİZLİLİK: Bu dosya hiçbir hassas veriyi (entropi/mnemonic/seed/private key)
 * console.log ile yazdırmaz, hiçbir ağ isteğine (fetch/XHR) dahil etmez ve
 * Modül 2 (dApp) ile hiçbir şekilde paylaşmaz. Hassas alanlar varsayılan
 * olarak bulanık (blur) gösterilir.
 */
import {
  generateFullEducationalWallet,
  runOfficialTestVector,
  experimentWordSwap,
  getWordlist,
  OFFICIAL_TEST_VECTOR,
  DERIVATION_PATH_EXPLAINED,
} from "./crypto.js";

let currentWallet = null;
let selectedWordIndex = null;

export function mountWalletModule(root) {
  root.innerHTML = `
    <div class="card">
      <h2>🔐 Kriptografik Eğitim Cüzdanı Oluşturucu</h2>
      <p class="card-desc">
        Bu araç, <code>window.crypto.getRandomValues</code> ile üretilen
        gerçek 128-bit entropiden başlayarak bir Ethereum adresine kadar
        olan TÜM adımları gerçek kütüphane çağrılarıyla, adım adım gösterir.
        <strong>Math.random() veya Wallet.createRandom() KULLANILMAZ.</strong>
      </p>
      <button class="btn" id="btn-generate">🎲 Yeni Eğitim Cüzdanı Oluştur</button>
    </div>

    <div id="wallet-steps"></div>

    <div class="card">
      <h3>İsteğe Bağlı · BIP39 Resmî Test Vektörü Doğrulayıcı (İP 12)</h3>
      <p class="card-desc">
        Resmî BIP39 test vektörlerinden birini (16 byte sıfır entropi)
        kendi kütüphane kodumuzla hesaplayıp, bilinen resmî sonuçla
        birebir karşılaştırıyoruz. Bu, kullandığımız BIP39/BIP32
        implementasyonunun standartla uyumlu olduğunu kanıtlar.
      </p>
      <div class="row">
        <div style="flex:1; min-width:220px;">
          <label>Passphrase (resmi vektör varsayılanı: TREZOR)</label>
          <input type="text" id="tv-passphrase" value="${OFFICIAL_TEST_VECTOR.defaultPassphrase}" />
        </div>
        <button class="btn btn-secondary" id="btn-run-tv" style="margin-top:18px;">
          Test Vektörünü Çalıştır
        </button>
      </div>
      <div id="tv-result"></div>
    </div>

    <div class="card">
      <h3>Deney Alanı · BIP39 Checksum ve Kelime Değiştirme (İP 13 Madde 3)</h3>
      <p class="card-desc">
        Önce yukarıdan bir cüzdan oluşturun. Sonra 12 kelimeden birine
        tıklayıp, başka geçerli bir BIP39 kelimesiyle değiştirin.
        Checksum'ın neden "Kabul" veya "Ret" verdiğini canlı izleyin.
      </p>
      <div id="swap-experiment">
        <p class="card-desc">Önce bir cüzdan oluşturun ↑</p>
      </div>
    </div>
  `;

  root.querySelector("#btn-generate").addEventListener("click", () => {
    currentWallet = generateFullEducationalWallet("");
    selectedWordIndex = null;
    renderSteps(root);
    renderSwapExperiment(root);
  });

  root.querySelector("#btn-run-tv").addEventListener("click", () => {
    const passphrase = root.querySelector("#tv-passphrase").value;
    const result = runOfficialTestVector(passphrase);
    renderTestVectorResult(root, result, passphrase);
  });
}

// ---------------------------------------------------------------------------
function sensitiveBox(id, label, value) {
  return `
    <div class="sensitive-box">
      <label>${label}</label>
      <div class="mono sensitive-value" id="${id}">${value}</div>
      <button class="btn btn-secondary btn-small reveal-toggle" data-reveal="${id}">
        👁 İncelemek İçin Göster / Gizle
      </button>
    </div>
  `;
}

function infoBox(text) {
  return `<div class="info-box">${text}</div>`;
}

function renderSteps(root) {
  const w = currentWallet;
  const container = root.querySelector("#wallet-steps");

  container.innerHTML = `
    <div class="card">
      <h3><span class="step-badge">1</span>128-bit Entropi</h3>
      ${sensitiveBox("f-entropy-hex", "Hex Gösterim (16 byte)", w.entropyHex)}
      ${sensitiveBox("f-entropy-bin", "Binary Gösterim (128 bit)", w.entropyBinary)}
      <div class="mono" style="margin-top:10px; font-size:12.5px; color:var(--text-dim);">
        + SHA-256(entropi)'nin ilk 4 biti (checksum): <strong style="color:var(--text)">${w.checksumBits}</strong>
        <br/>128 bit + 4 bit = <strong style="color:var(--text)">132 bit</strong> → 132 / 11 = <strong style="color:var(--text)">12 kelime</strong>
      </div>
      ${infoBox(`<strong>Görev:</strong> Kriptografik olarak güvenli rastgelelik üretmek.
        <br/><strong>Kod:</strong> <code>window.crypto.getRandomValues(new Uint8Array(16))</code>
        ardından bütünlük/çek-toplamı için <code>sha256()</code> (@noble/hashes/sha256).`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">2</span>12 İngilizce Kelime (BIP39 Mnemonic)</h3>
      <div class="sensitive-box">
        <label>Mnemonic Kelimeler (indeksleriyle)</label>
        <div class="mnemonic-grid sensitive-value" id="f-mnemonic-grid">
          ${w.words
            .map(
              (word, i) =>
                `<div class="mnemonic-word"><span class="idx">${i + 1}</span>${word}</div>`
            )
            .join("")}
        </div>
        <button class="btn btn-secondary btn-small reveal-toggle" data-reveal="f-mnemonic-grid">
          👁 İncelemek İçin Göster / Gizle
        </button>
      </div>
      ${infoBox(`<strong>Görev:</strong> 132 bitlik (entropi+checksum) veriyi, her biri 11 bit olan
        12 parçaya bölüp, her parçayı BIP39 İngilizce sözlüğündeki (2048 kelime) karşılık gelen
        kelimeye çevirmek. Ek passphrase (BIP39 "25. kelime") bu araçta boş ("") kabul edilir.
        <br/><strong>Kod:</strong> <code>entropyToMnemonic(entropy, wordlist)</code> (@scure/bip39)</code>`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">3</span>Seed (512-bit / 64 Byte)</h3>
      ${sensitiveBox("f-seed", "Seed (Hex)", w.seedHex)}
      ${infoBox(`<strong>Görev:</strong> Mnemonic'i (+ passphrase) tek yönlü ve yavaş bir fonksiyonla
        (brute-force'u güçleştirmek için 2048 tekrar) 512-bit bir seed'e dönüştürmek.
        <br/><strong>Kod:</strong> <code>mnemonicToSeedSync(mnemonic, passphrase)</code>
        → iç yapıda <code>PBKDF2-HMAC-SHA512(mnemonic, salt="mnemonic"+passphrase, 2048 iterasyon, 64 byte)</code>`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">4</span>HD Cüzdan Türetme Yolu (BIP32 / BIP44)</h3>
      <table class="kv-table">
        <tr><td>Türetme Yolu</td><td class="mono">${w.path}</td></tr>
      </table>
      <table class="kv-table" style="margin-top:8px;">
        ${DERIVATION_PATH_EXPLAINED.map(
          (seg) => `<tr><td class="mono">${seg.segment}</td><td>${seg.meaning}</td></tr>`
        ).join("")}
      </table>
      ${sensitiveBox("f-master-key", "Master (Kök) Private Key — m", w.masterKeyHex)}
      ${sensitiveBox("f-child-key", "Türetilmiş (Child) Private Key — " + w.path, w.privateKeyHex)}
      ${infoBox(`<strong>Görev:</strong> Tek bir seed'ten, hiyerarşik ve deterministik (HD) biçimde
        sınırsız sayıda bağımsız anahtar çifti türetmek (BIP32), ve bu yolun Ethereum için standart
        anlamını (BIP44) uygulamak.
        <br/><strong>Kod:</strong> <code>HDKey.fromMasterSeed(seed)</code> ve
        <code>master.derive("m/44'/60'/0'/0/0")</code> (@scure/bip32)`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">5</span>Private Key (256-bit)</h3>
      ${sensitiveBox("f-privkey", "Private Key (Hex, 32 byte)", w.privateKeyHex)}
      ${infoBox(`<strong>Görev:</strong> Bu, türetilen hesabın GERÇEK gizli anahtarıdır — tüm imzalama
        gücü buradan gelir. BIP32 türetiminin doğrudan çıktısıdır, ekstra bir işlem gerektirmez.`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">6</span>Public Key (secp256k1)</h3>
      <div class="sensitive-box" style="border-style:solid;">
        <label>Compressed Public Key (33 byte) — gizli değildir, bilgi amaçlı gösterilir</label>
        <div class="mono">${w.publicKeyCompressedHex}</div>
      </div>
      <div class="sensitive-box" style="border-style:solid; margin-top:8px;">
        <label>Uncompressed Public Key (65 byte, 0x04 prefix)</label>
        <div class="mono">${w.publicKeyUncompressedHex}</div>
      </div>
      ${infoBox(`<strong>Görev:</strong> Private key'i secp256k1 eliptik eğrisi üzerinde bir noktayla
        (public key) eşleştirmek — bu işlem TEK YÖNLÜDÜR (public key'den private key'e geri dönülemez).
        <br/><strong>Kod:</strong> <code>secp256k1.ProjectivePoint.fromHex(compressedPubKey).toRawBytes(false)</code>
        (@noble/curves/secp256k1)`)}
    </div>

    <div class="card">
      <h3><span class="step-badge">7</span>Ethereum Adresi</h3>
      <table class="kv-table">
        <tr><td>Ham Adres (lowercase)</td><td class="mono">${w.rawAddress}</td></tr>
        <tr><td>EIP-55 Checksum Adresi</td><td class="mono">${w.checksumAddress}</td></tr>
      </table>
      ${infoBox(`<strong>Görev:</strong> Uncompressed public key'in (0x04 prefix hariç) Keccak-256
        hash'inin son 20 byte'ını almak, sonra EIP-55 kuralına göre bazı harfleri büyütüp bir
        "yazım hatası yakalama" checksum'ı eklemek.
        <br/><strong>Kod:</strong> <code>keccak_256(pubKey.slice(1)).slice(-20)</code> (@noble/hashes/sha3)
        + manuel EIP-55 checksum fonksiyonu`)}
    </div>
  `;

  container.querySelectorAll("[data-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = root.querySelector(`#${btn.dataset.reveal}`);
      target.classList.toggle("revealed");
    });
  });
}

// ---------------------------------------------------------------------------
function renderTestVectorResult(root, result, passphrase) {
  const el = root.querySelector("#tv-result");
  const seedBadge =
    result.seedMatches === null
      ? `<span class="badge badge-warn">Resmi karşılaştırma yalnızca passphrase="TREZOR" iken anlamlıdır</span>`
      : result.seedMatches
      ? `<span class="badge badge-ok">✅ Seed resmi vektörle BİREBİR eşleşiyor</span>`
      : `<span class="badge badge-danger">❌ Seed eşleşmiyor</span>`;

  el.innerHTML = `
    <div class="info-box" style="margin-top:14px;">
      <strong>Girdi Entropi:</strong> <span class="mono">${OFFICIAL_TEST_VECTOR.entropyHex}</span><br/>
      <strong>Hesaplanan Mnemonic:</strong> <span class="mono">${result.computedMnemonic}</span><br/>
      <strong>Beklenen Mnemonic:</strong> <span class="mono">${OFFICIAL_TEST_VECTOR.expectedMnemonic}</span><br/>
      ${
        result.mnemonicMatches
          ? '<span class="badge badge-ok">✅ Mnemonic BİREBİR eşleşiyor</span>'
          : '<span class="badge badge-danger">❌ Mnemonic eşleşmiyor</span>'
      }
      <hr class="divider" />
      <strong>Hesaplanan Seed:</strong> <span class="mono">${result.computedSeedHex}</span><br/>
      ${seedBadge}
    </div>
  `;
}

// ---------------------------------------------------------------------------
function renderSwapExperiment(root) {
  const container = root.querySelector("#swap-experiment");
  const w = currentWallet;

  container.innerHTML = `
    <p class="card-desc">Değiştirmek istediğiniz kelimeye tıklayın:</p>
    <div class="mnemonic-grid">
      ${w.words
        .map(
          (word, i) => `
        <div class="mnemonic-word selectable ${selectedWordIndex === i ? "selected" : ""}" data-word-idx="${i}">
          <span class="idx">${i + 1}</span>${word}
        </div>`
        )
        .join("")}
    </div>
    <div class="row" style="margin-top:12px;">
      <div style="flex:1; min-width:220px;">
        <label>Yeni kelime (geçerli bir BIP39 İngilizce kelimesi girin)</label>
        <input type="text" id="swap-new-word" placeholder="örn. zebra" list="bip39-wordlist-datalist" />
        <datalist id="bip39-wordlist-datalist">
          ${getWordlist()
            .slice(0, 200)
            .map((word) => `<option value="${word}"></option>`)
            .join("")}
        </datalist>
      </div>
      <button class="btn btn-secondary" id="btn-swap-run" style="margin-top:18px;" ${
        selectedWordIndex === null ? "disabled" : ""
      }>
        Değişikliği Dene
      </button>
    </div>
    <div id="swap-result"></div>
  `;

  container.querySelectorAll("[data-word-idx]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedWordIndex = Number(el.dataset.wordIdx);
      renderSwapExperiment(root);
    });
  });

  const runBtn = container.querySelector("#btn-swap-run");
  if (runBtn) {
    runBtn.addEventListener("click", () => {
      const newWord = container.querySelector("#swap-new-word").value.trim().toLowerCase();
      const result = experimentWordSwap(w.words, selectedWordIndex, newWord);
      renderSwapResult(container, result, selectedWordIndex, w.words[selectedWordIndex]);
    });
  }
}

function renderSwapResult(container, result, changedIndex, originalWord) {
  const el = container.querySelector("#swap-result");

  if (result.reason) {
    el.innerHTML = `<div class="info-box" style="border-color:var(--danger);">❌ ${result.reason}</div>`;
    return;
  }

  const verdictBadge = result.valid
    ? '<span class="badge badge-ok">✅ KABUL (checksum hâlâ geçerli)</span>'
    : '<span class="badge badge-danger">❌ RET (checksum bozuldu)</span>';

  el.innerHTML = `
    <div class="info-box" style="margin-top:14px;">
      <strong>Değişiklik:</strong> kelime ${changedIndex + 1}:
      <span class="mono">${originalWord}</span> →
      <span class="mono">${result.newWords[changedIndex]}</span>
      <br/><br/>
      <strong>Yeni Mnemonic:</strong> <span class="mono">${result.newMnemonic}</span>
      <hr class="divider" />
      <strong>Beklenen checksum (ilk 128 bitten yeniden hesaplanan):</strong>
      <span class="mono">${result.expectedChecksumBits}</span><br/>
      <strong>Mnemonic'in son 4 bitinde iddia edilen checksum:</strong>
      <span class="mono">${result.claimedChecksumBits}</span><br/>
      <strong>Manuel bit karşılaştırması:</strong>
      ${result.manualValid ? "Eşleşti ✅" : "Eşleşmedi ❌"}<br/>
      <strong>Kütüphane doğrulaması (validateMnemonic):</strong>
      ${result.libraryValid ? "Geçerli ✅" : "Geçersiz ❌"}
      <hr class="divider" />
      ${verdictBadge}
      <p style="margin-top:10px; color:var(--text-dim);">
        Not: 4 bitlik checksum alanı, 16 olası değerden sadece 1'ini "doğru" kabul eder.
        Bu yüzden rastgele seçilen YANLIŞ bir kelimenin de çakışıp checksum'ı
        "yanlışlıkla" tutturma ihtimali ortalama 1/16 (%6.25) civarındadır — yani
        checksum hatayı garantili değil, yüksek olasılıkla yakalar.
      </p>
    </div>
  `;
}
