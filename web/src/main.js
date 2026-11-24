import "./style.css";
import { mountWalletModule } from "./wallet/walletUI.js";
import { mountDappModule } from "./dapp/dappUI.js";

// --- Sekme (tab) geçiş mantığı ---
// Not: Bu dosya iki modülü SADECE görsel olarak aynı sayfada gösterir;
// aralarında hiçbir veri paylaşımı (özellikle gizli veri) YAPMAZ.
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = {
  wallet: document.getElementById("tab-wallet"),
  dapp: document.getElementById("tab-dapp"),
};

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
    Object.entries(panels).forEach(([key, panel]) => {
      panel.classList.toggle("active", key === target);
    });
  });
});

// Modül 1: Kriptografik Eğitim Cüzdanı Oluşturucu
mountWalletModule(panels.wallet);

// Modül 2: Etkinlik Kayıt ve Giriş Kontrol dApp
mountDappModule(panels.dapp);
