auth.onAuthStateChanged(async (utilisateur) => {
  if (!utilisateur) return;
  const doc = await db.collection("admins").doc(utilisateur.uid).get();
  if (doc.exists) window.location.href = "dashboard.html";
});

document.getElementById("form-admin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const mdp = document.getElementById("mdp").value;
  const erreur = document.getElementById("erreur");
  erreur.style.display = "none";
  try {
    const identifiants = await auth.signInWithEmailAndPassword(email, mdp);
    const doc = await db.collection("admins").doc(identifiants.user.uid).get();
    if (!doc.exists) {
      await auth.signOut();
      erreur.style.display = "block";
      return;
    }
    window.location.href = "dashboard.html";
  } catch (err) {
    erreur.style.display = "block";
  }
});
