// ===== Système de traduction FR / EN =====
const I18N = {
  dict: {},
  langue: localStorage.getItem("gsci_langue") || "fr",

  async charger() {
    const rep = await fetch(`../app/locales/${this.langue}.json`).catch(() => null);
    if (!rep || !rep.ok) {
      // Repli en local si hors-ligne et non mis en cache
      const repFr = await fetch(`../app/locales/fr.json`);
      this.dict = await repFr.json();
      return;
    }
    this.dict = await rep.json();
  },

  t(cle, variables = {}) {
    let texte = this.dict[cle] || cle;
    Object.keys(variables).forEach((k) => {
      texte = texte.replace(`{${k}}`, variables[k]);
    });
    return texte;
  },

  appliquerAuDom() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", this.t(el.getAttribute("data-i18n-placeholder")));
    });
  },

  async changerLangue(langue) {
    this.langue = langue;
    localStorage.setItem("gsci_langue", langue);
    await this.charger();
    this.appliquerAuDom();
  }
};
