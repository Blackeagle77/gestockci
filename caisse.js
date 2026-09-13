protegerPage(async (profil) => {
  construireNavBasse("caisse");
  const refUtilisateur = db.collection("utilisateurs").doc(profil.uid);
  let produits = [];
  let panier = []; // { produitId, nom, prixVente, prixAchat, quantite }

  const snapProduits = await refUtilisateur.collection("produits").orderBy("nom").get();
  produits = snapProduits.docs.map((d) => ({ id: d.id, ...d.data() }));

  const grille = document.getElementById("grille-produits");
  grille.innerHTML = produits.map((p) => `
    <button class="vignette" data-id="${p.id}" style="flex-direction:column;align-items:flex-start;">
      <div class="nom">${p.nom}</div>
      <div class="valeur">${formaterFCFA(p.prixVente)}</div>
    </button>
  `).join("");

  grille.querySelectorAll(".vignette").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = produits.find((x) => x.id === btn.dataset.id);
      const ligne = panier.find((l) => l.produitId === p.id);
      if (ligne) ligne.quantite += 1;
      else panier.push({ produitId: p.id, nom: p.nom, prixVente: p.prixVente, prixAchat: p.prixAchat, quantite: 1 });
      dessinerPanier();
    });
  });

  function dessinerPanier() {
    const conteneur = document.getElementById("lignes-panier");
    conteneur.innerHTML = panier.map((l, i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;">
        <span>${l.nom} × ${l.quantite}</span>
        <span>${formaterFCFA(l.prixVente * l.quantite)}
          <button data-i="${i}" class="fermer" style="font-size:1rem;">×</button>
        </span>
      </div>
    `).join("") || `<p class="detail" data-i18n="caisse_panier_vide">Touchez un produit</p>`;
    conteneur.querySelectorAll("button[data-i]").forEach((b) =>
      b.addEventListener("click", () => { panier.splice(Number(b.dataset.i), 1); dessinerPanier(); })
    );
    const total = panier.reduce((s, l) => s + l.prixVente * l.quantite, 0);
    document.getElementById("total-panier").textContent = formaterFCFA(total);
  }
  dessinerPanier();

  async function choisirModeReglement() {
    return new Promise((resolve) => {
      const feuille = ouvrirFeuille(`
        <h3 style="margin:0;" data-i18n="caisse_mode_reglement">Mode de règlement</h3>
        <button class="btn btn-neutre" data-mode="especes" data-i18n="reglement_especes">Espèces</button>
        <button class="btn btn-neutre" data-mode="mobile_money" data-i18n="reglement_mobile_money">Mobile Money</button>
        <button class="btn btn-neutre" data-mode="credit" data-i18n="reglement_credit">Vente à crédit</button>
      `);
      I18N.appliquerAuDom();
      feuille.querySelectorAll("[data-mode]").forEach((b) =>
        b.addEventListener("click", () => { feuille.remove(); resolve(b.dataset.mode); })
      );
    });
  }

  async function choisirClient() {
    const snap = await refUtilisateur.collection("clients").orderBy("nom").get();
    return new Promise((resolve) => {
      const feuille = ouvrirFeuille(`
        <h3 style="margin:0;" data-i18n="caisse_choisir_client">Choisir le client</h3>
        ${snap.docs.map((d) => `<button class="btn btn-neutre" data-id="${d.id}">${d.data().nom}</button>`).join("") ||
          `<p class="detail">Ajoutez d'abord un client dans Le Carnet.</p>`}
      `);
      I18N.appliquerAuDom();
      feuille.querySelectorAll("[data-id]").forEach((b) =>
        b.addEventListener("click", () => { feuille.remove(); resolve(b.dataset.id); })
      );
    });
  }

  document.getElementById("btn-valider").addEventListener("click", async () => {
    if (!panier.length) return;
    const mode = await choisirModeReglement();
    let clientId = null;
    if (mode === "credit") {
      clientId = await choisirClient();
      if (!clientId) return;
    }
    const total = panier.reduce((s, l) => s + l.prixVente * l.quantite, 0);

    const lot = db.batch();
    const venteRef = refUtilisateur.collection("ventes").doc();
    lot.set(venteRef, {
      lignes: panier,
      total,
      modeReglement: mode,
      clientId: clientId || null,
      date: firebase.firestore.FieldValue.serverTimestamp()
    });
    panier.forEach((l) => {
      const produitRef = refUtilisateur.collection("produits").doc(l.produitId);
      const p = produits.find((x) => x.id === l.produitId);
      lot.update(produitRef, { quantite: Math.max(0, (p.quantite || 0) - l.quantite) });
    });
    if (mode === "credit") {
      const clientRef = refUtilisateur.collection("clients").doc(clientId);
      lot.update(clientRef, {
        soldeDu: firebase.firestore.FieldValue.increment(total),
        derniereTransaction: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    await lot.commit();
    afficherToast(I18N.t("vente_enregistree"));
    panier = [];
    dessinerPanier();
  });
});
