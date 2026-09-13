(async function () {
  await I18N.charger();
  I18N.appliquerAuDom();

  // Si déjà connecté, on saute directement au tableau de bord
  auth.onAuthStateChanged((utilisateur) => {
    if (utilisateur) window.location.href = "dashboard.html";
  });

  document.getElementById("btn-langue").addEventListener("click", async () => {
    const nouvelle = I18N.langue === "fr" ? "en" : "fr";
    await I18N.changerLangue(nouvelle);
  });

  document.getElementById("form-connexion").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const mdp = document.getElementById("mdp").value;
    const erreur = document.getElementById("erreur");
    erreur.style.display = "none";
    try {
      await auth.signInWithEmailAndPassword(email, mdp);
      window.location.href = "dashboard.html";
    } catch (err) {
      erreur.style.display = "block";
    }
  });
})();
