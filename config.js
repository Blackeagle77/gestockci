// ===== Configuration Firebase =====
// Remplacez ces valeurs par celles de VOTRE projet Firebase
// (Console Firebase > Paramètres du projet > Vos applications > SDK config).
const firebaseConfig = {
  apiKey: "AIzaSyCWiYmpFsB60z6LavNBsQ1Z7R9ZMN989ak",
  authDomain: "ge-stock-ci.firebaseapp.com",
  projectId: "ge-stock-ci",
  storageBucket: "ge-stock-ci.firebasestorage.app",
  messagingSenderId: "729968671900",
  appId: "1:729968671900:web:f7a5263c8f3144e51ec159"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Persistance hors-ligne Firestore (cache local sur l'appareil)
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  console.warn("Persistance hors-ligne indisponible :", err.code);
});
