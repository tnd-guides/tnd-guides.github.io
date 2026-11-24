/* TND Guides – teacher join request ("Teach with us") */
import DB, { LIVE } from "./db.js?v=8";
import { langSwitch, startTranslation } from "./i18n.js";
import { $, safe, byOrder, cleanLink, showToast, demoBanner, bottomNav, accountChip, loginLink, timeAgo,
         classEditorHtml, readClassEditor, classChips, districtOptions, DAYS, DAY_NAMES, TIMES, MEDIUMS } from "./common.js";

demoBanner(LIVE);
bottomNav("teachers");
langSwitch();
accountChip(DB);
startTranslation();

let user = null, grades = [], myApp = null, editing = false, stopApp = null;
const f = { subjects: new Set(), days: new Set(), times: new Set(), mediums: new Set() };
const gradeName = id => (grades.find(g => g.id === id) || {}).name || "?";

/* ---------- Which box to show ---------- */
function draw() {
  const gate = $("join-gate"), status = $("join-status"), form = $("join-form");
  gate.hidden = true; status.hidden = true; form.hidden = true;
  if (!user || !user.verified) {
    gate.hidden = false;
    gate.innerHTML = !user
      ? `<h3 style="margin:0">Log in first</h3><p class="muted" style="margin:0">Log in with Google or your email to send a teacher request. It takes one minute.</p>
         <a class="btn yellow block" href="${loginLink("join.html")}">Log in or create account</a>`
      : `<h3 style="margin:0">Confirm your email</h3><p class="muted" style="margin:0">We sent a link to <b>${safe(user.email)}</b>. Open it, then come back.</p>
         <a class="btn yellow block" href="${loginLink("join.html")}">I confirmed it / send again</a>`;
    return;
  }
  if (myApp && !editing) {
    status.hidden = false;
    const s = myApp.status;
    status.innerHTML = `<div class="card stack">
      ${s === "approved" ? `<p class="msg good" style="margin:0">Welcome! Your request was accepted. You are now on the <a href="teachers.html">Teachers</a> page.</p>`
        : s === "rejected" ? `<p class="msg bad" style="margin:0">Your request was not accepted this time.${myApp.adminNote ? " " + safe(myApp.adminNote) : ""}</p>`
        : `<p class="msg info" style="margin:0">Your request was sent ${timeAgo(myApp.made)}. The admin will check it and call you.</p>`}
      <div class="small muted">${safe(myApp.name)} · ${myApp.subjects.length} subjects · ${safe(myApp.district || "")}</div>
      ${s !== "approved" ? `<button class="btn block" id="j-edit">${s === "rejected" ? "Change and send again" : "Change my request"}</button>` : ""}
    </div>`;
    return;
  }
  form.hidden = false;
}

/* ---------- Form pieces ---------- */
function fillStatic() {
  $("j-mediums").innerHTML = MEDIUMS.map(m => `<label><input type="checkbox" data-jmed="${m}" ${f.mediums.has(m) ? "checked" : ""}>${m}</label>`).join("");
  $("j-days").innerHTML = DAYS.map(d => `<label><input type="checkbox" data-jday="${d}" ${f.days.has(d) ? "checked" : ""}>${DAY_NAMES[d]}</label>`).join("");
  $("j-times").innerHTML = TIMES.map(t => `<label><input type="checkbox" data-jtime="${t.id}" ${f.times.has(t.id) ? "checked" : ""}>${t.name} (${t.hint})</label>`).join("");
}
function fillGrades() {
  const keep = $("j-grade").value;
  $("j-grade").innerHTML = grades.slice().sort(byOrder).map(g => `<option value="${g.id}">${safe(g.name)}</option>`).join("");
  if (keep && grades.some(g => g.id === keep)) $("j-grade").value = keep;
  drawSubjects();
}
function drawSubjects() {
  const g = grades.find(x => x.id === $("j-grade").value);
  $("j-subjects").innerHTML = (g ? g.subjects || [] : []).map(s => {
    const key = g.id + "|" + s.name;
    return `<label><input type="checkbox" data-jsub="${safe(key)}" ${f.subjects.has(key) ? "checked" : ""}>${safe(s.name)}</label>`;
  }).join("") || `<span class="hint">No subjects yet.</span>`;
  $("j-chosen").innerHTML = f.subjects.size
    ? [...f.subjects].map(k => { const [gid, s] = k.split("|"); return `<span class="badge booked">${safe(gradeName(gid))} ${safe(s)}</span>`; }).join(" ")
    : `<span class="muted">none yet. Tick subjects, change the grade, tick more.</span>`;
}
function loadApp(a) {
  $("j-name").value = a.name || ""; $("j-about").value = a.about || ""; $("j-years").value = a.years || "";
  $("j-phone").value = a.phone || ""; $("j-bio").value = a.bio || ""; $("j-photo").value = a.photo || "";
  $("j-areas").value = a.areas || ""; $("j-district").innerHTML = districtOptions(a.district || "");
  f.subjects = new Set(a.subjects || []); f.mediums = new Set(a.mediums || []);
  f.days = new Set((a.free || []).map(x => x.split("-")[0])); f.times = new Set((a.free || []).map(x => x.split("-")[1]));
  $("j-classes").innerHTML = classEditorHtml("j", a.classes || []);
  fillStatic(); drawSubjects();
}

$("j-grade").addEventListener("change", drawSubjects);
document.addEventListener("change", e => {
  const d = e.target.dataset, on = e.target.checked;
  if (d.jsub) { on ? f.subjects.add(d.jsub) : f.subjects.delete(d.jsub); drawSubjects(); }
  if (d.jmed) on ? f.mediums.add(d.jmed) : f.mediums.delete(d.jmed);
  if (d.jday) on ? f.days.add(d.jday) : f.days.delete(d.jday);
  if (d.jtime) on ? f.times.add(d.jtime) : f.times.delete(d.jtime);
});
document.addEventListener("click", e => {
  if (e.target.id === "j-edit") { editing = true; loadApp(myApp); draw(); window.scrollTo({ top: 0 }); }
});

$("j-send").addEventListener("click", async () => {
  const name = $("j-name").value.trim(), phone = $("j-phone").value.trim(), photo = $("j-photo").value.trim();
  const classes = readClassEditor("j");
  let problem = "";
  if (!name) problem = "Please type your full name.";
  else if (!/^[+0-9 ()-]{9,15}$/.test(phone)) problem = "Please type a phone number the admin can call, e.g. 0771234567.";
  else if (photo && !cleanLink(photo)) problem = "The photo link must start with https://";
  else if (!f.subjects.size) problem = "Please tick at least one subject.";
  else if (!$("j-district").value) problem = "Please choose your district.";
  else if (!classes.length) problem = "Please tick at least one class type.";
  else if (classes.some(c => !c.fee && c.per !== "negotiable")) problem = "Please type the fee for each class type you ticked, or choose Negotiable.";
  else if (!f.days.size || !f.times.size) problem = "Please tick at least one free day and one free time.";
  if (problem) { $("j-error").innerHTML = `<p class="msg bad">${problem}</p>`; return; }
  $("j-error").innerHTML = "";
  const free = [];
  f.days.forEach(d => f.times.forEach(t => free.push(d + "-" + t)));
  $("j-send").disabled = true;
  try {
    await DB.set("teacherApps", user.uid, {
      uid: user.uid, email: user.email, name, phone, about: $("j-about").value.trim(), years: parseInt($("j-years").value, 10) || 0,
      bio: $("j-bio").value.trim(), photo, mediums: [...f.mediums], subjects: [...f.subjects],
      district: $("j-district").value, areas: $("j-areas").value.trim(), classes, free,
      made: new Date().toISOString(), status: "pending", adminNote: ""
    });
    editing = false;
    showToast("Request sent! The admin will check it.");
  } catch (er) { console.error(er); $("j-error").innerHTML = `<p class="msg bad">Could not send. Check your internet and try again.</p>`; }
  $("j-send").disabled = false;
});

/* ---------- Start ---------- */
$("j-district").innerHTML = districtOptions("");
$("j-classes").innerHTML = classEditorHtml("j", []);
fillStatic();
DB.watch("grades", l => { grades = l; fillGrades(); });
DB.onUser(u => {
  user = u;
  if (stopApp) { stopApp(); stopApp = null; }
  myApp = null;
  if (u && u.verified) {
    if (!$("j-name").value) $("j-name").value = u.name;
    stopApp = DB.watch("teacherApps", l => { myApp = l[0] || null; draw(); }, ["uid", u.uid]);
  }
  draw();
});
