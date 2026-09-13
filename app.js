// ===== Helpers partagés — app utilisateur GeStockCI =====

function formaterFCFA(nombre) {
  return Math.round(nombre).toLocaleString("fr-FR") + " FCFA";
}

function afficherToast(message, duree = 2600) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duree);
}

function afficherBanniereHorsLigne() {
  if (navigator.onLine) return;
  const b = document.createElement("div");
  b.className = "toast";
  b.style.bottom = "auto";
  b.style.top = "14px";
  b.textContent = I18N.t("hors_ligne");
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 4000);
}
window.addEventListener("offline", afficherBanniereHorsLigne);

// Garde d'authentification : redirige vers login si non connecté,
// et récupère le profil boutique de l'utilisateur depuis Firestore.
function protegerPage(callback) {
  auth.onAuthStateChanged(async (utilisateur) => {
    if (!utilisateur) {
      window.location.href = "login.html";
      return;
    }
    const doc = await db.collection("utilisateurs").doc(utilisateur.uid).get();
    if (!doc.exists) {
      afficherToast("Profil introuvable — contactez l'administrateur.");
      await auth.signOut();
      window.location.href = "login.html";
      return;
    }
    window.PROFIL = { uid: utilisateur.uid, ...doc.data() };
    await I18N.charger();
    I18N.appliquerAuDom();
    afficherBanniereHorsLigne();
    callback(window.PROFIL);
  });
}

function construireNavBasse(actif) {
  const items = [
    { page: "dashboard.html", icone: "🏠", cle: "nav_dashboard", id: "dashboard" },
    { page: "produits.html", icone: "📦", cle: "nav_produits", id: "produits" },
    { page: "caisse.html", icone: "🧾", cle: "nav_caisse", id: "caisse" },
    { page: "carnet.html", icone: "📒", cle: "nav_carnet", id: "carnet" }
  ];
  const nav = document.createElement("nav");
  nav.className = "nav-basse";
  nav.innerHTML = items.map((it) => `
    <a href="${it.page}" class="${it.id === actif ? "actif" : ""}">
      <span class="pastille">${it.icone}</span>
      <span data-i18n="${it.cle}">${it.cle}</span>
    </a>
  `).join("");
  document.body.appendChild(nav);
}

function ouvrirFeuille(html) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `<div class="feuille">${html}</div>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return overlay;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) =>
      console.warn("Service worker non enregistré :", err)
    );
  });
}

function lienWhatsApp(telephone, message) {
  const numero = telephone.replace(/[^0-9]/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}
