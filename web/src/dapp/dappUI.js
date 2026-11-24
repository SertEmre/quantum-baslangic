/**
 * dappUI.js — Modül 2 (İP 24 & İP 25): Etkinlik Kayıt ve Giriş Kontrol Web
 * Uygulaması.
 *
 * ÖNEMLİ İZOLASYON KURALI (İP 24 Madde 7): Bu dosya Modül 1'den (cüzdan
 * oluşturucudan) HİÇBİR ŞEY import ETMEZ, hiçbir mnemonic/private key/seed
 * okumaz. Tüm imzalama işlemleri SADECE tarayıcıdaki MetaMask
 * (window.ethereum) üzerinden, ethers.js'in BrowserProvider'ı ile yapılır.
 */
import { BrowserProvider, Contract, formatEther } from "ethers";
import {
  getContractConfig,
  setContractConfig,
  ETKINLIK_KAYIT_V3_ABI,
  SEPOLIA_CHAIN_ID_DECIMAL,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_NAME,
  SEPOLIA_ETHERSCAN_BASE,
} from "../config/contractConfig.js";

let provider = null;
let signer = null;
let userAddress = null;
let currentChainIdHex = null;

export async function mountDappModule(root) {
  renderShell(root);
  wireStaticButtons(root);
  await refreshAll(root);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => refreshAll(root));
    window.ethereum.on("chainChanged", () => refreshAll(root));
  }
}

// ---------------------------------------------------------------------------
function renderShell(root) {
  const cfg = getContractConfig();

  root.innerHTML = `
    <div class="card">
      <h2>🎫 Etkinlik Kayıt ve Giriş Kontrol</h2>
      <p class="card-desc">
        Bu arayüz, Sepolia'daki <code>EtkinlikKayit_v3</code> sözleşmesiyle
        SADECE MetaMask üzerinden, doğrudan tarayıcıdan konuşur. Hiçbir
        aracı sunucu yoktur.
      </p>
      <div class="row">
        <button class="btn" id="btn-connect">🔌 Cüzdan Bağla</button>
        <button class="btn btn-secondary" id="btn-refresh">🔄 Bilgileri Yenile</button>
        <span id="wallet-address-badge"></span>
      </div>
      <div id="network-warning"></div>
    </div>

    <div class="card">
      <h3>Sözleşme Bilgileri</h3>
      <table class="kv-table" id="contract-info-table">
        <tr><td>Etkinlik Adı</td><td id="info-etkinlik-adi">—</td></tr>
        <tr><td>Maksimum Kapasite</td><td id="info-kapasite">—</td></tr>
        <tr><td>Mevcut Toplam Kayıt</td><td id="info-toplam-kayit">—</td></tr>
        <tr><td>Görevli (Admin) Adresi</td><td class="mono" id="info-gorevli">—</td></tr>
        <tr><td>Kullanılan Sözleşme Adresi</td><td class="mono" id="info-adres">${cfg.address}</td></tr>
      </table>
    </div>

    <div class="card">
      <h3>⚙️ Ayarlar</h3>
      <p class="card-desc">
        Test sırasında kapasite (3 kişi) dolup yeni bir sözleşme deploy
        ettiyseniz, adresi buradan güncelleyebilirsiniz — kod değişikliği
        gerekmez.
      </p>
      <div class="row">
        <div style="flex:1; min-width:280px;">
          <label>Sözleşme Adresi (Sepolia)</label>
          <input type="text" id="settings-address" value="${cfg.address}" placeholder="0x..." />
        </div>
        <div style="flex:1; min-width:220px;">
          <label>Deploy Tx Hash (opsiyonel, kayıt amaçlı)</label>
          <input type="text" id="settings-tx-hash" value="${cfg.deployTxHash || ""}" placeholder="0x..." />
        </div>
        <button class="btn btn-secondary" id="btn-save-settings" style="margin-top:18px;">
          Kaydet
        </button>
      </div>
    </div>

    <div class="card">
      <h3>Katılımcı Kayıt ve Sorgulama</h3>
      <div class="grid-2">
        <div>
          <label>Takma Ad (nickname)</label>
          <input type="text" id="register-nickname" placeholder="örn. emresert" />
          <button class="btn" id="btn-register" style="margin-top:10px;">✅ Kayıt Ol</button>
        </div>
        <div>
          <label>Sorgulanacak Adres (boş bırakılırsa bağlı hesap)</label>
          <input type="text" id="query-address" placeholder="0x..." />
          <button class="btn btn-secondary" id="btn-query" style="margin-top:10px;">🔍 Durumu Sorgula</button>
        </div>
      </div>
      <div id="participant-status" style="margin-top:14px;"></div>
      <div id="register-tx-status"></div>
    </div>

    <div class="card">
      <h3>👮 Görevli (Yetkili) Kontrol Alanı</h3>
      <p class="card-desc">
        ⚠️ Not: Buradaki yetki kontrolü sadece bir arayüz uyarısıdır — asıl
        güvenlik <code>onlyGorevli</code> ile SÖZLEŞMEDE uygulanır. Bu
        yüzden bağlı hesap görevli olmasa bile (uyarı rozetiyle) bu
        düğmeye basabilirsiniz; sözleşme işlemi reddedecektir
        (İP 25 Madde 5 test senaryosu).
      </p>
      <div id="gorevli-warning"></div>
      <label>Katılımcı Adresi</label>
      <input type="text" id="checkin-address" placeholder="0x..." />
      <button class="btn" id="btn-checkin" style="margin-top:10px;">🚪 Girişi Onayla</button>
      <div id="checkin-tx-status"></div>
    </div>
  `;
}

function wireStaticButtons(root) {
  root.querySelector("#btn-connect").addEventListener("click", () => connectWallet(root));
  root.querySelector("#btn-refresh").addEventListener("click", () => refreshAll(root));
  root.querySelector("#btn-save-settings").addEventListener("click", () => {
    const address = root.querySelector("#settings-address").value.trim();
    const deployTxHash = root.querySelector("#settings-tx-hash").value.trim();
    setContractConfig({ address, deployTxHash });
    refreshAll(root);
  });
  root.querySelector("#btn-register").addEventListener("click", () => handleRegister(root));
  root.querySelector("#btn-query").addEventListener("click", () => handleQuery(root));
  root.querySelector("#btn-checkin").addEventListener("click", () => handleCheckIn(root));

  root.querySelector("#settings-address").addEventListener("keydown", (e) => {
    if (e.key === "Enter") root.querySelector("#btn-save-settings").click();
  });
}

// ---------------------------------------------------------------------------
// Bağlantı ve Ağ Kontrolü
// ---------------------------------------------------------------------------
async function connectWallet(root) {
  if (!window.ethereum) {
    alert("MetaMask bulunamadı. Lütfen MetaMask eklentisini kurun.");
    return;
  }
  provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  await refreshAll(root);
}

async function detectNetwork() {
  if (!window.ethereum) return null;
  currentChainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  return currentChainIdHex;
}

function isOnSepolia() {
  return (
    currentChainIdHex &&
    currentChainIdHex.toLowerCase() === SEPOLIA_CHAIN_ID_HEX.toLowerCase()
  );
}

async function switchToSepolia(root) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // 4902: cüzdanda bu ağ henüz tanımlı değil -> ekleyelim.
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: SEPOLIA_NETWORK_NAME,
            nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: [SEPOLIA_ETHERSCAN_BASE],
          },
        ],
      });
    }
  }
  await refreshAll(root);
}

// ---------------------------------------------------------------------------
// Bilgi Yenileme
// ---------------------------------------------------------------------------
async function refreshAll(root) {
  await detectNetwork();
  renderWalletBadge(root);
  renderNetworkWarning(root);

  if (!window.ethereum) return;

  // Okuma işlemleri için cüzdan bağlı olmasa bile BrowserProvider kullanılabilir
  // (sadece view fonksiyonları çağrılıyor, imza gerekmiyor).
  try {
    const readProvider = new BrowserProvider(window.ethereum);
    const cfg = getContractConfig();
    const readContract = new Contract(cfg.address, ETKINLIK_KAYIT_V3_ABI, readProvider);

    const [etkinlikAdi, kapasite, toplamKayit, gorevli] = await Promise.all([
      readContract.etkinlikAdi(),
      readContract.KAPASITE(),
      readContract.toplamKayitSayisi(),
      readContract.gorevli(),
    ]);

    root.querySelector("#info-etkinlik-adi").textContent = etkinlikAdi;
    root.querySelector("#info-kapasite").textContent = kapasite.toString();
    root.querySelector("#info-toplam-kayit").textContent = `${toplamKayit.toString()} / ${kapasite.toString()}`;
    root.querySelector("#info-gorevli").textContent = gorevli;
    root.querySelector("#info-adres").textContent = cfg.address;

    renderGorevliWarning(root, gorevli);
  } catch (err) {
    root.querySelector("#info-etkinlik-adi").textContent = "Okunamadı (adres/ağ ayarlarını kontrol edin)";
  }

  if (userAddress) {
    await handleQuery(root, userAddress);
  }
}

function renderWalletBadge(root) {
  const badge = root.querySelector("#wallet-address-badge");
  if (userAddress) {
    badge.innerHTML = `<span class="badge badge-ok">Bağlı: ${shortAddr(userAddress)}</span>`;
  } else {
    badge.innerHTML = `<span class="badge badge-warn">Cüzdan bağlı değil</span>`;
  }
}

function renderNetworkWarning(root) {
  const el = root.querySelector("#network-warning");
  if (!window.ethereum) {
    el.innerHTML = `<div class="status-box status-error">MetaMask bulunamadı.</div>`;
    return;
  }
  if (!isOnSepolia()) {
    el.innerHTML = `
      <div class="status-box status-error">
        ⚠️ Yanlış ağdasınız (şu anki chainId: ${currentChainIdHex}).
        Kayıt/giriş işlemleri yalnızca <strong>${SEPOLIA_NETWORK_NAME}</strong>
        (chainId ${SEPOLIA_CHAIN_ID_DECIMAL} / ${SEPOLIA_CHAIN_ID_HEX}) üzerinde gönderilebilir.
        <br/><button class="btn btn-small" id="btn-switch-network" style="margin-top:8px;">
          Sepolia Ağına Geç
        </button>
      </div>
    `;
    const switchBtn = el.querySelector("#btn-switch-network");
    if (switchBtn) switchBtn.addEventListener("click", () => switchToSepolia(root));
  } else {
    el.innerHTML = "";
  }
}

function renderGorevliWarning(root, gorevliAddress) {
  const el = root.querySelector("#gorevli-warning");
  if (!userAddress) {
    el.innerHTML = `<div class="info-box">Görevli kontrolü yapmak için önce cüzdanınızı bağlayın.</div>`;
    return;
  }
  const isGorevli = userAddress.toLowerCase() === gorevliAddress.toLowerCase();
  el.innerHTML = isGorevli
    ? `<span class="badge badge-ok">✅ Bağlı hesap GÖREVLİ</span>`
    : `<span class="badge badge-danger">⚠️ Bağlı hesap GÖREVLİ DEĞİL — sözleşme bu işlemi reddedecek (bilerek denenebilir)</span>`;
}

function shortAddr(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// ---------------------------------------------------------------------------
// Katılımcı Durumu Sorgulama
// ---------------------------------------------------------------------------
async function handleQuery(root, forcedAddress) {
  const inputAddress = root.querySelector("#query-address").value.trim();
  const address = forcedAddress || inputAddress || userAddress;
  const el = root.querySelector("#participant-status");

  if (!address) {
    el.innerHTML = `<div class="info-box">Sorgulamak için bir adres girin veya cüzdanınızı bağlayın.</div>`;
    return;
  }

  try {
    const cfg = getContractConfig();
    const readProvider = new BrowserProvider(window.ethereum);
    const readContract = new Contract(cfg.address, ETKINLIK_KAYIT_V3_ABI, readProvider);

    const [kayitli, takmaAd, girisYapildi] = await Promise.all([
      readContract.kayitliMi(address),
      readContract.takmaAdlar(address),
      readContract.girisYapildiMi(address),
    ]);

    el.innerHTML = `
      <table class="kv-table">
        <tr><td>Sorgulanan Adres</td><td class="mono">${address}</td></tr>
        <tr><td>Kayıtlı mı?</td><td>${kayitli ? '<span class="badge badge-ok">Evet</span>' : '<span class="badge badge-warn">Hayır</span>'}</td></tr>
        <tr><td>Takma Ad</td><td class="mono">${kayitli ? takmaAd : "—"}</td></tr>
        <tr><td>Etkinliğe Giriş Yaptı mı?</td><td>${girisYapildi ? '<span class="badge badge-ok">Evet</span>' : '<span class="badge badge-warn">Hayır</span>'}</td></tr>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<div class="status-box status-error">Durum okunamadı: ${extractErrorMessage(err)}</div>`;
  }
}

// ---------------------------------------------------------------------------
// Kayıt Olma (register) — 3 aşamalı işlem akışı
// ---------------------------------------------------------------------------
async function handleRegister(root) {
  const nickname = root.querySelector("#register-nickname").value.trim();
  const statusEl = root.querySelector("#register-tx-status");

  if (!signer) {
    statusEl.innerHTML = `<div class="status-box status-error">Önce cüzdanınızı bağlayın.</div>`;
    return;
  }
  if (!isOnSepolia()) {
    statusEl.innerHTML = `<div class="status-box status-error">Yanlış ağdasınız. Önce Sepolia'ya geçin.</div>`;
    return;
  }
  if (!nickname) {
    statusEl.innerHTML = `<div class="status-box status-error">❌ Takma ad boş olamaz. Lütfen bir takma ad girin.</div>`;
    return;
  }

  await runTransaction({
    statusEl,
    actionLabel: "Kayıt",
    sendTx: async () => {
      const cfg = getContractConfig();
      const writeContract = new Contract(cfg.address, ETKINLIK_KAYIT_V3_ABI, signer);
      return writeContract.kaydol(nickname);
    },
    onSuccess: async () => {
      root.querySelector("#register-nickname").value = "";
      await refreshAll(root);
    },
  });
}

// ---------------------------------------------------------------------------
// Giriş Onaylama (girisOnayla) — 3 aşamalı işlem akışı
// ---------------------------------------------------------------------------
async function handleCheckIn(root) {
  const participantAddress = root.querySelector("#checkin-address").value.trim();
  const statusEl = root.querySelector("#checkin-tx-status");

  if (!signer) {
    statusEl.innerHTML = `<div class="status-box status-error">Önce cüzdanınızı bağlayın.</div>`;
    return;
  }
  if (!isOnSepolia()) {
    statusEl.innerHTML = `<div class="status-box status-error">Yanlış ağdasınız. Önce Sepolia'ya geçin.</div>`;
    return;
  }
  if (!participantAddress) {
    statusEl.innerHTML = `<div class="status-box status-error">❌ Lütfen bir katılımcı adresi girin.</div>`;
    return;
  }

  await runTransaction({
    statusEl,
    actionLabel: "Giriş Onayı",
    sendTx: async () => {
      const cfg = getContractConfig();
      const writeContract = new Contract(cfg.address, ETKINLIK_KAYIT_V3_ABI, signer);
      return writeContract.girisOnayla(participantAddress);
    },
    onSuccess: async () => {
      await refreshAll(root);
    },
  });
}

// ---------------------------------------------------------------------------
// ORTAK 3-AŞAMALI İŞLEM YÖNETİCİSİ (İP 25 Madde 1-5)
//   Aşama 1: Cüzdan Onayı Bekleniyor
//   Aşama 2: Zincir Sonucu Bekleniyor (tx.hash oluştu, Etherscan linki hazır)
//   Aşama 3: Kesin Başarı (receipt.status === 1 doğrulandı)
// ---------------------------------------------------------------------------
async function runTransaction({ statusEl, actionLabel, sendTx, onSuccess }) {
  statusEl.innerHTML = `
    <div class="status-box status-pending">
      <span class="spinner"></span>Cüzdanınızda işlemi onaylamanız bekleniyor...
    </div>
  `;

  let tx;
  try {
    tx = await sendTx();
  } catch (err) {
    statusEl.innerHTML = renderErrorBox(err);
    return;
  }

  const txLink = `${SEPOLIA_ETHERSCAN_BASE}/tx/${tx.hash}`;
  statusEl.innerHTML = `
    <div class="status-box status-waiting">
      <span class="spinner"></span>İşlem ağa gönderildi, blok onayı (makbuz) bekleniyor...
      <br/><a href="${txLink}" target="_blank" rel="noopener">${txLink}</a>
    </div>
  `;

  try {
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      statusEl.innerHTML = `
        <div class="status-box status-success">
          ✅ İşlem Başarıyla Doğrulandı! (${actionLabel})
          <br/><a href="${txLink}" target="_blank" rel="noopener">${txLink}</a>
        </div>
      `;
      if (onSuccess) await onSuccess();
    } else {
      statusEl.innerHTML = `
        <div class="status-box status-error">
          ❌ İşlem zincirde çalıştı ama BAŞARISIZ oldu (status: 0).
          <br/><a href="${txLink}" target="_blank" rel="noopener">${txLink}</a>
        </div>
      `;
    }
  } catch (err) {
    // Makbuz beklenirken RPC/ağ bağlantısı koptuysa: BELİRSİZLİK durumu.
    // İşlemi KESİNLİKLE otomatik olarak yeniden göndermiyoruz.
    statusEl.innerHTML = `
      <div class="status-box status-error">
        ⚠️ İşlem sonucu bağlantı sorunu nedeniyle henüz doğrulanamadı.
        Lütfen işlemi tekrar göndermeden önce aşağıdaki Etherscan
        bağlantısından kontrol edin.
        <br/><a href="${txLink}" target="_blank" rel="noopener">${txLink}</a>
      </div>
    `;
  }
}

// ---------------------------------------------------------------------------
// Hata Yakalama ve Türkçe Açıklama
// ---------------------------------------------------------------------------
function renderErrorBox(err) {
  const message = extractErrorMessage(err);
  return `<div class="status-box status-error">❌ ${message}</div>`;
}

function extractErrorMessage(err) {
  // MetaMask'te kullanıcı imzayı reddetti (code 4001 / ACTION_REJECTED)
  if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
    return "İşlem reddedildi: MetaMask penceresinde imzayı onaylamadınız.";
  }

  // Sözleşmeden gelen revert sebebi (ethers v6 farklı alanlarda taşıyabilir)
  const revertReason =
    err?.reason ||
    err?.shortMessage ||
    err?.info?.error?.message ||
    err?.error?.message ||
    err?.data?.message;

  if (revertReason) {
    if (revertReason.includes("Takma ad bos olamaz")) {
      return "❌ Takma ad boş olamaz.";
    }
    if (revertReason.includes("Bu adres zaten kayitli")) {
      return "❌ Bu adres zaten kayıtlı — aynı adresle ikinci kez kayıt olunamaz.";
    }
    if (revertReason.includes("Etkinlik kapasitesi dolu")) {
      return "❌ Etkinlik kapasitesi (3 kişi) dolu — yeni kayıt kabul edilmiyor.";
    }
    if (revertReason.includes("Sadece gorevli bu islemi yapabilir")) {
      return "❌ Bu işlemi sadece görevli (admin) hesabı yapabilir. Bağlı hesap görevli değil.";
    }
    if (revertReason.includes("Bu adres kayitli degil")) {
      return "❌ Bu adres kayıtlı değil — kayıtsız bir adrese giriş onayı verilemez.";
    }
    if (revertReason.includes("Bu adres zaten giris yapti")) {
      return "❌ Bu adres zaten giriş yapmış — aynı adrese ikinci kez giriş onayı verilemez.";
    }
    return `❌ Sözleşme işlemi reddetti: ${revertReason}`;
  }

  return `❌ Beklenmeyen bir hata oluştu: ${err?.message || String(err)}`;
}
