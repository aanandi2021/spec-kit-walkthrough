/* Version badge: says which build you're looking at (from app/version.js) and where it's served from.
   In the viewer it sits in the header; on other pages, in the bottom-left corner. */
(function () {
  "use strict";
  function show() {
    const v = window.APP_VERSION;
    if (!v || document.getElementById("version-badge")) return;
    const where = location.protocol === "file:" ? "file" : location.host;
    const el = document.createElement("span");
    el.id = "version-badge";
    el.textContent = `v${v.version}`;
    el.title = `Version ${v.version}, built on ${v.branch} after commit ${v.commit}, stamped ${v.stamped}. Served from ${where}.`;
    const host = document.querySelector("#status .series, #bar .brand .series");
    if (host) { el.className = "vb-inline"; host.append(" · ", el); }
    else {
      el.className = "vb-corner";
      el.style.cssText = "position:fixed;left:8px;bottom:6px;z-index:50;font:11px system-ui,sans-serif;color:#7a6f5f;background:rgba(255,253,248,.9);padding:1px 6px;border-radius:8px;border:1px solid #e3dccd";
      document.body.append(el);
    }
    if (location.protocol !== "file:") el.textContent += ` · ${where}`;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
})();
