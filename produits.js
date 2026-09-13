protegerPage(async (profil) => {
  construireNavBasse("produits");
  const ref = db.collection("utilisateurs").doc(profil.uid).collection("produits");

  function ouvrirFormulaireProduit(produit = null, id = null) {
    const feuille = ouvrirFeuille(`
      <div class="feuille-entete">
        <h3 style="margin:0;">${produit ? produit.nom : I18N.t("produits_ajouter")}</h3>
        <button class="fermer">×</button>
      </div>
      <div class="champ"><label data-i18n="champ_nom_produit">Nom</label>
        <input id="f-nom" value="${produit ? produit.nom : ""}"></div>
      <div class="champ"><label data-i18n="champ_prix_achat">Prix d'achat</label>
        <input id="f-prixachat" type="number" value="${produit ? produit.prixAchat : ""}"></div>
      <div class="champ"><label data-i18n="champ_prix_vente">Prix de vente</label>
        <input id="f-prixvente" type="number" value="${produit ? produit.prixVente : ""}"></div>
      <div class="champ"><label data-i18n="champ_quantite">Quantité</label>
        <input id="f-quantite" type="number" value="${produit ? produit.quantite : ""}"></div>
      <div class="champ"><label data-i18n="champ_seuil">Seuil d'alerte</label>
        <input id="f-seuil" type="number" value="${produit ? produit.seuilAlerte : 3}"></div>
      <button class="btn btn-principal" id="f-valider" data-i18n="btn_enregistrer">Enregistrer</button>
    `);
    I18N.appliquerAuDom();
    feuille.querySelector(".fermer").addEventListener("click", () => feuille.remove());
    feuille.querySelector("#f-valider").addEventListener("click", async () => {
      const donnees = {
        nom: feuille.querySelector("#f-nom").value.trim(),
        prixAchat: Number(feuille.querySelector("#f-prixachat").value) || 0,
        prixVente: Number(feuille.querySelector("#f-prixvente").value) || 0,
        quantite: Number(feuille.querySelector("#f-quantite").value) || 0,
        seuilAlerte: Number(feuille.querySelector("#f-seuil").value) || 0
      };
      if (!donnees.nom) return;
      if (id) await ref.doc(id).update(donnees);
      else await ref.add(donnees);
      afficherToast(I18N.t("produit_ajoute"));
      feuille.remove();
      charger();
    });
  }

  document.getElementById("btn-ajouter").addEventListener("click", () => ouvrirFormulaireProduit());

  async function charger() {
    const snap = await ref.orderBy("nom").get();
    const conteneur = document.getElementById("liste-produits");
    if (snap.empty) {
      conteneur.innerHTML = `<div class="vide"><span class="pastille">📦</span><span data-i18n="produits_vide">Aucun produit</span></div>`;
      I18N.appliquerAuDom();
      return;
    }
    conteneur.innerHTML = "";
    snap.forEach((doc) => {
      const p = doc.data();
      const enRupture = (p.quantite || 0) <= (p.seuilAlerte || 0);
      const v = document.createElement("button");
      v.className = "vignette";
      v.style.marginBottom = "10px";
      v.innerHTML = `
        <div class="icone">📦</div>
        <div class="infos">
          <div class="nom">${p.nom} ${enRupture ? '<span class="badge badge-alerte">●</span>' : ""}</div>
          <div class="detail">${p.quantite} en stock</div>
        </div>
        <div class="valeur">${formaterFCFA(p.prixVente)}</div>
      `;
      v.addEventListener("click", () => ouvrirFormulaireProduit(p, doc.id));
      conteneur.appendChild(v);
    });
  }
  charger();
});
