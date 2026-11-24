/* TND Guides – admin page */
import DB, { LIVE } from "./db.js?v=7";
import { SUBJECT_ICONS } from "./icons.js";
import { $, safe, safeUrl, icon, shortId, byOrder, colorOf, starsHtml, niceDate, timeAgo, freeText, showToast, demoBanner,
         initials, subjectIcon, gradeLabel, cleanLink, teacherScore, findNextTime, authMessage,
         classEditorHtml, readClassEditor, classChips, districtOptions, accessActive,
         COLORS, SECTIONS, DAYS, DAY_NAMES, TIMES, DEFAULT_GRADES, PAPER_KINDS, MEDIUMS } from "./common.js";

demoBanner(LIVE);

/* ---------- Live data ---------- */
let grades = [], requests = [], sessions = [], teachers = [], phones = [], posts = [], papers = [];
let payments = [], accessList = [], paperLinks = [], apps = [], paySettings = {};
let tab = "requests", openRequest = null, editGradeId = null, armed = null, editTeacherId = null;
let newGradeColor = 0, editColor = 0, newSubjectIcon = "book";
const tForm = { subjects: new Set(), days: new Set(), times: new Set(), mediums: new Set() };
let started = false;

const gradeById = id => grades.find(g => g.id === id);
const gradeName = id => (gradeById(id) || {}).name || "(removed grade)";
const teacherById = id => teachers.find(t => t.id === id);
const phoneOf = id => (phones.find(p => p.id === id) || {}).phone || "";

/* ---------- Log in / out ---------- */
$("login-hint").textContent = LIVE ? "No password yet? Use Continue with Google, or make one on the main login page (Create account)." : "Demo mode: any email, password demo";
$("admin-google").addEventListener("click", async () => {
  $("login-error").innerHTML = "";
  try { await DB.googleSignIn(); }
  catch (e) { $("login-error").innerHTML = `<p class="msg bad">${safe(authMessage(e))}</p>`; }
});
DB.onUser(user => {
  if (user && user.isAdmin) { $("login").hidden = true; $("app").hidden = false; $("logout").hidden = false; start(); }
  else {
    $("login").hidden = false; $("app").hidden = true; $("logout").hidden = true;
    if (user && !user.verified) $("login-error").innerHTML = `<div class="msg info">Please confirm your email first. <a href="login.html?next=admin.html">Open the confirm page</a></div>`;
    else if (user && user.email) $("login-error").innerHTML = `<div class="notadmin">
        <p style="margin:0"><b>${safe(user.email)}</b> is a student account, so it can't open the admin page.</p>
        <a class="btn yellow block" href="index.html">Go to the student site</a>
        <button type="button" class="btn block" id="switch-user">Log out and use an admin Gmail</button>
        ${user.adminWhy && user.adminWhy !== "permission-denied" ? `<small class="hint">Firebase says: ${safe(user.adminWhy)}</small>` : ""}
      </div>`;
    else $("login-error").innerHTML = "";
  }
});
async function doLogin() {
  $("login-error").innerHTML = "";
  try { await DB.adminLogin($("email").value.trim(), $("password").value); }
  catch (e) { $("login-error").innerHTML = `<p class="msg bad">Wrong email or password.</p>`; }
}
$("login-go").addEventListener("click", doLogin);
$("password").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
document.addEventListener("click", async e => { if (e.target.id === "switch-user") { e.preventDefault(); await DB.logout(); $("login-error").innerHTML = ""; } });
$("logout").addEventListener("click", async e => { e.preventDefault(); await DB.logout(); location.reload(); });

/* Log the admin out after 60 minutes with no taps or typing (shared or lost phones) */
let idleTimer = null;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => { await DB.logout(); location.reload(); }, 60 * 60 * 1000);
}
["click", "keydown", "touchstart", "scroll"].forEach(ev => window.addEventListener(ev, () => { if (started) resetIdle(); }, { passive: true }));

function start() {
  if (started) return;
  started = true;
  resetIdle();
  const err = () => showToast("Could not load data. Check the Firebase rules and admin email.");
  DB.watch("grades", l => { grades = l; fillSelects(); drawAll(); }, null, err);
  DB.watch("requests", l => { requests = l; checkAlerts(); drawAll(); }, null, err);
  DB.watch("sessions", l => { sessions = l; syncRatings(); drawAll(); }, null, err);
  DB.watch("teachers", l => { teachers = l; syncRatings(); drawAll(); }, null, err);
  DB.watch("teacherPrivate", l => { phones = l; drawAll(); }, null, err);
  DB.watch("posts", l => { posts = l; drawAll(); }, null, err);
  DB.watch("papers", l => { papers = l; drawAll(); }, null, err);
  DB.watch("paperLinks", l => { paperLinks = l; drawAll(); }, null, err);
  DB.watch("payments", l => { notifyNew("pay", l.filter(x => x.status === "pending"), x => `New payment: ${x.name} · Rs. ${x.amount}`); payments = l; drawAll(); }, null, err);
  DB.watch("access", l => { accessList = l; drawAll(); }, null, err);
  DB.watch("teacherApps", l => { notifyNew("join", l.filter(x => x.status === "pending"), x => `New teacher request: ${x.name}`); apps = l; drawAll(); }, null, err);
  DB.watch("settings", l => { paySettings = l.find(x => x.id === "payment") || {}; fillPaySettings(); }, null, err);
  $("t-district").innerHTML = districtOptions("");
  $("t-classes").innerHTML = classEditorHtml("t", []);
  $("demo-tools").hidden = LIVE;
  $("notify-on").hidden = !("Notification" in window) || Notification.permission === "granted";
  ["g-section", "e-section"].forEach(id => { $(id).innerHTML = SECTIONS.map(s => `<option>${s}</option>`).join(""); });
  $("p-kind").innerHTML = PAPER_KINDS.map(k => `<option value="${k.id}">${k.one}</option>`).join("");
  $("p-medium").innerHTML = MEDIUMS.map(m => `<option>${m}</option>`).join("");
  $("p-year").value = new Date().getFullYear() - 1;
  $("t-days").innerHTML = DAYS.map(d => `<label><input type="checkbox" data-tday="${d}">${DAY_NAMES[d]}</label>`).join("");
  $("t-times").innerHTML = TIMES.map(t => `<label><input type="checkbox" data-ttime="${t.id}">${t.name} (${t.hint})</label>`).join("");
  $("t-mediums").innerHTML = MEDIUMS.map(m => `<label><input type="checkbox" data-tmed="${m}">${m}</label>`).join("");
  $("cards-back").innerHTML = icon("back", 18) + "All grade cards";
}

/* Keep each teacher's public star rating up to date (students can't read lessons) */
let syncing = false;
async function syncRatings() {
  if (syncing || !teachers.length) return;
  syncing = true;
  try {
    for (const t of teachers) {
      const s = teacherScore(sessions, t.id);
      if (t.rating !== s.avg || t.reviews !== s.reviews || t.lessons !== s.lessons)
        await DB.update("teachers", t.id, { rating: s.avg, reviews: s.reviews, lessons: s.lessons });
    }
  } catch (e) { console.error(e); }
  syncing = false;
}

/* ---------- Instant alert for new requests ---------- */
let known = null;
function checkAlerts() {
  const fresh = requests.filter(r => r.status === "new").sort((a, b) => b.made.localeCompare(a.made));
  if (known) {
    const arrived = fresh.filter(r => !known.has(r.id));
    if (arrived.length) {
      beep();
      const r = arrived[0], text = `New request: ${r.student} · ${r.subject} (${r.gradeName})`;
      showToast(text);
      try { if ("Notification" in window && Notification.permission === "granted") new Notification("TND Guides", { body: text }); } catch (e) { /* ignore */ }
    }
  }
  known = new Set(requests.map(r => r.id));
  $("alert").hidden = !fresh.length;
  if (fresh.length) $("alert-text").textContent = fresh.length === 1 ? `New request from ${fresh[0].student}: ${fresh[0].subject}` : `${fresh.length} new requests are waiting`;
  document.title = (fresh.length ? `(${fresh.length}) ` : "") + "Admin · TND Guides";
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.16);
    });
  } catch (e) { /* sound blocked */ }
}
$("alert-open").addEventListener("click", () => showTab("requests"));
$("notify-on").addEventListener("click", async () => {
  try { const p = await Notification.requestPermission(); $("notify-on").hidden = p === "granted"; showToast(p === "granted" ? "Pop-up alerts are on." : "Pop-up alerts were blocked by the browser."); }
  catch (e) { showToast("This browser cannot show pop-up alerts."); }
});

/* ---------- Tabs ---------- */
function showTab(name) {
  tab = name; armed = null;
  document.querySelectorAll("#tabs .tab").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  ["requests", "lessons", "papers", "payments", "teachers", "cards", "forum"].forEach(t => { $("tab-" + t).hidden = t !== name; });
  drawAll();
}
function drawAll() {
  if (!started) return;
  drawNumbers();
  ({ requests: drawRequests, lessons: drawLessons, papers: drawPapers, payments: drawPayments, teachers: () => { drawJoins(); drawTeachers(); }, cards: drawCards, forum: drawForum })[tab]();
}
function drawNumbers() {
  const n = requests.filter(r => r.status === "new").length, w = requests.filter(r => r.status === "wait").length;
  const b = sessions.filter(s => s.status === "booked").length;
  const box = (num, label, color) => `<div class="card" style="padding:14px"><b style="font-size:1.7rem;color:${color}">${num}</b><div class="muted small">${label}</div></div>`;
  $("numbers").innerHTML = box(n, "new requests", "var(--red)") + box(w, "choosing teacher", "var(--orange)") +
                           box(b, "lessons booked", "var(--blue)") + box(papers.length, "papers online", "var(--green)");
  $("c-requests").hidden = !(n + w); $("c-requests").textContent = n + w;
  const pp = payments.filter(x => x.status === "pending").length, pj = apps.filter(x => x.status === "pending").length;
  $("c-payments").hidden = !pp; $("c-payments").textContent = pp;
  $("c-joins").hidden = !pj; $("c-joins").textContent = pj;
}

/* ================= Requests ================= */
const STATUS = { new: ["new", "New"], wait: ["wait", "Choosing teacher"], booked: ["booked", "Booked"], done: ["done", "Finished"] };
function requestCard(r) {
  const [cls, label] = STATUS[r.status] || STATUS.new;
  const past = sessions.filter(s => s.uid === r.uid && s.requestId !== r.id);
  const open = openRequest === r.id;
  const isOpen = r.status === "new" || r.status === "wait";
  return `<div class="item">
    <div class="item-head"><h3 style="margin:0">${safe(r.student)} · ${safe(r.subject)}</h3><span class="badge ${cls}">${label}</span></div>
    <div class="facts"><span>${safe(r.gradeName)}</span><span>No. <b>${shortId(r.id)}</b></span><span>${safe(r.place)}</span><span>${timeAgo(r.made)}</span></div>
    <p style="margin:0">“${safe(r.need)}”</p>
    <div class="facts"><span>Free: ${(r.free || []).map(freeText).join(", ")}</span></div>
    ${r.preferTeacherName ? `<div class="facts"><span>Asked for: <b style="color:var(--ink)">${safe(r.preferTeacherName)}</b></span></div>` : ""}
    <div class="facts"><span>Past lessons: ${past.length ? past.map(s => `${safe(s.subject)} with ${safe(s.teacherName)}${s.stars ? " (" + s.stars + "★)" : ""}`).join(", ") : "none"}</span></div>
    ${r.teacherName ? `<p class="msg info">Teacher: <b>${safe(r.teacherName)}</b> · ${safe(phoneOf(r.teacherId))}${r.when ? "<br>" + niceDate(r.when) : ""}</p>` : ""}
    ${isOpen ? `<div style="display:grid;grid-template-columns:1fr auto;gap:8px">
      <button class="btn ${open ? "" : "yellow"}" data-choose="${r.id}">${open ? "Hide teachers" : "Choose teacher"}</button>
      <button class="btn ${armed === "req" + r.id ? "red" : ""}" data-delreq="${r.id}" aria-label="Delete request">${armed === "req" + r.id ? "Sure?" : icon("x", 18)}</button>
    </div>` : ""}
    ${open ? teacherOptions(r) : ""}
  </div>`;
}
function teacherOptions(r) {
  const list = teachers.map(t => {
    const subs = t.subjects || [];
    const exact = subs.includes(r.gradeId + "|" + r.subject);
    const same = !exact && subs.some(x => x.split("|")[1] === r.subject);
    if (!exact && !same) return null;
    const score = teacherScore(sessions, t.id), shared = (r.free || []).filter(f => (t.free || []).includes(f));
    return { t, exact, score, shared, next: findNextTime(r, t, sessions), wanted: t.id === r.preferTeacherId };
  }).filter(Boolean).sort((a, b) => (b.wanted - a.wanted) || (b.exact - a.exact) || ((b.next ? 1 : 0) - (a.next ? 1 : 0)) || (b.score.avg - a.score.avg));
  if (!list.length) return `<p class="msg bad">No teacher teaches ${safe(r.subject)} yet. Add one in Teachers.</p>`;
  return `<div class="stack">${list.map(o => `
    <div class="card" style="background:var(--bg);padding:14px;display:grid;gap:6px">
      <div class="item-head"><b>${safe(o.t.name)}</b>
        <span>${o.wanted ? '<span class="badge booked">Student asked</span> ' : ""}<span class="badge ${o.exact ? "done" : "wait"}">${o.exact ? "This grade" : "Other grade"}</span></span></div>
      <div class="facts"><span>${o.score.reviews ? starsHtml(o.score.avg, 14) + " " + o.score.avg.toFixed(1) : "no stars yet"}</span><span>${o.score.lessons} lessons</span><span>${o.shared.length} free times match</span></div>
      <div class="small">${o.next ? `First free time for both: <b>${niceDate(o.next)}</b>` : `<span style="color:var(--red)">No shared free time in 3 weeks</span>`}</div>
      <button class="btn red" data-book="${r.id}|${o.t.id}" ${o.next ? "" : "disabled"}>Book</button>
    </div>`).join("")}</div>`;
}
function drawRequests() {
  const sorted = requests.slice().sort((a, b) => b.made.localeCompare(a.made));
  const open = sorted.filter(r => r.status === "new" || r.status === "wait");
  $("req-open").innerHTML = open.length ? open.map(requestCard).join("") : `<p class="msg good">All done! No requests are waiting.</p>`;
  $("req-closed").innerHTML = sorted.filter(r => r.status === "booked" || r.status === "done").slice(0, 30).map(requestCard).join("") || `<p class="muted">Nothing yet.</p>`;
}
async function book(requestId, teacherId) {
  const r = requests.find(x => x.id === requestId), t = teacherById(teacherId);
  const when = findNextTime(r, t, sessions);
  if (!when) { showToast("No shared free time. Ask the student for more free times."); return; }
  try {
    await DB.add("sessions", { requestId: r.id, uid: r.uid, teacherId: t.id, teacherName: t.name, student: r.student,
      subject: r.subject, gradeName: r.gradeName, when, status: "booked", stars: 0, comment: "" });
    await DB.update("requests", r.id, { status: "booked", teacherId: t.id, teacherName: t.name, when });
    openRequest = null;
    showToast(`Booked ${t.name} for ${r.student}, ${niceDate(when)}. Call the teacher: ${phoneOf(t.id)}`);
  } catch (e) { console.error(e); showToast("Could not book. Try again."); }
}

/* ================= New payment / teacher alerts ================= */
const seen = {};
function notifyNew(key, list, text) {
  if (seen[key]) {
    const fresh = list.filter(x => !seen[key].has(x.id));
    if (fresh.length) {
      beep(); showToast(text(fresh[0]));
      try { if ("Notification" in window && Notification.permission === "granted") new Notification("TND Guides", { body: text(fresh[0]) }); } catch (e) { /* ignore */ }
    }
  }
  seen[key] = new Set(list.map(x => x.id));
}

/* ================= Payments (unlock papers) ================= */
const accessOf = uid => accessList.find(a => a.id === uid || a.uid === uid);
const untilText = a => accessActive(a) ? "until " + niceDate(new Date(a.untilMs).toISOString()) : "locked";
function fillPaySettings() {
  const focused = document.activeElement && ["s-price", "s-period", "s-how"].includes(document.activeElement.id);
  if (focused) return;
  $("s-price").value = paySettings.price || ""; $("s-period").value = paySettings.period || ""; $("s-how").value = paySettings.howToPay || "";
}
$("s-save").addEventListener("click", async () => {
  try {
    await DB.set("settings", "payment", { price: $("s-price").value.trim(), period: $("s-period").value.trim(), howToPay: $("s-how").value.trim() });
    showToast("Payment details saved. Students see them now.");
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
});
async function giveAccess(uid, months, who) {
  const cur = accessOf(uid), base = accessActive(cur) ? cur.untilMs : Date.now();
  const d = new Date(base); d.setMonth(d.getMonth() + months);
  const p = who || cur || {};
  await DB.set("access", uid, { uid, email: p.email || "", name: p.name || "", untilMs: d.getTime(), updated: new Date().toISOString() });
  showToast(`Papers unlocked until ${niceDate(d.toISOString())}.`);
}
async function approvePayment(id, months) {
  const p = payments.find(x => x.id === id); if (!p) return;
  try {
    await giveAccess(p.uid, months, p);
    await DB.update("payments", id, { status: "approved", months, decidedAt: new Date().toISOString() });
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
}
function drawPayments() {
  const pending = payments.filter(x => x.status === "pending").sort((a, b) => a.made.localeCompare(b.made));
  $("pay-pending").innerHTML = pending.map(p => `<div class="item">
      <div class="item-head"><h3 style="margin:0">Rs. ${safe(p.amount)} · ${safe(p.name)}</h3><span class="badge new">Check</span></div>
      <div class="facts"><span>${safe(p.email)}</span><span>${safe(p.method)}</span><span>Ref <b>${safe(p.ref)}</b></span><span>${timeAgo(p.made)}</span></div>
      ${p.note ? `<p style="margin:0">“${safe(p.note)}”</p>` : ""}
      <div class="small muted">Now: ${untilText(accessOf(p.uid))}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <button class="btn sm yellow" data-approvepay="${p.id}|1">Unlock 1 month</button>
        <button class="btn sm" data-approvepay="${p.id}|3">3 months</button>
        <button class="btn sm" data-approvepay="${p.id}|12">1 year</button>
      </div>
      <button class="btn sm ${armed === "rp" + p.id ? "red" : ""}" data-rejectpay="${p.id}">${armed === "rp" + p.id ? "Sure? Money not received" : "Money not received"}</button>
    </div>`).join("") || `<p class="msg good">No payments waiting.</p>`;
  const active = accessList.filter(accessActive).sort((a, b) => a.untilMs - b.untilMs);
  $("pay-active").innerHTML = active.map(a => `<div class="item">
      <div class="item-head"><b>${safe(a.name || a.email || a.id)}</b><span class="badge done">${icon("unlock", 12)} ${untilText(a)}</span></div>
      <div class="facts"><span>${safe(a.email)}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn sm" data-extend="${a.id}">+1 month</button>
        <button class="btn sm ${armed === "da" + a.id ? "red" : ""}" data-delaccess="${a.id}">${armed === "da" + a.id ? "Sure? Lock" : "Lock papers"}</button>
      </div></div>`).join("") || `<p class="muted">Nobody has unlocked papers right now.</p>`;
  const done = payments.filter(x => x.status !== "pending").sort((a, b) => b.made.localeCompare(a.made)).slice(0, 40);
  $("pay-history").innerHTML = done.map(p => `<div class="facts"><span class="badge ${p.status === "approved" ? "done" : "new"}">${p.status === "approved" ? (p.months || "") + " mo" : "Not received"}</span><span>Rs. ${safe(p.amount)}</span><span>${safe(p.name)}</span><span>${safe(p.method)} · ${safe(p.ref)}</span><span>${timeAgo(p.made)}</span></div>`).join("") || `<p class="muted">Nothing yet.</p>`;
  fillPaySettings();
}

/* ================= Teacher join requests ================= */
function drawJoins() {
  const pending = apps.filter(a => a.status === "pending").sort((a, b) => a.made.localeCompare(b.made));
  if (!pending.length) { $("join-box").innerHTML = ""; return; }
  $("join-box").innerHTML = `<div class="stack"><h3 style="margin:0">Teachers who want to join (${pending.length})</h3>${pending.map(a => `
    <div class="tcard">
      <div class="tcard-top">
        ${a.photo ? `<img class="avatar" src="${safe(safeUrl(a.photo))}" alt="">` : `<span class="avatar">${safe(initials(a.name))}</span>`}
        <div style="min-width:0"><h3>${safe(a.name)}</h3><div class="muted small">${safe(a.about)}${a.years ? " · " + safe(a.years) + " years" : ""}</div>
          <div class="small">${icon("lock", 12)} ${safe(a.phone)} · ${safe(a.email)}</div></div>
      </div>
      ${a.bio ? `<p style="margin:0">${safe(a.bio)}</p>` : ""}
      <div class="tag-list">${(a.subjects || []).map(k => { const [gid, sub] = k.split("|"); return `<span>${safe(sub)} · ${safe(gradeName(gid))}</span>`; }).join("")}</div>
      <div class="fee-chips">${classChips(a.classes)}</div>
      <div class="place">${icon("pin", 14)}<span>${safe([a.district, a.areas].filter(Boolean).join(" · "))}</span></div>
      <div class="small muted">Free: ${(a.free || []).map(freeText).join(", ")} · Mediums: ${safe((a.mediums || []).join(", ") || "-")}</div>
      <input id="jn-${a.id}" placeholder="Reason if you reject (optional, the teacher sees it)" aria-label="Reason for rejecting">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn yellow" data-approvejoin="${a.id}">${icon("check", 16)} Accept and add</button>
        <button class="btn ${armed === "rj" + a.id ? "red" : ""}" data-rejectjoin="${a.id}">${armed === "rj" + a.id ? "Sure? Reject" : "Reject"}</button>
      </div>
    </div>`).join("")}</div>`;
}
async function approveJoin(id) {
  const a = apps.find(x => x.id === id); if (!a) return;
  try {
    const tid = await DB.add("teachers", { name: a.name, about: a.about || "Teacher", years: a.years || 0, bio: a.bio || "", photo: a.photo || "",
      mediums: a.mediums || [], subjects: a.subjects || [], free: a.free || [], district: a.district || "", areas: a.areas || "",
      classes: a.classes || [], rating: 0, reviews: 0, lessons: 0, uid: a.uid });
    await DB.set("teacherPrivate", tid, { phone: a.phone, email: a.email });
    await DB.update("teacherApps", id, { status: "approved", teacherId: tid });
    showToast(a.name + " is now on the Teachers page.");
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
}

/* ================= Lessons ================= */
function drawLessons() {
  const rows = sessions.slice().sort((a, b) => b.when.localeCompare(a.when));
  $("lesson-list").innerHTML = rows.map(s => `<div class="item">
      <div class="item-head"><b>${niceDate(s.when)}</b>${s.status === "booked" ? '<span class="badge booked">Booked</span>' : '<span class="badge done">Finished</span>'}</div>
      <div class="facts"><span>${safe(s.student)}</span><span>${safe(s.subject)} · ${safe(s.gradeName)}</span><span>${safe(s.teacherName)}</span></div>
      ${s.status === "booked" ? `<button class="btn" data-finish="${s.id}">${icon("check", 18)} Finished</button>` :
        s.stars ? `<div>${starsHtml(s.stars)} <span class="small">${safe(s.comment)}</span></div>` : `<span class="hint">Waiting for the student's stars</span>`}
    </div>`).join("") || `<p class="muted">No lessons yet.</p>`;
}

/* ================= Papers ================= */
function fillSelects() {
  const opts = grades.slice().sort(byOrder).map(g => `<option value="${g.id}">${safe(g.name)}</option>`).join("");
  ["p-grade", "t-grade"].forEach(id => { const keep = $(id).value; $(id).innerHTML = opts; if (keep && gradeById(keep)) $(id).value = keep; });
  fillPaperSubjects(); drawTeacherSubjects();
}
function fillPaperSubjects() {
  const g = gradeById($("p-grade").value), keep = $("p-subject").value;
  $("p-subject").innerHTML = (g ? g.subjects || [] : []).map(s => `<option>${safe(s.name)}</option>`).join("");
  if (keep && g && (g.subjects || []).some(s => s.name === keep)) $("p-subject").value = keep;
  autoTitle();
}
function autoTitle() {
  const g = gradeById($("p-grade").value), k = PAPER_KINDS.find(x => x.id === $("p-kind").value);
  if (!g || !k) return;
  $("p-title").value = `${$("p-year").value} ${g.name} ${$("p-subject").value} ${k.one}`.trim();
}
$("p-grade").addEventListener("change", () => { fillPaperSubjects(); drawPapers(); });
$("p-subject").addEventListener("change", () => { autoTitle(); drawPapers(); });
["p-kind", "p-year"].forEach(id => $(id).addEventListener("input", autoTitle));
$("p-add").addEventListener("click", async () => {
  const g = gradeById($("p-grade").value), subject = $("p-subject").value, url = cleanLink($("p-url").value);
  const year = parseInt($("p-year").value, 10);
  let problem = "";
  if (!g || !subject) problem = "Choose a grade and subject.";
  else if (!year || year < 1990 || year > 2100) problem = "Type the year, e.g. 2024.";
  else if (!url) problem = "Paste the PDF link. It must start with https://";
  if (problem) { $("p-error").innerHTML = `<p class="msg bad">${problem}</p>`; return; }
  try {
    const free = $("p-free").checked;
    const meta = { gradeId: g.id, gradeName: g.name, subject, kind: $("p-kind").value, year, medium: $("p-medium").value,
      title: $("p-title").value.trim(), free, made: new Date().toISOString() };
    if (free) meta.url = url;
    const id = await DB.add("papers", meta);
    if (!free) await DB.set("paperLinks", id, { url });   // the link is hidden until the student pays
    $("p-url").value = ""; $("p-error").innerHTML = "";
    showToast(free ? "Free paper added. Everyone can open it." : "Paper added. Students who paid can open it.");
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
});
function drawPapers() {
  const g = gradeById($("p-grade").value), subject = $("p-subject").value;
  $("p-showing").textContent = g ? `${g.name} ${subject}` : "";
  const list = papers.filter(p => g && p.gradeId === g.id && p.subject === subject).sort((a, b) => b.year - a.year);
  $("paper-admin-list").innerHTML = list.map(p => {
    const k = PAPER_KINDS.find(x => x.id === p.kind) || PAPER_KINDS[0];
    const url = p.free ? p.url : ((paperLinks.find(x => x.id === p.id) || {}).url || p.url || "");
    return `<div class="paper">
      <span class="pi ${k.id}">${icon(k.icon, 22)}</span>
      <a class="pt" href="${safe(safeUrl(url))}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><b>${safe(p.title || k.one)}</b><span>${k.one} · ${p.year} · ${safe(p.medium)} · <b style="color:${p.free ? "var(--green)" : "var(--orange)"}">${p.free ? "Free" : "Paid"}</b></span></a>
      <button class="btn sm ${armed === "pp" + p.id ? "red" : ""}" data-delpaper="${p.id}" aria-label="Remove paper">${armed === "pp" + p.id ? "Sure?" : icon("x", 16)}</button>
    </div>`;
  }).join("") || `<p class="muted">No papers yet for this subject.</p>`;
}

/* ================= Teachers ================= */
function drawTeacherSubjects() {
  const g = gradeById($("t-grade").value);
  $("t-subjects").innerHTML = (g ? g.subjects || [] : []).map(s => {
    const key = g.id + "|" + s.name;
    return `<label><input type="checkbox" data-tsub="${safe(key)}" ${tForm.subjects.has(key) ? "checked" : ""}>${safe(s.name)}</label>`;
  }).join("") || `<span class="hint">No subjects in this grade.</span>`;
  $("t-chosen").innerHTML = tForm.subjects.size
    ? [...tForm.subjects].map(k => { const [gid, s] = k.split("|"); return `<span class="badge booked">${safe(gradeName(gid))} ${safe(s)}</span>`; }).join(" ")
    : `<span class="muted">none yet. Tick subjects, change the grade, tick more.</span>`;
}
$("t-grade").addEventListener("change", drawTeacherSubjects);
document.addEventListener("change", e => {
  const d = e.target.dataset, on = e.target.checked;
  if (d.tsub) { on ? tForm.subjects.add(d.tsub) : tForm.subjects.delete(d.tsub); drawTeacherSubjects(); }
  if (d.tday) on ? tForm.days.add(d.tday) : tForm.days.delete(d.tday);
  if (d.ttime) on ? tForm.times.add(d.ttime) : tForm.times.delete(d.ttime);
  if (d.tmed) on ? tForm.mediums.add(d.tmed) : tForm.mediums.delete(d.tmed);
});
function resetTeacherForm() {
  editTeacherId = null;
  ["t-name", "t-about", "t-years", "t-phone", "t-bio", "t-photo", "t-areas"].forEach(id => { $(id).value = ""; });
  $("t-district").innerHTML = districtOptions(""); $("t-classes").innerHTML = classEditorHtml("t", []);
  tForm.subjects.clear(); tForm.days.clear(); tForm.times.clear(); tForm.mediums.clear();
  document.querySelectorAll("[data-tday],[data-ttime],[data-tmed]").forEach(c => { c.checked = false; });
  $("t-form-title").textContent = "Add a teacher"; $("t-save").textContent = "Add teacher"; $("t-cancel").hidden = true;
  $("t-error").innerHTML = ""; drawTeacherSubjects();
}
function editTeacher(id) {
  const t = teacherById(id); if (!t) return;
  editTeacherId = id;
  $("t-name").value = t.name; $("t-about").value = t.about || ""; $("t-years").value = t.years || "";
  $("t-phone").value = phoneOf(id); $("t-bio").value = t.bio || ""; $("t-photo").value = t.photo || "";
  $("t-areas").value = t.areas || ""; $("t-district").innerHTML = districtOptions(t.district || "");
  $("t-classes").innerHTML = classEditorHtml("t", t.classes || []);
  tForm.subjects = new Set(t.subjects || []);
  const days = new Set((t.free || []).map(f => f.split("-")[0])), times = new Set((t.free || []).map(f => f.split("-")[1]));
  tForm.days = days; tForm.times = times; tForm.mediums = new Set(t.mediums || []);
  document.querySelectorAll("[data-tday]").forEach(c => { c.checked = days.has(c.dataset.tday); });
  document.querySelectorAll("[data-ttime]").forEach(c => { c.checked = times.has(c.dataset.ttime); });
  document.querySelectorAll("[data-tmed]").forEach(c => { c.checked = tForm.mediums.has(c.dataset.tmed); });
  $("t-form-title").textContent = "Change " + t.name; $("t-save").textContent = "Save changes"; $("t-cancel").hidden = false;
  drawTeacherSubjects();
  $("t-form").scrollIntoView({ behavior: "smooth" });
}
$("t-cancel").addEventListener("click", resetTeacherForm);
$("t-save").addEventListener("click", async () => {
  const name = $("t-name").value.trim(), phone = $("t-phone").value.trim(), photo = $("t-photo").value.trim();
  let problem = "";
  if (!name) problem = "Type the teacher's name.";
  else if (!phone) problem = "Type the teacher's phone number.";
  else if (photo && !cleanLink(photo)) problem = "The photo link must start with https://";
  else if (!tForm.subjects.size) problem = "Tick at least one subject.";
  else if (!tForm.days.size || !tForm.times.size) problem = "Tick at least one free day and one free time.";
  if (problem) { $("t-error").innerHTML = `<p class="msg bad">${problem}</p>`; return; }
  const free = [];
  tForm.days.forEach(d => tForm.times.forEach(t => free.push(d + "-" + t)));
  const pub = { name, about: $("t-about").value.trim() || "Teacher", years: parseInt($("t-years").value, 10) || 0,
    bio: $("t-bio").value.trim(), photo, mediums: [...tForm.mediums], subjects: [...tForm.subjects], free,
    district: $("t-district").value, areas: $("t-areas").value.trim(), classes: readClassEditor("t") };
  try {
    if (editTeacherId) {
      await DB.update("teachers", editTeacherId, pub);
      await DB.set("teacherPrivate", editTeacherId, { phone });
      showToast(name + " was saved.");
    } else {
      const id = await DB.add("teachers", { ...pub, rating: 0, reviews: 0, lessons: 0 });
      await DB.set("teacherPrivate", id, { phone });
      showToast(name + " was added.");
    }
    resetTeacherForm();
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
});
function drawTeachers() {
  $("teacher-list").innerHTML = teachers.slice().sort((a, b) => a.name.localeCompare(b.name)).map(t => {
    const sc = teacherScore(sessions, t.id);
    return `<div class="tcard">
      <div class="tcard-top">
        ${t.photo ? `<img class="avatar" src="${safe(safeUrl(t.photo))}" alt="">` : `<span class="avatar">${safe(initials(t.name))}</span>`}
        <div style="min-width:0"><h3>${safe(t.name)}</h3><div class="muted small">${safe(t.about)}</div><div class="small">${icon("lock", 12)} ${safe(phoneOf(t.id)) || "no phone"}</div></div>
      </div>
      <div class="tstats">${sc.reviews ? starsHtml(sc.avg, 14) + " " + sc.avg.toFixed(1) + ` (${sc.reviews})` : "No stars yet"}<span>${sc.lessons} lessons</span>${t.years ? `<span>${t.years} years</span>` : ""}</div>
      <div class="tag-list">${(t.subjects || []).map(k => { const [gid, s] = k.split("|"); return `<span>${safe(s)} · ${safe(gradeName(gid))}</span>`; }).join("")}</div>
      ${(t.classes || []).length ? `<div class="fee-chips">${classChips(t.classes)}</div>` : `<div class="hint">No class types or fees yet. Press Change to add them.</div>`}
      ${t.district || t.areas ? `<div class="place">${icon("pin", 14)}<span>${safe([t.district, t.areas].filter(Boolean).join(" · "))}</span></div>` : ""}
      <div class="small muted">Free: ${(t.free || []).map(freeText).join(", ")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn sm" data-editteacher="${t.id}">${icon("edit", 16)} Change</button>
        <button class="btn sm ${armed === "t" + t.id ? "red" : ""}" data-deltea="${t.id}">${armed === "t" + t.id ? "Sure? Remove" : "Remove"}</button>
      </div>
    </div>`;
  }).join("") || `<p class="muted">No teachers yet. Add one above.</p>`;
}

/* ================= Grade & subject cards ================= */
function swatches(id, chosen) {
  $(id).innerHTML = COLORS.map((c, i) => `<button type="button" class="swatch ${i === chosen ? "on" : ""}" style="background:${c}" data-swatch="${id}|${i}" aria-label="Colour ${i + 1}"></button>`).join("");
}
function iconPicker() {
  $("s-icons").innerHTML = SUBJECT_ICONS.map(n => `<button type="button" class="${n === newSubjectIcon ? "on" : ""}" data-pickicon="${n}" aria-label="${n}">${icon(n, 22)}</button>`).join("");
}
function drawCards() {
  const g = editGradeId && gradeById(editGradeId);
  $("cards-grades").hidden = !!g; $("cards-subjects").hidden = !g;
  if (g) return drawSubjectEditor(g);
  if (!grades.length) {
    $("grade-editor").innerHTML = `<div class="card stack"><h3 style="margin:0">No grade cards yet</h3><p class="muted" style="margin:0">Start with the Sri Lankan grades (Grade 1 to A/L, with subjects). You can change them after.</p><button class="btn yellow" id="seed">Add Sri Lankan grades</button><button class="btn" data-addgrade="1">Add one grade card</button></div>`;
    return;
  }
  const sorted = grades.slice().sort(byOrder);
  $("grade-editor").innerHTML = SECTIONS.filter(s => sorted.some(x => (x.section || "Other") === s)).map(sec => `
    <p class="section-title">${safe(sec)}</p>
    <div class="cards">
      ${sorted.filter(x => (x.section || "Other") === sec).map(x => `
        <div class="gcard editable" style="--c:${colorOf(x)}" data-label="${gradeLabel(x)}" role="button" tabindex="0" data-open="${x.id}">
          <span class="card-tools">
            <button type="button" data-move="${x.id}|-1" aria-label="Move left">${icon("left", 16)}</button>
            <button type="button" data-move="${x.id}|1" aria-label="Move right">${icon("right", 16)}</button>
            <button type="button" class="${armed === "g" + x.id ? "sure" : "danger"}" data-delgrade="${x.id}" aria-label="Remove">${armed === "g" + x.id ? "Sure?" : icon("x", 16)}</button>
          </span>
          <span class="glabel">${gradeLabel(x)}</span>
          <span><span class="gname">${safe(x.name)}</span><span class="gfoot"><span>${(x.subjects || []).length} subjects · edit</span>${icon("chevron", 18)}</span></span>
        </div>`).join("")}
    </div>`).join("") + `<div class="cards" style="margin-top:12px"><button class="add-card" data-addgrade="1">${icon("plus", 28)}Add grade card</button></div>`;
}
function drawSubjectEditor(g) {
  $("edit-title").textContent = g.name;
  swatches("e-colors", editColor);
  const subs = g.subjects || [];
  $("subject-editor").innerHTML = subs.map((s, i) => `
    <div class="scard editable" style="--c:${colorOf(g)};cursor:default">
      <span class="card-tools">
        <button type="button" data-smove="${i}|-1" aria-label="Move left">${icon("left", 16)}</button>
        <button type="button" data-smove="${i}|1" aria-label="Move right">${icon("right", 16)}</button>
        <button type="button" class="${armed === "s" + i ? "sure" : "danger"}" data-delsub="${i}" aria-label="Remove">${armed === "s" + i ? "Sure?" : icon("x", 16)}</button>
      </span>
      <span class="sicon">${subjectIcon(s, 26)}</span>
      <span class="sname">${safe(s.name)}</span>
    </div>`).join("") + `<button class="add-card" id="open-sub-form">${icon("plus", 28)}Add subject card</button>`;
}
async function saveSubjects(g, subjects, msg) {
  try { await DB.update("grades", g.id, { subjects }); if (msg) showToast(msg); }
  catch (e) { console.error(e); showToast("Could not save. Try again."); }
}
$("g-add").addEventListener("click", async () => {
  const name = $("g-name").value.trim();
  if (!name) { showToast("Type a name for the grade card."); return; }
  const order = grades.reduce((m, x) => Math.max(m, x.order || 0), 0) + 1;
  try {
    await DB.add("grades", { name, label: $("g-label").value.trim(), section: $("g-section").value, color: newGradeColor, order, subjects: [] });
    $("g-name").value = ""; $("g-label").value = ""; $("grade-form").hidden = true;
    showToast(name + " card added. Tap it to add subjects.");
  } catch (e) { console.error(e); showToast("Could not save. Try again."); }
});
$("g-cancel").addEventListener("click", () => { $("grade-form").hidden = true; });
$("cards-back").addEventListener("click", () => { editGradeId = null; armed = null; drawCards(); });
$("e-save").addEventListener("click", async () => {
  const g = gradeById(editGradeId), name = $("e-name").value.trim();
  if (!g || !name) { showToast("Type a name."); return; }
  try { await DB.update("grades", g.id, { name, label: $("e-label").value.trim(), section: $("e-section").value, color: editColor }); showToast("Saved."); }
  catch (e) { console.error(e); showToast("Could not save. Try again."); }
});
$("s-add").addEventListener("click", () => {
  const g = gradeById(editGradeId), name = $("s-name").value.trim();
  if (!g || !name) { showToast("Type a subject name."); return; }
  const subs = (g.subjects || []).slice();
  if (subs.some(s => s.name.toLowerCase() === name.toLowerCase())) { showToast(name + " is already in " + g.name + "."); return; }
  subs.push({ name, icon: newSubjectIcon });
  $("s-name").value = ""; $("subject-form").hidden = true;
  saveSubjects(g, subs, name + " card added.");
});
$("s-cancel").addEventListener("click", () => { $("subject-form").hidden = true; });

/* ================= Forum ================= */
function drawForum() {
  $("forum-list").innerHTML = posts.slice().sort((a, b) => b.made.localeCompare(a.made)).map(p => `
    <div class="item">
      <div class="facts"><span class="badge booked">${safe(p.gradeName)} · ${safe(p.subject)}</span><span>${safe(p.name)}</span><span>${timeAgo(p.made)}</span><span>${p.answerCount || 0} answers</span></div>
      <h3 style="margin:0">${safe(p.title)}</h3>
      ${p.text ? `<p style="margin:0">${safe(p.text)}</p>` : ""}
      <input id="ans-${p.id}" placeholder="Answer as Admin" aria-label="Answer as Admin">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn sm yellow" data-adminans="${p.id}">Post answer</button>
        <button class="btn sm ${armed === "p" + p.id ? "red" : ""}" data-delpost="${p.id}">${armed === "p" + p.id ? "Sure? Remove" : "Remove post"}</button>
      </div>
    </div>`).join("") || `<p class="muted">No posts yet.</p>`;
}

/* ================= Clicks ================= */
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.open) { e.preventDefault(); e.target.click(); }
});
document.addEventListener("click", async e => {
  if ($("app").hidden) return;
  const b = e.target.closest("button");
  const d = b ? b.dataset : {};
  const confirmTwice = key => { if (armed !== key) { armed = key; drawAll(); return false; } armed = null; return true; };
  try {
    if (d.tab) return showTab(d.tab);
    if (d.choose) {
      openRequest = openRequest === d.choose ? null : d.choose;
      const r = requests.find(x => x.id === d.choose);
      if (r && r.status === "new") await DB.update("requests", r.id, { status: "wait" });
      return drawAll();
    }
    if (d.book) { const [r, t] = d.book.split("|"); return book(r, t); }
    if (d.delreq) { if (confirmTwice("req" + d.delreq)) { await DB.remove("requests", d.delreq); showToast("Request deleted."); } return; }
    if (d.finish) {
      const s = sessions.find(x => x.id === d.finish);
      await DB.update("sessions", s.id, { status: "done" });
      if (requests.some(r => r.id === s.requestId)) await DB.update("requests", s.requestId, { status: "done" });
      return showToast("Marked finished. The student can now give stars.");
    }
    if (d.delpaper) {
      if (confirmTwice("pp" + d.delpaper)) {
        await DB.remove("papers", d.delpaper);
        if (paperLinks.some(x => x.id === d.delpaper)) await DB.remove("paperLinks", d.delpaper);
        showToast("Paper removed.");
      }
      return;
    }
    if (d.approvepay) { const [id, m] = d.approvepay.split("|"); return approvePayment(id, +m); }
    if (d.rejectpay) { if (confirmTwice("rp" + d.rejectpay)) { await DB.update("payments", d.rejectpay, { status: "rejected", decidedAt: new Date().toISOString() }); showToast("Payment marked as not received."); } return; }
    if (d.extend) return giveAccess(d.extend, 1);
    if (d.delaccess) { if (confirmTwice("da" + d.delaccess)) { await DB.remove("access", d.delaccess); showToast("Papers locked again for this student."); } return; }
    if (d.approvejoin) return approveJoin(d.approvejoin);
    if (d.rejectjoin) {
      if (confirmTwice("rj" + d.rejectjoin)) {
        const note = (($("jn-" + d.rejectjoin) || {}).value || "").trim();
        await DB.update("teacherApps", d.rejectjoin, { status: "rejected", adminNote: note });
        showToast("Request rejected.");
      }
      return;
    }
    if (d.editteacher) return editTeacher(d.editteacher);
    if (d.deltea) {
      if (confirmTwice("t" + d.deltea)) { await DB.remove("teachers", d.deltea); await DB.remove("teacherPrivate", d.deltea); if (editTeacherId === d.deltea) resetTeacherForm(); showToast("Teacher removed."); }
      return;
    }
    if (b && b.id === "seed") {
      b.disabled = true;
      try { await DB.addMany("grades", DEFAULT_GRADES); showToast("Sri Lankan grades added."); }
      catch (er) { console.error(er); showToast("Could not save. Check the admin email in firestore.rules."); b.disabled = false; }
      return;
    }
    if (d.addgrade) { $("grade-form").hidden = false; newGradeColor = grades.length % COLORS.length; swatches("g-colors", newGradeColor); $("g-name").focus(); return; }
    if (d.swatch) {
      const [id, i] = d.swatch.split("|");
      if (id === "g-colors") { newGradeColor = +i; swatches("g-colors", newGradeColor); } else { editColor = +i; swatches("e-colors", editColor); }
      return;
    }
    if (d.pickicon) { newSubjectIcon = d.pickicon; iconPicker(); return; }
    if (d.move) {
      const [id, dir] = d.move.split("|");
      const sorted = grades.slice().sort(byOrder), i = sorted.findIndex(x => x.id === id), j = i + +dir;
      if (j < 0 || j >= sorted.length) return;
      sorted.splice(j, 0, sorted.splice(i, 1)[0]);
      await Promise.all(sorted.map((x, k) => (x.order !== k + 1 ? DB.update("grades", x.id, { order: k + 1 }) : null)));
      return;
    }
    if (d.delgrade) { if (confirmTwice("g" + d.delgrade)) { const n = gradeName(d.delgrade); await DB.remove("grades", d.delgrade); showToast(n + " card removed."); } return; }
    if (!b) {
      const card = e.target.closest("[data-open]");
      if (card) {
        editGradeId = card.dataset.open; armed = null;
        const g = gradeById(editGradeId);
        editColor = g.color || 0; $("e-name").value = g.name; $("e-label").value = g.label || ""; $("e-section").value = g.section || "Other";
        $("subject-form").hidden = true; drawCards(); window.scrollTo({ top: $("tab-cards").offsetTop - 70 });
      }
      return;
    }
    if (b.id === "open-sub-form") { $("subject-form").hidden = false; newSubjectIcon = "book"; iconPicker(); $("s-name").focus(); return; }
    if (d.smove) {
      const g = gradeById(editGradeId), [i, dir] = d.smove.split("|").map(Number), subs = (g.subjects || []).slice(), j = i + dir;
      if (j < 0 || j >= subs.length) return;
      subs.splice(j, 0, subs.splice(i, 1)[0]); armed = null;
      return saveSubjects(g, subs);
    }
    if (d.delsub) {
      if (!confirmTwice("s" + d.delsub)) return;
      const g = gradeById(editGradeId), subs = (g.subjects || []).slice(), gone = subs.splice(+d.delsub, 1)[0];
      return saveSubjects(g, subs, gone.name + " card removed.");
    }
    if (d.delpost) { if (confirmTwice("p" + d.delpost)) { await DB.remove("posts", d.delpost); showToast("Post removed."); } return; }
    if (d.adminans) {
      const input = $("ans-" + d.adminans), text = input.value.trim();
      if (!text) return;
      const p = posts.find(x => x.id === d.adminans), me = (await DB.currentUser()).uid;
      await DB.add("posts/" + p.id + "/answers", { uid: me, name: "Teacher (Admin)", text, made: new Date().toISOString(), admin: true });
      await DB.update("posts", p.id, { answerCount: (p.answerCount || 0) + 1 });
      input.value = ""; showToast("Answer posted.");
    }
  } catch (er) { console.error(er); showToast("Something went wrong. Try again."); }
});

/* Demo reset (demo mode only) */
let resetArmed = false;
$("reset").addEventListener("click", () => {
  if (!resetArmed) { resetArmed = true; $("reset-note").textContent = "Click again to delete all demo changes."; return; }
  if (DB.resetDemo) DB.resetDemo();
  location.reload();
});
