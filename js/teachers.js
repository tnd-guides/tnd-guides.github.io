/* TND Guides – public teacher profiles */
import DB, { LIVE } from "./db.js?v=6";
import { langSwitch, startTranslation } from "./i18n.js";
import { $, safe, icon, starsHtml, initials, demoBanner, bottomNav, accountChip, classChips, lowestFee, DISTRICTS, CLASS_TYPES, SECTIONS } from "./common.js";

demoBanner(LIVE);
bottomNav("teachers");
langSwitch();
accountChip(DB);
startTranslation();

let teachers = [], grades = [], section = "all", district = "", ctype = "";

function drawFilter() {
  const opts = ["all", ...SECTIONS.filter(s => grades.some(g => (g.section || "Other") === s))];
  $("filter").innerHTML = opts.map(s => `<button class="chip ${section === s ? "on" : ""}" data-sec="${safe(s)}">${s === "all" ? "All" : safe(s)}</button>`).join("");
}

function subjectLinks(t) {
  return (t.subjects || []).map(key => {
    const [gid, sub] = key.split("|");
    const g = grades.find(x => x.id === gid);
    if (!g) return "";
    const i = (g.subjects || []).findIndex(s => s.name === sub);
    if (i < 0) return "";
    return { g, i, sub, html: `<a href="index.html#grade/${g.id}/${i}/ask/${t.id}">${safe(sub)} · ${safe(g.name)}</a>` };
  }).filter(Boolean);
}

function draw() {
  const q = $("search").value.trim().toLowerCase();
  const list = teachers.map(t => ({ t, links: subjectLinks(t) })).filter(({ t, links }) => {
    if (section !== "all" && !links.some(l => (l.g.section || "Other") === section)) return false;
    if (district && t.district !== district) return false;
    if (ctype && !(t.classes || []).some(c => c.type === ctype)) return false;
    if (!q) return true;
    return (t.name + " " + t.about + " " + (t.district || "") + " " + (t.areas || "") + " " + links.map(l => l.sub + " " + l.g.name).join(" ")).toLowerCase().includes(q);
  }).sort((a, b) => (b.t.rating || 0) - (a.t.rating || 0) || a.t.name.localeCompare(b.t.name));

  if (!list.length) { $("list").innerHTML = `<div class="card"><p class="muted" style="margin:0">No teachers found.</p></div>`; return; }
  $("list").innerHTML = list.map(({ t, links }) => `
    <article class="tcard">
      <div class="tcard-top">
        ${t.photo ? `<img class="avatar" src="${safe(t.photo)}" alt="" loading="lazy">` : `<span class="avatar">${safe(initials(t.name))}</span>`}
        <div style="min-width:0">
          <h3>${safe(t.name)}</h3>
          <div class="muted small">${safe(t.about)}</div>
          ${lowestFee(t.classes) ? `<div class="from-fee">From ${safe(lowestFee(t.classes))}</div>` : ""}
        </div>
      </div>
      <div class="tstats">
        ${t.reviews ? `${starsHtml(t.rating)} <b style="color:var(--ink)">${Number(t.rating).toFixed(1)}</b> <span>(${t.reviews} reviews)</span>` : `<span class="badge grey">New teacher</span>`}
        <span>${icon("check", 14)} ${t.lessons || 0} lessons</span>
        ${t.years ? `<span>${icon("award", 14)} ${safe(t.years)} years</span>` : ""}
      </div>
      ${t.bio ? `<p style="margin:0">${safe(t.bio)}</p>` : ""}
      ${(t.classes || []).length ? `<div class="fee-chips">${classChips(t.classes)}</div>` : ""}
      ${t.district || t.areas ? `<div class="place">${icon("pin", 16)}<span>${safe([t.district, t.areas].filter(Boolean).join(" · "))}</span></div>` : ""}
      ${(t.mediums || []).length ? `<div class="tag-list">${t.mediums.map(m => `<span>${safe(m)} medium</span>`).join("")}</div>` : ""}
      <div>
        <div class="small muted" style="margin-bottom:6px">Ask for a lesson in:</div>
        <div class="tag-list">${links.map(l => l.html).join("") || `<span>No subjects yet</span>`}</div>
      </div>
    </article>`).join("");
}

function drawPlaceFilters() {
  const used = DISTRICTS.filter(d => teachers.some(t => t.district === d));
  $("district").innerHTML = `<option value="">All districts</option>` + used.map(d => `<option ${d === district ? "selected" : ""}>${d}</option>`).join("");
  $("ctype").innerHTML = `<option value="">All class types</option>` + CLASS_TYPES.map(c => `<option value="${c.id}" ${c.id === ctype ? "selected" : ""}>${c.name}</option>`).join("");
}
$("district").addEventListener("change", e => { district = e.target.value; draw(); });
$("ctype").addEventListener("change", e => { ctype = e.target.value; draw(); });

document.addEventListener("click", e => {
  const b = e.target.closest("[data-sec]");
  if (b) { section = b.dataset.sec; drawFilter(); draw(); }
});
$("search").addEventListener("input", draw);

DB.watch("grades", l => { grades = l; drawFilter(); draw(); });
DB.watch("teachers", l => { teachers = l; drawPlaceFilters(); draw(); }, null, () => { $("list").innerHTML = `<p class="msg bad">Could not load teachers. Check your internet.</p>`; });
