protegerPage(async (profil) => {
  construireNavBasse("carnet");
  const ref = db.collection("utilisateurs").doc(profil.uid).collection("clients");

  document.getElementById("btn-ajouter").addEventListener("click", () => {
    const feuille = ouvrirFeuille(`
      <h3 style="margin:0;" data-i18n="carnet_ajouter_client">Ajouter un client</h3>
      <div class="champ"><label data-i18n="champ_nom_client">Nom et prénom</label><input id="f-nom"></div>
      <div class="champ"><label data-i18n="champ_telephone">Téléphone</label><input id="f-tel" placeholder="+225 07 00 00 00 00"></div>
      <button class="btn btn-principal" id="f-valider" data-i18n="btn_enregistrer">Enregistrer</button>
    `);
    I18N.appliquerAuDom();
    feuille.querySelector("#f-valider").addEventListener("click", async () => {
      const nom = feuille.querySelector("#f-nom").value.trim();
      const telephone = feuille.querySelector("#f-tel").value.trim();
      if (!nom || !telephone) return;
      await ref.add({ nom, telephone, soldeDu: 0, derniereTransaction: null });
      feuille.remove();
      charger();
    });
  });

  async function charger() {
    const snap = await ref.orderBy("nom").get();
    const conteneur = document.getElementById("liste-clients");
    if (snap.empty) {
      conteneur.innerHTML = `<div class="vide"><span class="pastille">📒</span><span data-i18n="carnet_vide">Aucun client à crédit</span></div>`;
      I18N.appliquerAuDom();
      return;
    }
    conteneur.innerHTML = "";
    snap.forEach((doc) => {
      const c = doc.data();
      const derniere = c.derniereTransaction ? c.derniereTransaction.toDate().toLocaleDateString("fr-FR") : "—";
      const carte = document.createElement("div");
      carte.className = "carte";
      carte.style.marginBottom = "10px";
      carte.innerHTML = `
        <div style="display:flex;justify-content:space-between;">
          <div>
            <div class="nom" style="font-weight:700;">${c.nom}</div>
            <div class="detail" style="color:var(--ink-soft);font-size:.85rem;">${c.telephone}</div>
          </div>
          <div style="text-align:right;">
            <div class="badge ${c.soldeDu > 0 ? "badge-or" : "badge-recolte"}" data-i18n="carnet_solde_du">Solde dû</div>
            <div class="chiffre" style="font-weight:700;">${formaterFCFA(c.soldeDu || 0)}</div>
          </div>
        </div>
        <div class="detail" style="color:var(--ink-soft);font-size:.8rem;margin-top:6px;">
          <span data-i18n="carnet_derniere_transaction">Dernière transaction</span> : ${derniere}
        </div>
        ${c.soldeDu > 0 ? `<a class="btn btn-neutre" style="margin-top:10px;" target="_blank" href="${lienWhatsApp(c.telephone, I18N.t("carnet_message_relance", { nom: c.nom, montant: (c.soldeDu || 0).toLocaleString("fr-FR"), boutique: profil.boutique }))}" data-i18n="carnet_relancer">Relancer</a>` : ""}
      `;
      conteneur.appendChild(carte);
    });
  }
  charger();
});
