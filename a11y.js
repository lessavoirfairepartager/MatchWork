/* MatchWork — barre d'outils d'affichage, en haut à droite de chaque page.
   Pastilles toujours visibles : accueil, déconnexion, thème, zoom, mode dys,
   installation. Les préférences sont relues avant le rendu par le petit
   script placé dans le <head>, pour éviter tout clignotement. */
(function () {
  "use strict";
  var K = { theme: "mw-theme", dys: "mw-dys", zoom: "mw-zoom" };
  var get = function (k, d) { try { return localStorage.getItem(k) || d } catch (e) { return d } };
  var set = function (k, v) { try { localStorage.setItem(k, v) } catch (e) { } };
  var root = document.documentElement;

  var THEMES = [
    { v: "auto",  ic: "🌗", lb: "Thème : automatique" },
    { v: "light", ic: "☀️", lb: "Thème : clair" },
    { v: "dark",  ic: "🌙", lb: "Thème : sombre" }
  ];
  var ZOOMS = [17, 19, 21, 23];   // px : 100, 112, 124, 135 %

  var theme = get(K.theme, "auto"),
      dys = get(K.dys, "0") === "1",
      zoom = parseInt(get(K.zoom, "17"), 10) || 17;

  function applyTheme(v) {
    if (v === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", v);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = v === "dark" ? "#0E1620" : "#013B79";
  }
  function applyZoom(px) { root.style.fontSize = px + "px" }
  function applyDys(on) { document.body.classList.toggle("dys", !!on) }

  var bar = document.querySelector("header.bar");
  if (!bar) return;

  var tools = document.createElement("div");
  tools.className = "tools";
  tools.setAttribute("role", "group");
  tools.setAttribute("aria-label", "Affichage et accessibilité");
  tools.innerHTML =
    '<a class="pill" id="mwHome" href="index.html" title="Accueil"><span aria-hidden="true">🏠</span><span class="sr">Accueil</span></a>' +
    '<button class="pill" id="mwTheme"><span aria-hidden="true"></span><span class="sr"></span></button>' +
    '<button class="pill" id="mwZoom"><span aria-hidden="true">🔍</span><span class="sr">Taille du texte</span></button>' +
    '<button class="pill txt" id="mwDys" aria-pressed="false" title="Confort de lecture (dys)">Aa<span class="sr">Confort de lecture</span></button>' +
    '<button class="pill" id="mwInstall" hidden title="Installer l\'application"><span aria-hidden="true">⤓</span><span class="sr">Installer l\'application</span></button>';
  bar.appendChild(tools);

  var bT = tools.querySelector("#mwTheme"),
      bZ = tools.querySelector("#mwZoom"),
      bD = tools.querySelector("#mwDys"),
      bI = tools.querySelector("#mwInstall");

  /* la déconnexion rejoint la barre pour tenir sur une seule ligne */
  var out = document.getElementById("logout");
  if (out) {
    out.className = "pill";
    out.innerHTML = '<span aria-hidden="true">🚪</span><span class="sr">Se déconnecter</span>';
    out.title = "Se déconnecter";
    tools.insertBefore(out, bT);
  }

  function showTheme() {
    var t = THEMES.find(function (x) { return x.v === theme }) || THEMES[0];
    bT.firstChild.textContent = t.ic;
    bT.lastChild.textContent = t.lb;
    bT.title = t.lb + " (cliquer pour changer)";
    bT.setAttribute("aria-pressed", String(theme !== "auto"));
  }
  function showZoom() {
    var pc = Math.round(zoom / 17 * 100);
    bZ.title = "Taille du texte : " + pc + " % (cliquer pour agrandir)";
    bZ.lastChild.textContent = "Taille du texte : " + pc + " %";
    bZ.setAttribute("aria-pressed", String(zoom !== ZOOMS[0]));
  }
  function flash(txt) {
    var d = document.createElement("div");
    d.className = "toast"; d.setAttribute("role", "status"); d.textContent = txt;
    document.body.appendChild(d); setTimeout(function () { d.remove() }, 1600);
  }

  showTheme(); showZoom(); bD.setAttribute("aria-pressed", String(dys));

  bT.onclick = function () {
    var i = THEMES.findIndex(function (x) { return x.v === theme });
    theme = THEMES[(i + 1) % THEMES.length].v;
    set(K.theme, theme); applyTheme(theme); showTheme();
    flash((THEMES.find(function (x) { return x.v === theme }) || THEMES[0]).lb);
  };
  bZ.onclick = function () {
    var i = ZOOMS.indexOf(zoom); zoom = ZOOMS[(i + 1) % ZOOMS.length];
    set(K.zoom, zoom); applyZoom(zoom); showZoom();
    flash("Texte à " + Math.round(zoom / 17 * 100) + " %");
  };
  bD.onclick = function () {
    dys = !dys; set(K.dys, dys ? "1" : "0"); applyDys(dys);
    bD.setAttribute("aria-pressed", String(dys));
    flash(dys ? "Confort de lecture activé" : "Affichage standard");
  };

  /* ---------- installation ---------- */
  var deferred = null;
  var standalone = matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) bI.hidden = true; else bI.hidden = false;   // toujours proposée, sauf si déjà installée

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e; bI.setAttribute("aria-pressed", "true");
  });
  window.addEventListener("appinstalled", function () { bI.hidden = true; bubble(false) });

  function howTo() {
    var ua = navigator.userAgent, m = /android/i.test(ua), i = /iphone|ipad|ipod/i.test(ua);
    if (i) return "Sur iPhone et iPad : bouton Partager de Safari, puis « Sur l'écran d'accueil ».";
    if (/firefox/i.test(ua)) return m
      ? "Firefox Android : menu ⋮, puis « Ajouter à l'écran d'accueil »."
      : "Firefox pour ordinateur ne sait pas installer les applications web. Ouvre le site dans Chrome ou Edge, ou garde-le simplement en favori.";
    if (/edg\//i.test(ua)) return "Edge : menu …, puis « Applications », puis « Installer ce site en tant qu'application ».";
    if (/chrome|chromium|crios/i.test(ua)) return m
      ? "Chrome Android : menu ⋮, puis « Installer l'application »."
      : "Chrome : icône d'installation dans la barre d'adresse, ou menu ⋮ puis « Installer MatchWork ».";
    if (/safari/i.test(ua)) return "Safari sur Mac : menu Fichier, puis « Ajouter au Dock ».";
    return "Cherche « Installer l'application » ou « Ajouter à l'écran d'accueil » dans le menu de ton navigateur.";
  }

  var bub = null;
  function bubble(txt) {
    if (bub) { bub.remove(); bub = null }
    if (!txt) return;
    bub = document.createElement("div");
    bub.className = "bubble"; bub.setAttribute("role", "status");
    bub.innerHTML = '<p></p><button type="button">J\'ai compris</button>';
    bub.querySelector("p").textContent = txt;
    bub.querySelector("button").onclick = function () { bubble(false) };
    tools.appendChild(bub);
    setTimeout(function () {
      document.addEventListener("click", function h(e) {
        if (bub && !bub.contains(e.target) && e.target !== bI) { bubble(false); document.removeEventListener("click", h) }
      });
    }, 0);
  }

  bI.onclick = function () {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; bI.removeAttribute("aria-pressed") });
      return;
    }
    bubble(howTo());
  };

  /* ---------- fonctionnement hors ligne ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { });
    });
  }
})();
