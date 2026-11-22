/* TND Guides – student app
   Home (grade cards) → subject cards → subject page (papers + get a teacher) → request form */
import DB, { LIVE } from "./db.js";
import { langSwitch, startTranslation } from "./i18n.js";
import { $, safe, icon, shortId, byOrder, colorOf, starsHtml, niceDate, timeAgo, hasContactInfo, showToast,
         demoBanner, bottomNav, subjectIcon, gradeLabel, accountChip, loginLink, SECTIONS, DAYS, DAY_NAMES, TIMES, PAPER_KINDS, MEDIUMS } from "./common.js";

demoBanner(LIVE);
bottomNav(location.hash === "#mine" ? "mine" : "home");
langSwitch();
accountChip(DB);
startTranslation();

let grades = [], papers = [], teachers = [], myRequests = [], mySessions = [];
let user = null, userKnown = false, stopMine = [];
const here = () => "index.html" + location.hash;
/* Card shown instead of a form when the student must log in or confirm their email first */
function gateHtml(what) {
  if (!user) return `<h3 style="margin:0">Log in first</h3><p class="muted" style="margin:0">Log in with Google or your email to ${what}. It takes one minute.</p>
    <a class="btn yellow block" href="${loginLink(here())}">Log in or create account</a>`;
  return `<h3 style="margin:0">Confirm your email</h3><p class="muted" style="margin:0">We sent a link to <b>${safe(user.email)}</b>. Open it to ${what}.</p>
    <a class="btn yellow block" href="${loginLink(here())}">I confirmed it / send again</a>`;
}
const pick = { place: "Online", days: new Set(), times: new Set() };
const filter = { kind: "all", medium: "all" };
const chosenStars = {};

function myName() { try { return localStorage.getItem("guruhub_me") || ""; } catch (e) { return ""; } }
function setMyName(n) { try { localStorage.setItem("guruhub_me", n); } catch (e) { /* ignore */ } }
const findGrade = id => grades.find(g => g.id === id);

/* ---------- Screens (address after #) ---------- */
const VIEWS = ["grades", "subjects", "subject", "form", "sent", "mine"];
function show(v) { VIEWS.forEach(x => { $("v-" + x).hidden = x !== v; }); $("hero").hidden = v !== "grades"; }

function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  const p = h.split("/");
  document.querySelectorAll(".bottom-nav a").forEach(a => a.classList.toggle("on",
    (h === "mine" && a.getAttribute("href").endsWith("#mine")) || (h !== "mine" && a.getAttribute("href") === "index.html")));
  if (h === "mine") { show("mine"); drawMine(); }
  else if (h === "sent") show("sent");
  else if (p[0] === "grade" && p.length === 2) { show("subjects"); drawSubjects(p[1]); }
  else if (p[0] === "grade" && p.length === 3) { show("subject"); drawSubject(p[1], +p[2]); }
  else if (p[0] === "grade" && p[3] === "ask") { show("form"); drawForm(p[1], +p[2], p[4] || ""); }
  else { show("grades"); drawGrades(); }
}
window.addEventListener("hashchange", () => { filter.kind = "all"; filter.medium = "all"; route(); window.scrollTo({ top: 0 }); });

/* ---------- Home: quick links + grade cards ---------- */
function drawQuick() {
  const q = [
    ["#mine", "list", "My lessons", "Requests and stars"],
    ["teachers.html", "users", "Teachers", "See our teachers"],
    ["forum.html", "chat", "Ask the class", "Questions and answers"],
    ["#papers", "file", "Papers", "Pick a grade below"]
  ];
  $("quick").innerHTML = q.map(([href, ic, t, s]) =>
    `<a href="${href}" ${href === "#papers" ? 'data-scroll="1"' : ""}><span class="qi">${icon(ic, 22)}</span>${t}<small>${s}</small></a>`).join("");
}
function gradeCard(g) {
  return `<a class="gcard" style="--c:${colorOf(g)}" data-label="${gradeLabel(g)}" href="#grade/${g.id}">
    <span class="glabel">${gradeLabel(g)}</span>
    <span>
      <span class="gname">${safe(g.name)}</span>
      <span class="gfoot"><span>${(g.subjects || []).length} subjects</span>${icon("chevron", 18)}</span>
    </span>
  </a>`;
}
function drawGrades() {
  drawQuick();
  if (!grades.length) { $("grade-cards").innerHTML = `<p class="loading">No grades yet. Please check again soon.</p>`; return; }
  const sorted = grades.slice().sort(byOrder);
  $("grade-cards").innerHTML = SECTIONS.filter(s => sorted.some(g => (g.section || "Other") === s)).map(sec => `
    <p class="section-title">${safe(sec)}</p>
    <div class="cards">${sorted.filter(g => (g.section || "Other") === sec).map(gradeCard).join("")}</div>`).join("");
}

/* ---------- Subject cards ---------- */
function drawSubjects(gid) {
  const g = findGrade(gid);
  $("back-home").innerHTML = icon("back", 18) + "All grades";
  $("back-home").href = "#";
  if (!g) { $("subjects-title").textContent = grades.length ? "Grade not found" : "Loading…"; $("subject-cards").innerHTML = ""; return; }
  $("subjects-title").textContent = g.name;
  const subs = g.subjects || [];
  $("subject-cards").innerHTML = subs.map((s, i) => {
    const n = papers.filter(p => p.gradeId === g.id && p.subject === s.name).length;
    return `<a class="scard" style="--c:${colorOf(g)}" href="#grade/${g.id}/${i}">
      <span class="sicon">${subjectIcon(s, 26)}</span>
      <span class="sname">${safe(s.name)}</span>
      <span class="sfoot"><span>${n ? n + " papers" : "Get a teacher"}</span>${icon("chevron", 16)}</span>
    </a>`;
  }).join("") || `<p class="muted">No subjects yet for this grade.</p>`;
}

/* ---------- Subject page: papers + get a teacher ---------- */
function drawSubject(gid, i) {
  const g = findGrade(gid), s = g && (g.subjects || [])[i];
  if (!s) { if (grades.length) location.hash = ""; return; }
  $("v-subject").style.setProperty("--c", colorOf(g));
  $("back-subjects").innerHTML = icon("back", 18) + safe(g.name);
  $("back-subjects").href = "#grade/" + g.id;
  $("subject-head").innerHTML = `<span class="sicon">${subjectIcon(s, 30)}</span><div><span class="eyebrow">${safe(g.name)}</span><h2 style="margin:0">${safe(s.name)}</h2></div>`;
  $("ask-link").href = `#grade/${g.id}/${i}/ask`;
  $("ask-link").innerHTML = `<span class="ai">${icon("cap", 24)}</span><span class="at">Get a teacher<small>The admin finds a teacher for you</small></span>${icon("chevron", 22)}`;

  const mine = papers.filter(p => p.gradeId === g.id && p.subject === s.name);
  const kinds = PAPER_KINDS.filter(k => mine.some(p => p.kind === k.id));
  const mediums = MEDIUMS.filter(m => mine.some(p => p.medium === m));
  $("kind-chips").innerHTML = mine.length ? [["all", "All"], ...kinds.map(k => [k.id, k.name])].map(([id, n]) =>
    `<button class="chip ${filter.kind === id ? "on" : ""}" data-kind="${id}">${n}</button>`).join("") : "";
  $("medium-chips").innerHTML = mediums.length > 1 ? [["all", "All mediums"], ...mediums.map(m => [m, m + " medium"])].map(([id, n]) =>
    `<button class="chip ${filter.medium === id ? "on" : ""}" data-medium="${id}">${n}</button>`).join("") : "";

  const list = mine.filter(p => (filter.kind === "all" || p.kind === filter.kind) && (filter.medium === "all" || p.medium === filter.medium));
  if (!mine.length) { $("paper-list").innerHTML = `<div class="card"><p class="muted" style="margin:0">No papers for ${safe(s.name)} yet. The admin adds new papers often.</p></div>`; return; }
  if (!list.length) { $("paper-list").innerHTML = `<p class="muted">Nothing for this choice. Try "All".</p>`; return; }
  const years = [...new Set(list.map(p => p.year))].sort((a, b) => b - a);
  const order = PAPER_KINDS.map(k => k.id);
  $("paper-list").innerHTML = years.map(y => `
    <div class="year-group">
      <p class="year-title">${safe(y)}</p>
      ${list.filter(p => p.year === y).sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)).map(p => {
        const k = PAPER_KINDS.find(x => x.id === p.kind) || PAPER_KINDS[0];
        return `<a class="paper" href="${safe(p.url)}" target="_blank" rel="noopener">
          <span class="pi ${k.id}">${icon(k.icon, 22)}</span>
          <span class="pt"><b>${safe(p.title || k.one)}</b><span>${k.one} · ${safe(p.medium)} medium</span></span>
          <span class="po">${icon("external", 20)}</span>
        </a>`;
      }).join("")}
    </div>`).join("");
}

/* ---------- Request form ---------- */
let formGrade = null, formSubject = null, formIndex = 0;
function drawForm(gid, i, preferId) {
  formGrade = findGrade(gid); formSubject = formGrade && (formGrade.subjects || [])[i]; formIndex = i;
  if (!formSubject) { if (grades.length) location.hash = ""; return; }
  $("back-subject").innerHTML = icon("back", 18) + safe(formSubject.name);
  $("back-subject").href = `#grade/${formGrade.id}/${i}`;
  $("crumb").innerHTML = `<span class="crumb" style="--c:${colorOf(formGrade)}"><span class="dot">${subjectIcon(formSubject, 18)}</span>${safe(formGrade.name)} · ${safe(formSubject.name)}</span>`;
  const ok = user && user.verified;
  $("form-gate").hidden = ok || !userKnown; $("form-body").hidden = !ok;
  if (!ok) { $("form-gate").innerHTML = gateHtml("ask for a teacher"); return; }
  if (!$("name").value) $("name").value = myName() || user.name.split(" ")[0];
  const key = formGrade.id + "|" + formSubject.name;
  const fit = teachers.filter(t => (t.subjects || []).includes(key));
  const keep = preferId || $("prefer").value;
  $("prefer").innerHTML = `<option value="">Any good teacher (admin chooses)</option>` +
    fit.map(t => `<option value="${t.id}">${safe(t.name)}</option>`).join("");
  if (keep && fit.some(t => t.id === keep)) $("prefer").value = keep;
  drawTimes();
}
function drawTimes() {
  $("days").innerHTML = DAYS.map(d => `<button type="button" class="choice ${pick.days.has(d) ? "on" : ""}" data-day="${d}">${DAY_NAMES[d]}</button>`).join("");
  $("times").innerHTML = TIMES.map(t => `<button type="button" class="choice ${pick.times.has(t.id) ? "on" : ""}" data-time="${t.id}">${t.name}<small>around ${t.hint}</small></button>`).join("");
}
$("send").addEventListener("click", async () => {
  const name = $("name").value.trim(), need = $("need").value.trim();
  let problem = "";
  if (!name) problem = "Please type your first name.";
  else if (!need) problem = "Please tell us what you need help with.";
  else if (!pick.days.size || !pick.times.size) problem = "Please tap at least one day and one time.";
  else if (hasContactInfo(name + " " + need)) problem = "Please remove phone numbers, emails or app names. The admin will contact the teacher for you.";
  if (problem) { $("ask-error").innerHTML = `<p class="msg bad">${problem}</p>`; return; }
  $("ask-error").innerHTML = "";
  const free = [];
  pick.days.forEach(d => pick.times.forEach(t => free.push(d + "-" + t)));
  const pref = teachers.find(t => t.id === $("prefer").value);
  $("send").disabled = true; $("send").textContent = "Sending…";
  if (!user || !user.verified) { location.href = loginLink(here()); return; }
  try {
    const id = await DB.add("requests", {
      uid: user.uid, student: name, gradeId: formGrade.id, gradeName: formGrade.name, subject: formSubject.name,
      need, place: pick.place, free, made: new Date().toISOString(),
      status: "new", teacherId: "", teacherName: "", when: "",
      preferTeacherId: pref ? pref.id : "", preferTeacherName: pref ? pref.name : ""
    });
    setMyName(name);
    $("need").value = ""; pick.days.clear(); pick.times.clear();
    $("sent-id").textContent = shortId(id);
    location.hash = "sent";
  } catch (e) {
    console.error(e);
    $("ask-error").innerHTML = `<p class="msg bad">Could not send. Check your internet and try again.</p>`;
  } finally { $("send").disabled = false; $("send").textContent = "Send my request"; }
});

/* ---------- My lessons ---------- */
const STATUS = { new: ["new", "Sent"], wait: ["wait", "Choosing a teacher"], booked: ["booked", "Lesson booked"], done: ["done", "Finished"] };
function drawMine() {
  if (!userKnown) { $("my-list").innerHTML = `<p class="loading">Loading…</p>`; return; }
  if (!user || !user.verified) { $("my-list").innerHTML = `<div class="card gate">${gateHtml("see your lessons")}</div>`; return; }
  const list = myRequests.slice().sort((a, b) => b.made.localeCompare(a.made));
  if (!list.length) { $("my-list").innerHTML = `<div class="card stack"><p style="margin:0">You have not asked for a teacher yet.</p><a class="btn yellow" href="#">Choose a grade</a></div>`; return; }
  $("my-list").innerHTML = list.map(r => {
    const [cls, label] = STATUS[r.status] || STATUS.new;
    return `<div class="item">
      <div class="item-head"><h3 style="margin:0">${safe(r.subject)} · ${safe(r.gradeName)}</h3><span class="badge ${cls}">${label}</span></div>
      <p style="margin:0">${safe(r.need)}</p>
      <div class="facts"><span>No. <b>${shortId(r.id)}</b></span><span>${safe(r.place)}</span><span>${timeAgo(r.made)}</span></div>
      ${r.teacherName ? `<p class="msg info">Your teacher: <b>${safe(r.teacherName)}</b></p>` : ""}
      ${mySessions.filter(s => s.requestId === r.id).map(lessonHtml).join("")}
    </div>`;
  }).join("");
}
function lessonHtml(s) {
  if (s.status === "booked") return `<p class="msg good">Lesson on <b>${niceDate(s.when)}</b>. The admin will send the lesson link or room number before it starts.</p>`;
  if (s.stars) return `<p style="margin:0">You gave ${starsHtml(s.stars)} ${s.comment ? "“" + safe(s.comment) + "”" : ""}</p>`;
  const chosen = chosenStars[s.id] || 0;
  return `<div class="card stack" style="background:var(--bg)">
    <h3 style="margin:0">How was your lesson?</h3>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
      ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="choice star ${n <= chosen ? "on" : ""}" data-star="${s.id}|${n}" aria-label="${n} stars">${icon("star", 24)}</button>`).join("")}
    </div>
    <label class="field" for="c-${s.id}">Anything to say? <span class="hint">(optional)</span><input id="c-${s.id}" maxlength="200" placeholder="e.g. The teacher explained well."></label>
    <button class="btn yellow block" data-rate="${s.id}" ${chosen ? "" : "disabled"}>Send stars</button>
  </div>`;
}
async function sendReview(id) {
  const comment = (($("c-" + id) || {}).value || "").trim();
  if (hasContactInfo(comment)) { showToast("Please remove phone numbers or emails."); return; }
  try { await DB.update("sessions", id, { stars: chosenStars[id], comment }); showToast("Thank you! Your stars were sent."); }
  catch (e) { console.error(e); showToast("Could not send. Try again."); }
}

/* ---------- Taps ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-scroll]");
  if (a) { e.preventDefault(); $("grade-cards").scrollIntoView({ behavior: "smooth" }); return; }
  const b = e.target.closest("button"); if (!b) return;
  const d = b.dataset;
  if (d.place) { pick.place = d.place; document.querySelectorAll("[data-place]").forEach(x => x.classList.toggle("on", x === b)); }
  else if (d.day) { pick.days.has(d.day) ? pick.days.delete(d.day) : pick.days.add(d.day); drawTimes(); }
  else if (d.time) { pick.times.has(d.time) ? pick.times.delete(d.time) : pick.times.add(d.time); drawTimes(); }
  else if (d.kind) { filter.kind = d.kind; route(); }
  else if (d.medium) { filter.medium = d.medium; route(); }
  else if (d.star) { const [id, n] = d.star.split("|"); chosenStars[id] = +n; drawMine(); }
  else if (d.rate) sendReview(d.rate);
});

/* ---------- Start ---------- */
const rerender = () => { if ($("v-form").hidden) route(); };
DB.watch("grades", l => { grades = l; route(); }, null, () => { $("grade-cards").innerHTML = `<p class="msg bad">Could not load. Check your internet.</p>`; });
DB.watch("papers", l => { papers = l; rerender(); });
DB.watch("teachers", l => { teachers = l; if (!$("v-form").hidden) route(); });
DB.onUser(u => {
  const changed = (u && u.uid) !== (user && user.uid) || (u && u.verified) !== (user && user.verified);
  user = u; userKnown = true;
  if (changed) {
    stopMine.forEach(f => f && f()); stopMine = []; myRequests = []; mySessions = [];
    if (u && u.verified) {
      stopMine.push(DB.watch("requests", l => { myRequests = l; if (!$("v-mine").hidden) drawMine(); }, ["uid", u.uid]));
      stopMine.push(DB.watch("sessions", l => { mySessions = l; if (!$("v-mine").hidden) drawMine(); }, ["uid", u.uid]));
    }
  }
  route();
});
route();
