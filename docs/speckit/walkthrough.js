/* Spec Kit walkthrough: steps, a flow diagram, prompts filled from your project, progress, and the real
   artifacts from this repo. Works from file://. Progress is saved in localStorage only. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (s) => window.marked.parse(String(s || ""));
  const STEPS = window.STEPS, ART = window.ARTIFACTS || { files: {}, commits: [] };
  const KEY = "speckit.walkthrough.v1";
  const GH = `https://github.com/${ART.repo || "aanandi2021/history"}`;

  const FIELDS = [
    { k: "name", label: "Project name", hint: "Short. Used for the repo folder too." },
    { k: "idea", label: "The idea in a sentence", long: true },
    { k: "who", label: "Who it's for" },
    { k: "values", label: "What matters (becomes the constitution)", hint: "Separate with semicolons. Things a plan could fail.", long: true },
    { k: "constraints", label: "Constraints", hint: "Where it runs, budget, offline, privacy…", long: true },
    { k: "firstFeature", label: "First feature, described as an experience", long: true },
    { k: "mustHaves", label: "Must do in this feature", long: true },
    { k: "outOfScope", label: "Not in this feature" },
    { k: "stack", label: "Technology leanings (for the plan)", hint: "Languages, libraries, test tools." },
    { k: "checklistFocus", label: "A theme to check requirements against", hint: "e.g. accessibility, data accuracy, security" }
  ];
  const LABEL = Object.fromEntries(FIELDS.map((f) => [f.k, f.label.replace(/\s*\(.*\)$/, "").toLowerCase()]));
  LABEL.slug = "repo-name";

  // ------------------------------------------------------------------ storage
  function defaultStore() {
    const checks = {};
    for (const s of STEPS) checks[s.id] = s.doneWhen.map(() => s.id !== "converge");
    return { current: "example", step: {}, projects: { example: { fields: { ...window.EXAMPLE_PROJECT }, checks, example: true } } };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.projects && s.projects.example) { s.step = s.step || {}; return s; }
    } catch (e) { /* fall through */ }
    return defaultStore();
  }
  let store = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(store));
  const proj = () => store.projects[store.current] || store.projects.example;
  const slugify = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function checksFor(p, step) {
    p.checks = p.checks || {};
    if (!p.checks[step.id] || p.checks[step.id].length !== step.doneWhen.length) p.checks[step.id] = step.doneWhen.map(() => false);
    return p.checks[step.id];
  }
  const stepState = (p, step) => {
    const c = checksFor(p, step), n = c.filter(Boolean).length;
    return n === c.length ? "done" : n ? "partial" : "todo";
  };

  // ------------------------------------------------------------------ prompts
  /** Fill {field} placeholders. Returns { html, text, missing }. */
  function fill(tpl, fields) {
    const missing = [];
    const val = (k) => (k === "slug" ? slugify(fields.name) : String(fields[k] || "").trim().replace(/\.$/, ""));
    const parts = tpl.split(/(\{[a-zA-Z]+\})/);
    let html = "", text = "";
    for (const p of parts) {
      const m = /^\{([a-zA-Z]+)\}$/.exec(p);
      if (!m) { html += esc(p); text += p; continue; }
      const v = val(m[1]);
      if (v) { html += esc(v); text += v; }
      else { missing.push(m[1]); html += `<span class="ph" title="Fill in under ✎ Details">&lt;${esc(LABEL[m[1]] || m[1])}&gt;</span>`; text += `<${LABEL[m[1]] || m[1]}>`; }
    }
    return { html, text, missing };
  }

  // ------------------------------------------------------------------ routing
  function currentStepId() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (STEPS.some((s) => s.id === h)) return h;
    return store.step[store.current] || STEPS[0].id;
  }
  function go(id) {
    if (!STEPS.some((s) => s.id === id)) return;
    store.step[store.current] = id; save();
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    render();
    window.scrollTo({ top: 0 });
  }

  // ------------------------------------------------------------------ flow diagram
  function renderFlow(cur) {
    const svg = $("#flow-svg"), W = 1000, H = 150, p = proj();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const n = STEPS.length, x0 = 50, dx = (W - 2 * x0) / (n - 1), Y = 72;
    const X = (i) => x0 + i * dx;
    const idx = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));
    let h = "";
    // Phase labels over each run of steps.
    let start = 0;
    for (let i = 1; i <= n; i++) {
      if (i === n || STEPS[i].phase !== STEPS[start].phase) {
        const xm = (X(start) + X(i - 1)) / 2;
        h += `<text class="phase" x="${xm}" y="14" text-anchor="middle">${esc(STEPS[start].phase)}</text>`;
        if (i < n) h += `<line x1="${(X(i - 1) + X(i)) / 2}" x2="${(X(i - 1) + X(i)) / 2}" y1="6" y2="18" stroke="#ddd6c8"/>`;
        start = i;
      }
    }
    h += `<path class="edge" d="M${X(0)},${Y} H${X(n - 1)}"/>`;
    const loop = (from, to, label, lift) => {
      const a = X(idx[from]), b = X(idx[to]), top = Y - lift;
      h += `<path class="loop" d="M${a},${Y - 16} C${a},${top} ${b},${top} ${b},${Y - 16}" marker-end="url(#arr)"/>`;
      const peak = Y - 16 - 0.75 * (lift - 16);
      h += `<text class="loop-label" x="${(a + b) / 2}" y="${peak - 4}" text-anchor="middle">${esc(label)}</text>`;
    };
    h += `<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#c9a27a"/></marker></defs>`;
    loop("clarify", "specify", "answers", 34);
    loop("analyze", "plan", "fix gaps", 46);
    loop("converge", "implement", "unbuilt work", 34);
    STEPS.forEach((s, i) => {
      const st = stepState(p, s);
      const cls = ["node", st, s.id === cur ? "current" : "", s.optional ? "optional" : ""].join(" ");
      h += `<g class="${cls}" data-step="${s.id}" tabindex="0" role="link" aria-label="Step ${i}: ${esc(s.title)}">
        <circle cx="${X(i)}" cy="${Y}" r="15"/>
        <text class="n" x="${X(i)}" y="${Y + 4}">${st === "done" ? "✓" : i}</text>
        <text class="t" x="${X(i)}" y="${Y + 34}">${esc(s.title)}</text>
        <text class="c" x="${X(i)}" y="${Y + 50}">${esc(s.cmd.replace("/speckit-", "/"))}</text>
      </g>`;
    });
    svg.innerHTML = h;
  }

  // ------------------------------------------------------------------ step page
  function renderStep(cur) {
    const i = STEPS.findIndex((s) => s.id === cur), s = STEPS[i], p = proj(), f = p.fields;
    const prompt = fill(s.youType, f);
    const isEx = !!p.example;
    const checks = checksFor(p, s);
    let h = `<div class="kicker">Step ${i} of ${STEPS.length - 1} · ${esc(s.phase)}${s.optional ? '<span class="opt">optional</span>' : ""}</div>
      <h2>${esc(s.title)} <code>${esc(s.cmd)}</code></h2>
      <section class="md what">${md(s.what)}</section>
      <section class="type"><h3>You type</h3>
        <div class="cmd-label">${isEx ? "For <b>Amit's World</b> (the gist of what was asked)" : `Filled in for <b>${esc(f.name || "your project")}</b>`}
          ${!isEx && prompt.missing.length ? `<button data-act="details">✎ fill in ${prompt.missing.length} blank${prompt.missing.length > 1 ? "s" : ""}</button>` : ""}</div>
        <div class="cmd" id="prompt"><span class="txt">${prompt.html}</span><button class="copy" data-copy="prompt">Copy</button></div>
        ${s.typeNote ? `<div class="md muted">${md(s.typeNote)}</div>` : ""}
      </section>
      <section><h3>You get</h3><div class="chips">${s.youGet.map((g) => `<span class="chip">${esc(g)}</span>`).join("")}</div></section>
      <section><h3>In Amit's World</h3><div class="example"><div class="md">${md(s.here)}</div>
        <div class="actions">
          ${s.file && ART.files[s.file] ? `<button data-open="${esc(s.file)}" data-anchor="${esc(s.anchor || "")}">📄 Read ${esc(s.file.split("/").pop())}${s.anchor ? " › " + esc(s.anchor) : ""}</button>` : ""}
          ${s.commit ? `<a class="commit" href="${GH}/commit/${esc(s.commit)}" target="_blank" rel="noopener">commit ${esc(s.commit)} ↗</a>` : ""}
        </div></div></section>
      <section><h3>Watch out for</h3><ul class="pitfalls md">${s.pitfalls.map((x) => `<li>${md(x).replace(/^<p>|<\/p>\s*$/g, "")}</li>`).join("")}</ul></section>
      <section><h3>Done when</h3><ul class="done">${s.doneWhen.map((x, j) => `<li><label><input type="checkbox" data-check="${j}" ${checks[j] ? "checked" : ""}><span>${md(x).replace(/^<p>|<\/p>\s*$/g, "")}</span></label></li>`).join("")}</ul></section>
      <div class="nav">
        ${i > 0 ? `<button data-go="${STEPS[i - 1].id}">← ${esc(STEPS[i - 1].title)}</button>` : "<span></span>"}
        ${i < STEPS.length - 1 ? `<button class="primary" data-go="${STEPS[i + 1].id}">${esc(STEPS[i + 1].title)} →</button>` : "<span></span>"}
      </div>`;
    const el = $("#step");
    el.innerHTML = h;
    el.dataset.step = s.id;
    el.querySelector("#prompt").dataset.text = prompt.text;
  }

  function renderSide(cur) {
    const p = proj();
    const real = STEPS.filter((s) => !s.optional);
    const done = real.filter((s) => stepState(p, s) === "done").length;
    $("#progress").innerHTML = `<h3>Progress · ${esc(p.fields.name || "untitled")}</h3>
      <div class="bar" title="${done} of ${real.length} steps done"><i style="width:${(100 * done / real.length).toFixed(0)}%"></i></div>
      <ol start="0">${STEPS.map((s) => `<li data-go="${s.id}" class="${stepState(p, s)}${s.id === cur ? " current" : ""}">${esc(s.title)}${s.optional ? " <span class=muted>(optional)</span>" : ""}${stepState(p, s) === "done" ? " ✓" : ""}</li>`).join("")}</ol>`;
    const stepOf = {};
    for (const s of STEPS) if (s.commit) stepOf[s.commit] = stepOf[s.commit] ? `${stepOf[s.commit]}, ${s.title}` : s.title;
    $("#history").innerHTML = `<h3>How it went here</h3><p class="muted" style="margin:0 0 6px;font-size:13px">Every commit in the example repo, oldest first.</p>
      <ol>${ART.commits.map((c) => `<li><a class="commit" href="${GH}/commit/${esc(c.hash)}" target="_blank" rel="noopener">${esc(c.hash)}</a> ${esc(c.subject)}
        <div class="d">${esc(c.date)}${stepOf[c.hash] ? " · " + esc(stepOf[c.hash]) : ""}${c.stat ? " · " + esc(c.stat.replace(/ changed|\(\+\)|\(-\)/g, "")) : ""}</div></li>`).join("")}</ol>
      <p class="muted" style="font-size:12px;margin:8px 0 0">Bundled ${esc(ART.built || "?")}. Rebuild with <code>python scripts/build_walkthrough.py</code>.</p>`;
  }

  function renderProjects() {
    const sel = $("#project");
    const own = Object.entries(store.projects);
    const presets = Object.entries(window.PRESETS).filter(([id]) => id !== "blank" && !store.projects[id]);
    sel.innerHTML = own.map(([id, p]) => `<option value="${esc(id)}">${esc(p.fields.name || id)}${p.example ? " (worked example)" : ""}</option>`).join("") +
      (presets.length ? `<optgroup label="Start one">${presets.map(([id, p]) => `<option value="preset:${esc(id)}">＋ ${esc(p.name)}</option>`).join("")}</optgroup>` : "");
    sel.value = store.current;
    $("#proj-title").textContent = proj().fields.name || "Untitled project";
    document.title = `${proj().fields.name || "Project"} · Spec Kit, step by step`;
    $("#edit-project").textContent = proj().example ? "👁 Details" : "✎ Details";
  }

  function render() {
    const cur = currentStepId();
    renderProjects();
    renderFlow(cur);
    renderStep(cur);
    renderSide(cur);
  }

  // ------------------------------------------------------------------ projects
  function createProject(name, presetId) {
    const base = { ...window.PRESETS.blank, ...(presetId ? window.PRESETS[presetId] : {}), name: name || (presetId && window.PRESETS[presetId].name) || "" };
    let id = presetId || slugify(base.name) || "project";
    while (store.projects[id]) id += "-2";
    store.projects[id] = { fields: base, checks: {} };
    store.current = id; store.step[id] = STEPS[0].id; save();
    history.replaceState(null, "", "#" + STEPS[0].id);
    render();
    openDetails();
    return id;
  }

  function openDetails() {
    const p = proj(), ro = !!p.example;
    $("#fields").innerHTML = (ro ? `<p class="md"><b>This is the worked example.</b> Its details are shown read-only. Use <b>＋ New</b> to start your own project.</p>` : "") +
      FIELDS.map((f) => `<label><span>${esc(f.label)}${f.hint ? ` · <i>${esc(f.hint)}</i>` : ""}</span>${f.long
        ? `<textarea name="${f.k}" ${ro ? "readonly" : ""}>${esc(p.fields[f.k] || "")}</textarea>`
        : `<input name="${f.k}" value="${esc(p.fields[f.k] || "")}" ${ro ? "readonly" : ""}>`}</label>`).join("");
    $("#delete-project").hidden = ro;
    $("#details-form").querySelector('button[value="save"]').hidden = ro;
    $("#details").showModal();
  }
  $("#details").addEventListener("close", () => {
    const v = $("#details").returnValue, p = proj();
    if (v === "save" && !p.example) {
      for (const f of FIELDS) p.fields[f.k] = $(`#fields [name="${f.k}"]`).value.trim();
      save(); render(); toast("Saved");
    } else if (v === "delete" && !p.example) {
      if (confirm(`Delete "${p.fields.name || store.current}" and its progress from this browser?`)) {
        delete store.projects[store.current]; store.current = "example"; save(); render(); toast("Deleted");
      }
    }
  });

  // ------------------------------------------------------------------ artifact viewer
  function openViewer(file, anchor) {
    const sel = $("#viewer-file");
    sel.innerHTML = Object.keys(ART.files).map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("");
    sel.value = file || Object.keys(ART.files)[0];
    showFile(sel.value, anchor);
    if (!$("#viewer").open) $("#viewer").showModal();
  }
  function showFile(file, anchor) {
    const src = ART.files[file] || "";
    const body = $("#viewer-body");
    body.innerHTML = file.endsWith(".json") ? `<pre><code>${esc(src)}</code></pre>` : md(src.replace(/^---[\s\S]*?\n---\n/, ""));
    $("#viewer-gh").href = `${GH}/blob/main/${file}`;
    body.scrollTop = 0;
    if (anchor) {
      const hd = [...body.querySelectorAll("h1,h2,h3,h4")].find((x) => x.textContent.toLowerCase().includes(anchor.toLowerCase()));
      if (hd) {
        hd.classList.add("flash");
        // Wait a frame: a dialog that has only just opened hasn't laid out yet.
        requestAnimationFrame(() => { body.scrollTop += hd.getBoundingClientRect().top - body.getBoundingClientRect().top - 8; });
      }
    }
  }
  $("#viewer-file").addEventListener("change", (e) => showFile(e.target.value));
  $("#viewer-close").addEventListener("click", () => $("#viewer").close());
  $("#viewer").addEventListener("click", (e) => { if (e.target === $("#viewer")) $("#viewer").close(); });

  // ------------------------------------------------------------------ export
  function exportMarkdown() {
    const p = proj(), f = p.fields, today = new Date().toISOString().slice(0, 10);
    const lines = ["---", "type: project_speckit", `project: "${(f.name || "").replace(/"/g, "'")}"`, `updated: ${today}`, "tags: [speckit]", "---", "",
      `# ${f.name || "Untitled project"} — Spec Kit progress`, "",
      `_Exported from the Spec Kit walkthrough (A:\\coding\\history\\docs\\speckit) on ${today}._`, "", "## Details", ""];
    for (const fd of FIELDS) if (f[fd.k]) lines.push(`- **${fd.label}:** ${f[fd.k]}`);
    lines.push("");
    STEPS.forEach((s, i) => {
      const st = stepState(p, s), c = checksFor(p, s);
      lines.push(`## ${i}. ${s.title} ${st === "done" ? "✅" : st === "partial" ? "◐" : ""}`.trim(), "", "```", fill(s.youType, f).text, "```", "");
      s.doneWhen.forEach((d, j) => lines.push(`- [${c[j] ? "x" : " "}] ${d}`));
      lines.push("");
    });
    return lines.join("\n");
  }
  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ------------------------------------------------------------------ events
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1600);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); ta.remove(); return ok;
    }
  }

  document.addEventListener("click", async (e) => {
    const g = e.target.closest("[data-go]"); if (g) { go(g.dataset.go); return; }
    const n = e.target.closest("#flow-svg .node"); if (n) { go(n.dataset.step); return; }
    const o = e.target.closest("[data-open]"); if (o) { openViewer(o.dataset.open, o.dataset.anchor); return; }
    const c = e.target.closest("[data-copy]");
    if (c) { const ok = await copyText($("#" + c.dataset.copy).dataset.text); toast(ok ? "Copied" : "Couldn't copy; select the text instead"); return; }
    if (e.target.closest('[data-act="details"]')) openDetails();
  });
  $("#flow-svg").addEventListener("keydown", (e) => {
    const n = e.target.closest(".node"); if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(n.dataset.step); }
  });
  document.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-check]");
    if (!cb) return;
    const s = STEPS.find((x) => x.id === $("#step").dataset.step);
    checksFor(proj(), s)[+cb.dataset.check] = cb.checked;
    save();
    renderFlow(s.id); renderSide(s.id);
    if (stepState(proj(), s) === "done") toast(`${s.title} done`);
  });
  $("#project").addEventListener("change", (e) => {
    const v = e.target.value;
    if (v.startsWith("preset:")) { createProject(null, v.slice(7)); return; }
    store.current = v; save();
    history.replaceState(null, "", "#" + (store.step[v] || STEPS[0].id));
    render();
  });
  $("#new-project").addEventListener("click", () => {
    const name = prompt("Name of the new project?");
    if (name && name.trim()) createProject(name.trim());
  });
  $("#edit-project").addEventListener("click", openDetails);
  $("#artifacts-btn").addEventListener("click", () => openViewer());
  $("#export").addEventListener("click", () => {
    const f = proj().fields;
    download(`${(f.name || "Project").replace(/[\\/:*?"<>|]/g, "")} — Spec Kit.md`, exportMarkdown());
    toast("Downloaded. Drop it in the vault's Projects folder.");
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select, dialog") || e.ctrlKey || e.metaKey || e.altKey) return;
    const i = STEPS.findIndex((s) => s.id === currentStepId());
    if (e.key === "ArrowRight" && i < STEPS.length - 1) go(STEPS[i + 1].id);
    if (e.key === "ArrowLeft" && i > 0) go(STEPS[i - 1].id);
  });
  window.addEventListener("hashchange", () => { const id = currentStepId(); store.step[store.current] = id; save(); render(); });

  render();
  window.WALK = { go, fill, exportMarkdown, createProject, store: () => store, current: currentStepId, ready: true };
})();
