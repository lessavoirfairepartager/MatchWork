/* MatchWork — barre d'outils commune : apparence, confort de lecture,
   taille du texte, installation de l'application.
   Se contente d'être incluse dans la page : elle s'injecte dans <header class="bar">.
   Les préférences sont relues avant le rendu par le petit script placé
   dans le <head> de chaque page, pour éviter tout clignotement. */
(function () {
  "use strict";
  var K = { theme: "mw-theme", dys: "mw-dys", zoom: "mw-zoom" };
  var get = function (k, d) { try { return localStorage.getItem(k) || d } catch (e) { return d } };
  var set = function (k, v) { try { localStorage.setItem(k, v) } catch (e) { } };
  var root = document.documentElement;

  /* ---------- application des préférences ---------- */
  function applyTheme(v) {
    if (v === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", v);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = v === "dark" ? "#0E1620" : "#013B79";
  }
  function applyDys(on) { document.body.classList.toggle("dys", !!on) }
  function applyZoom(px) { root.style.fontSize = px + "px" }

  var theme = get(K.theme, "auto"),
      dys = get(K.dys, "0") === "1",
      zoom = parseInt(get(K.zoom, "17"), 10) || 17;

  /* ---------- construction de la barre ---------- */
  var bar = document.querySelector("header.bar");
  if (!bar) return;

  var wrap = document.createElement("div");
  wrap.className = "tools";
  wrap.innerHTML =
    '<button class="toolbtn" id="mwGear" aria-expanded="false" aria-controls="mwPanel" title="Affichage et accessibilité">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7"/></svg>' +
      '<span class="sr">Affichage et accessibilité</span></button>' +
    '<div class="panel" id="mwPanel" hidden role="dialog" aria-label="Affichage et accessibilité">' +
      '<p class="plab">Apparence</p>' +
      '<div class="seg" id="mwTheme">' +
        '<button data-v="auto">Auto</button><button data-v="light">Clair</button><button data-v="dark">Sombre</button></div>' +
      '<p class="plab">Confort de lecture</p>' +
      '<div class="seg" id="mwDys"><button data-v="0">Standard</button><button data-v="1">Dys</button></div>' +
      '<p class="plab">Taille du texte</p>' +
      '<div class="zoom"><button id="mwMoins" aria-label="Réduire le texte">A−</button>' +
        '<output id="mwVal">100 %</output>' +
        '<button id="mwPlus" aria-label="Agrandir le texte">A+</button></div>' +
      '<button class="install" id="mwInstall" hidden>Installer l\'application</button>' +
      '<p class="phint" id="mwHint" hidden></p>' +
    '</div>';
  bar.appendChild(wrap);

  var panel = wrap.querySelector("#mwPanel"),
      gear = wrap.querySelector("#mwGear"),
      segT = wrap.querySelector("#mwTheme"),
      segD = wrap.querySelector("#mwDys"),
      val = wrap.querySelector("#mwVal"),
      btnI = wrap.querySelector("#mwInstall"),
      hint = wrap.querySelector("#mwHint");

  function mark(seg, v) {
    seg.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === String(v)));
    });
  }
  function showZoom() { val.textContent = Math.round(zoom / 17 * 100) + " %" }

  mark(segT, theme); mark(segD, dys ? "1" : "0"); showZoom();

  segT.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    theme = b.dataset.v; set(K.theme, theme); applyTheme(theme); mark(segT, theme);
  });
  segD.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    dys = b.dataset.v === "1"; set(K.dys, dys ? "1" : "0"); applyDys(dys); mark(segD, b.dataset.v);
  });
  wrap.querySelector("#mwPlus").onclick = function () { zoom = Math.min(24, zoom + 1); set(K.zoom, zoom); applyZoom(zoom); showZoom() };
  wrap.querySelector("#mwMoins").onclick = function () { zoom = Math.max(14, zoom - 1); set(K.zoom, zoom); applyZoom(zoom); showZoom() };

  /* ---------- ouverture et fermeture ---------- */
  function open(v) {
    panel.hidden = !v; gear.setAttribute("aria-expanded", String(v));
    if (v) panel.querySelector("button").focus();
  }
  gear.onclick = function () { open(panel.hidden) };
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !wrap.contains(e.target)) open(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { open(false); gear.focus() }
  });

  /* ---------- installation ---------- */
  var deferred = null;
  var standalone = matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e; if (!standalone) btnI.hidden = false;
  });
  btnI.onclick = function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; btnI.hidden = true });
  };
  window.addEventListener("appinstalled", function () { btnI.hidden = true });
  // iOS ne propose pas d'invite : on explique la manipulation
  var iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (iOS && !standalone) {
    hint.hidden = false;
    hint.textContent = "Pour installer : bouton Partager de Safari, puis « Sur l'écran d'accueil ».";
  }

  /* ---------- fonctionnement hors ligne ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { });
    });
  }
})();
