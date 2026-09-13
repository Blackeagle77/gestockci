protegerPageAdmin(async () => {
  const coquille = document.getElementById("coquille");
  coquille.prepend(construireLateralAdmin("utilisateurs"));
  document.getElementById("lien-deconnexion").addEventListener("click", async (e) => {
    e.preventDefault(); await auth.signOut(); window.location.href = "login.html";
  });

  const fonctions = firebase.functions();
  const creerUtilisateur = fonctions.httpsCallable("creerUtilisateur");

  async function charger() {
    const snap = await db.collection("utilisateurs").orderBy("dateCreation", "desc").get();
    document.getElementById("corps-tableau").innerHTML = snap.docs.map((d) => {
      const u = d.data();
      return `<tr>
        <td>${u.boutique || "—"}</td>
        <td>${u.prenom || ""} ${u.nom || ""}</td>
        <td>${u.email || "—"}</td>
        <td>${u.telephone || "—"}</td>
        <td>${u.abonnement ? u.abonnement.type : "—"}</td>
        <td><span class="badge ${u.actif ? "badge-recolte" : "badge-alerte"}">${u.actif ? "Actif" : "Inactif"}</span></td>
      </tr>`;
    }).join("") || `<tr><td colspan="6">Aucun utilisateur pour l'instant.</td></tr>`;
  }

  document.getElementById("btn-nouveau").addEventListener("click", () => {
    const feuille = ouvrirFeuille(`
      <h3 style="margin:0;">Nouvel utilisateur</h3>
      <div class="champ"><label>Nom</label><input id="f-nom"></div>
      <div class="champ"><label>Prénom</label><input id="f-prenom"></div>
      <div class="champ"><label>Date de naissance</label><input id="f-naissance" type="date"></div>
      <div class="champ"><label>Nom de la boutique / entreprise</label><input id="f-boutique"></div>
      <div class="champ"><label>Localité</label><input id="f-localite"></div>
      <div class="champ"><label>Adresse email</label><input id="f-email" type="email"></div>
      <div class="champ"><label>Numéro de téléphone</label><input id="f-telephone"></div>
      <div class="champ"><label>Mot de passe temporaire</label><input id="f-mdp" type="text"></div>
      <div class="champ"><label>Abonnement</label>
        <select id="f-abonnement">
          <option value="mensuel">Mensuel</option>
          <option value="annuel">Annuel</option>
        </select>
      </div>
      <button class="btn btn-principal" id="f-valider">Créer le compte</button>
      <p class="detail" id="f-message" style="color:var(--ink-soft);"></p>
    `);
    feuille.querySelector("#f-valider").addEventListener("click", async () => {
      const donnees = {
        nom: feuille.querySelector("#f-nom").value.trim(),
        prenom: feuille.querySelector("#f-prenom").value.trim(),
        dateNaissance: feuille.querySelector("#f-naissance").value,
        boutique: feuille.querySelector("#f-boutique").value.trim(),
        localite: feuille.querySelector("#f-localite").value.trim(),
        email: feuille.querySelector("#f-email").value.trim(),
        telephone: feuille.querySelector("#f-telephone").value.trim(),
        motDePasse: feuille.querySelector("#f-mdp").value,
        typeAbonnement: feuille.querySelector("#f-abonnement").value
      };
      const message = feuille.querySelector("#f-message");
      message.textContent = "Création en cours…";
      try {
        await creerUtilisateur(donnees);
        message.textContent = "Compte créé avec succès.";
        setTimeout(() => { feuille.remove(); charger(); }, 900);
      } catch (err) {
        message.textContent = "Erreur : " + err.message;
      }
    });
  });

  charger();
});
