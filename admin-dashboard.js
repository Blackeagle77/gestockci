protegerPageAdmin(async () => {
  const coquille = document.getElementById("coquille");
  coquille.prepend(construireLateralAdmin("dashboard"));
  document.getElementById("lien-deconnexion").addEventListener("click", async (e) => {
    e.preventDefault(); await auth.signOut(); window.location.href = "login.html";
  });

  const snap = await db.collection("utilisateurs").orderBy("dateCreation", "desc").get();
  const utilisateurs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  document.getElementById("kpi-total").textContent = utilisateurs.length;
  document.getElementById("kpi-actifs").textContent = utilisateurs.filter((u) => u.actif).length;
  document.getElementById("kpi-mensuel").textContent = utilisateurs.filter((u) => u.abonnement?.type === "mensuel").length;
  document.getElementById("kpi-annuel").textContent = utilisateurs.filter((u) => u.abonnement?.type === "annuel").length;
  document.getElementById("kpi-expires").textContent = utilisateurs.filter((u) => u.abonnement?.statut === "expire").length;

  const corps = document.querySelector("#tableau-recents tbody");
  corps.innerHTML = utilisateurs.slice(0, 10).map((u) => `
    <tr>
      <td>${u.boutique || "—"}</td>
      <td>${u.prenom || ""} ${u.nom || ""}</td>
      <td>${u.localite || "—"}</td>
      <td>${u.abonnement ? `${u.abonnement.type} — ${u.abonnement.statut}` : "—"}</td>
    </tr>
  `).join("") || `<tr><td colspan="4">Aucun utilisateur pour l'instant.</td></tr>`;
});
