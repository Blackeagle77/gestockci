protegerPage(async (profil) => {
  construireNavBasse("dashboard");
  document.getElementById("prenom-utilisateur").textContent = profil.prenom || "";
  document.getElementById("nom-boutique").textContent = profil.boutique || "";

  document.getElementById("btn-langue").addEventListener("click", () =>
    I18N.changerLangue(I18N.langue === "fr" ? "en" : "fr")
  );
  document.getElementById("btn-deconnexion").addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "login.html";
  });

  const ref = db.collection("utilisateurs").doc(profil.uid);
  const debutJour = new Date(); debutJour.setHours(0, 0, 0, 0);
  const ilY7Jours = new Date(); ilY7Jours.setDate(ilY7Jours.getDate() - 6); ilY7Jours.setHours(0, 0, 0, 0);

  // Ventes du jour + bénéfice + série 7 jours
  const ventesSnap = await ref.collection("ventes")
    .where("date", ">=", ilY7Jours)
    .get();

  let caJour = 0, beneficeJour = 0;
  const parJour = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(ilY7Jours); d.setDate(d.getDate() + i);
    parJour[d.toISOString().slice(0, 10)] = 0;
  }

  ventesSnap.forEach((doc) => {
    const v = doc.data();
    const date = v.date.toDate();
    const cle = date.toISOString().slice(0, 10);
    if (parJour[cle] !== undefined) parJour[cle] += v.total || 0;
    if (date >= debutJour) {
      caJour += v.total || 0;
      (v.lignes || []).forEach((l) => {
        beneficeJour += (l.prixVente - (l.prixAchat || 0)) * l.quantite;
      });
    }
  });

  document.getElementById("kpi-ca").textContent = formaterFCFA(caJour);
  document.getElementById("kpi-benefice").textContent = formaterFCFA(beneficeJour);

  const maxJour = Math.max(1, ...Object.values(parJour));
  const graphe = document.getElementById("mini-graphe");
  graphe.innerHTML = Object.entries(parJour).map(([jour, total]) => {
    const hauteur = Math.max(6, Math.round((total / maxJour) * 100));
    const label = new Date(jour).toLocaleDateString("fr-FR", { weekday: "short" });
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div style="width:100%;height:${hauteur}px;background:var(--braise);border-radius:6px 6px 0 0;"></div>
      <span style="font-size:.68rem;color:var(--ink-soft);">${label}</span>
    </div>`;
  }).join("");

  // Dettes clients
  const clientsSnap = await ref.collection("clients").get();
  let dettes = 0;
  clientsSnap.forEach((doc) => { dettes += doc.data().soldeDu || 0; });
  document.getElementById("kpi-dettes").textContent = formaterFCFA(dettes);

  // Produits en rupture
  const produitsSnap = await ref.collection("produits").get();
  const ruptures = [];
  produitsSnap.forEach((doc) => {
    const p = doc.data();
    if ((p.quantite || 0) <= (p.seuilAlerte || 0)) ruptures.push(p);
  });
  document.getElementById("kpi-ruptures").textContent = ruptures.length;

  const listeRuptures = document.getElementById("liste-ruptures");
  if (ruptures.length) {
    listeRuptures.innerHTML = `<div class="carte">
      <span class="badge badge-alerte" data-i18n="rupture_badge">Stock bas</span>
      ${ruptures.map((p) => `<div class="vignette" style="box-shadow:none;padding:10px 0;">
        <div class="icone">📦</div>
        <div class="infos"><div class="nom">${p.nom}</div>
        <div class="detail">${p.quantite} restant(s)</div></div>
      </div>`).join("")}
    </div>`;
  }
});
