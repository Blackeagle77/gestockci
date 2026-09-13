// ===== Helpers partagés — espace administrateur GeStockCI =====

function afficherToastAdmin(message) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// Un administrateur est un utilisateur Firebase Auth référencé dans la
// collection "admins" (document dont l'ID = uid). C'est aussi vérifié
// côté serveur par la Cloud Function via un custom claim "admin".
function protegerPageAdmin(callback) {
  auth.onAuthStateChanged(async (utilisateur) => {
    if (!utilisateur) { window.location.href = "login.html"; return; }
    const doc = await db.collection("admins").doc(utilisateur.uid).get();
    if (!doc.exists) {
      await auth.signOut();
      window.location.href = "login.html";
      return;
    }
    callback({ uid: utilisateur.uid, ...doc.data() });
  });
}

function construireLateralAdmin(actif) {
  const items = [
    { page: "dashboard.html", id: "dashboard", label: "Tableau de bord" },
    { page: "utilisateurs.html", id: "utilisateurs", label: "Utilisateurs" }
  ];
  const nav = document.createElement("div");
  nav.className = "admin-lateral";
  nav.innerHTML = `<div class="logo">GeStockCI</div>` +
    items.map((it) => `<a href="${it.page}" class="${it.id === actif ? "actif" : ""}">${it.label}</a>`).join("") +
    `<a href="#" id="lien-deconnexion" style="margin-top:auto;">Déconnexion</a>`;
  return nav;
}
