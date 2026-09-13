// ===== Configuration Firebase =====
// Remplacez ces valeurs par celles de VOTRE projet Firebase
// (Console Firebase > Paramètres du projet > Vos applications > SDK config).
const firebaseConfig = {
  apiKey: "REMPLACEZ_MOI",
  authDomain: "gestockci.firebaseapp.com",
  projectId: "gestockci",
  storageBucket: "gestockci.appspot.com",
  messagingSenderId: "REMPLACEZ_MOI",
  appId: "REMPLACEZ_MOI"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Persistance hors-ligne Firestore (cache local sur l'appareil)
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  console.warn("Persistance hors-ligne indisponible :", err.code);
});
