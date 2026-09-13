// ===== Cloud Functions GeStockCI =====
// Déployées avec "firebase deploy --only functions" (plan gratuit Spark
// suffisant : ces fonctions n'appellent aucun service externe payant).
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

// Crée un compte utilisateur (Auth + Firestore). Seul un administrateur
// authentifié (présent dans la collection "admins") peut appeler cette
// fonction — les utilisateurs ne peuvent jamais s'auto-inscrire.
exports.creerUtilisateur = onCall(async (requete) => {
  const appelant = requete.auth;
  if (!appelant) {
    throw new HttpsError("unauthenticated", "Connexion administrateur requise.");
  }
  const docAdmin = await admin.firestore().collection("admins").doc(appelant.uid).get();
  if (!docAdmin.exists) {
    throw new HttpsError("permission-denied", "Réservé à l'administrateur.");
  }

  const { nom, prenom, dateNaissance, boutique, localite, email, telephone, motDePasse, typeAbonnement } = requete.data;
  if (!nom || !prenom || !boutique || !email || !motDePasse) {
    throw new HttpsError("invalid-argument", "Champs obligatoires manquants.");
  }

  const nouvelUtilisateur = await admin.auth().createUser({
    email,
    password: motDePasse,
    displayName: `${prenom} ${nom}`
  });

  await admin.firestore().collection("utilisateurs").doc(nouvelUtilisateur.uid).set({
    nom, prenom, dateNaissance, boutique, localite, email, telephone,
    actif: true,
    abonnement: {
      type: typeAbonnement || "mensuel",
      statut: "actif",
      dateDebut: admin.firestore.FieldValue.serverTimestamp()
    },
    dateCreation: admin.firestore.FieldValue.serverTimestamp()
  });

  return { uid: nouvelUtilisateur.uid };
});

// Fonction utilitaire à exécuter UNE FOIS (depuis la console Firebase ou
// via un appel manuel) pour promouvoir le tout premier administrateur,
// avant que la collection "admins" n'existe. Voir README pour l'usage.
exports.promouvoirAdmin = onCall(async (requete) => {
  const appelant = requete.auth;
  if (!appelant) throw new HttpsError("unauthenticated", "Connexion requise.");
  const snap = await admin.firestore().collection("admins").limit(1).get();
  if (!snap.empty) {
    throw new HttpsError("failed-precondition", "Un administrateur existe déjà.");
  }
  await admin.firestore().collection("admins").doc(appelant.uid).set({
    email: appelant.token.email || null,
    promuLe: admin.firestore.FieldValue.serverTimestamp()
  });
  return { ok: true };
});
