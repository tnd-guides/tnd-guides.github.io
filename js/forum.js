/* TND Guides – forum page */
import DB, { LIVE } from "./db.js";
import { langSwitch, startTranslation } from "./i18n.js";
import { $, safe, byOrder, timeAgo, hasContactInfo, showToast, demoBanner, bottomNav, icon, accountChip, SECTIONS } from "./common.js";

demoBanner(LIVE);
bottomNav("forum");
langSwitch();
accountChip(DB);
startTranslation();
/* Anyone can post. Logged-in users post with their account, others as an invisible guest. */
const myUid = async () => (user ? user.uid : DB.guest());

let grades = [], posts = [], user = null, filter = "all";
const answers = {};          // postId → list of answers
const watching = {};         // postId → stop function
const openPosts = new Set();
function myName() { try { return localStorage.getItem("guruhub_me") || ""; } catch (e) { return ""; } }

/* ---------- Filter buttons ---------- */
function drawFilter() {
  const opts = ["all", ...SECTIONS.filter(s => grades.some(g => (g.section || "Other") === s))];
  $("filter").innerHTML = opts.map(s =>
    `<button type="button" class="chip ${filter === s ? "on" : ""}" data-filter="${safe(s)}">${s === "all" ? "Everyone" : safe(s)}</button>`).join("");
}

/* ---------- Question list ---------- */
function drawList() {
  const list = posts.filter(p => filter === "all" || p.section === filter).sort((a, b) => b.made.localeCompare(a.made));
  if (!list.length) { $("list").innerHTML = `<div class="card"><p>No questions here yet. Be the first to ask!</p></div>`; return; }
  $("list").innerHTML = list.map(p => {
    const open = openPosts.has(p.id), ans = answers[p.id] || [];
    return `<div class="item">
      <div class="facts"><span class="badge booked">${safe(p.gradeName)} · ${safe(p.subject)}</span><span>${safe(p.name)}</span><span>${timeAgo(p.made)}</span></div>
      <h3 style="margin:4px 0 0">${safe(p.title)}</h3>
      ${p.text ? `<p style="margin:0">${safe(p.text)}</p>` : ""}
      <div><button class="back" data-toggle="${p.id}">${icon("chat", 18)} ${open ? "Hide answers" : `${p.answerCount || 0} answer${p.answerCount === 1 ? "" : "s"} · Answer`}</button></div>
      ${open ? `<div class="stack">
        ${ans.slice().sort((a, b) => a.made.localeCompare(b.made)).map(a => `
          <div style="border-left:3px solid ${a.admin ? "var(--yellow)" : "var(--line)"};padding-left:12px">
            <div class="facts"><b style="color:var(--ink)">${safe(a.name)}</b>${a.admin ? '<span class="badge wait">Admin</span>' : ""}<span>${timeAgo(a.made)}</span></div>
            <p style="margin:2px 0 0">${safe(a.text)}</p>
          </div>`).join("")}
        <label class="field" for="an-${p.id}">Your name<input id="an-${p.id}" maxlength="30" value="${safe(myName())}"></label>
        <label class="field" for="at-${p.id}">Your answer<textarea id="at-${p.id}" maxlength="600" placeholder="Explain it simply"></textarea></label>
        <div id="ae-${p.id}"></div>
        <div><button class="btn" data-answer="${p.id}">Post answer</button></div>
      </div>` : ""}
    </div>`;
  }).join("");
}

/* ---------- New question form ---------- */
function fillGradeSelect() {
  const keep = $("q-grade").value;
  $("q-grade").innerHTML = grades.slice().sort(byOrder).map(g => `<option value="${g.id}">${safe(g.name)}</option>`).join("");
  if (keep && grades.some(g => g.id === keep)) $("q-grade").value = keep;
  fillSubjectSelect();
}
function fillSubjectSelect() {
  const g = grades.find(x => x.id === $("q-grade").value);
  $("q-subject").innerHTML = (g ? g.subjects || [] : []).map(s => `<option>${safe(s.name)}</option>`).join("");
}
$("q-grade").addEventListener("change", fillSubjectSelect);
$("open-ask").addEventListener("click", () => {
  $("ask-box").hidden = false; if (!$("q-name").value) $("q-name").value = myName(); $("q-title").focus(); });
$("cancel").addEventListener("click", () => { $("ask-box").hidden = true; });

$("post").addEventListener("click", async () => {
  const name = $("q-name").value.trim(), title = $("q-title").value.trim(), text = $("q-text").value.trim();
  const g = grades.find(x => x.id === $("q-grade").value);
  let problem = "";
  if (!name) problem = "Please type your first name.";
  else if (!title) problem = "Please type your question.";
  else if (!g || !$("q-subject").value) problem = "Please choose a grade and subject.";
  else if (hasContactInfo(name + " " + title + " " + text)) problem = "Please remove phone numbers, emails or app names. Posts must stay inside TND Guides.";
  if (problem) { $("ask-error").innerHTML = `<p class="msg bad">${problem}</p>`; return; }
  try {
    const uid = await myUid();
    await DB.add("posts", { uid, name, gradeId: g.id, gradeName: g.name, section: g.section || "Other", subject: $("q-subject").value,
      title, text, made: new Date().toISOString(), answerCount: 0 });
    $("ask-box").hidden = true; $("q-title").value = ""; $("q-text").value = ""; $("ask-error").innerHTML = "";
    showToast("Your question is posted!");
  } catch (e) { console.error(e); $("ask-error").innerHTML = `<p class="msg bad">Could not post. Check your internet and try again.</p>`; }
});

/* ---------- Taps ---------- */
document.addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const d = b.dataset;
  if (d.filter) { filter = d.filter; drawFilter(); drawList(); }
  else if (d.toggle) {
    const id = d.toggle;
    if (openPosts.has(id)) { openPosts.delete(id); }
    else {
      openPosts.add(id);
      if (!watching[id]) watching[id] = DB.watch("posts/" + id + "/answers", l => { answers[id] = l; drawList(); });
    }
    drawList();
  }
  else if (d.answer) {
    const id = d.answer, name = $("an-" + id).value.trim(), text = $("at-" + id).value.trim();
    let problem = "";
    if (!name) problem = "Please type your name.";
    else if (!text) problem = "Please type your answer.";
    else if (hasContactInfo(name + " " + text)) problem = "Please remove phone numbers, emails or app names.";
    if (problem) { $("ae-" + id).innerHTML = `<p class="msg bad">${problem}</p>`; return; }
    try {
      const uid = await myUid();
      const p = posts.find(x => x.id === id);
      await DB.add("posts/" + id + "/answers", { uid, name, text, made: new Date().toISOString(), admin: false });
      await DB.update("posts", id, { answerCount: (p.answerCount || 0) + 1 });
      showToast("Thanks for helping!");
    } catch (er) { console.error(er); $("ae-" + id).innerHTML = `<p class="msg bad">Could not post. Try again.</p>`; }
  }
});

/* ---------- Start ---------- */
DB.watch("grades", l => { grades = l; drawFilter(); fillGradeSelect(); });
DB.watch("posts", l => { posts = l; drawList(); }, null, () => { $("list").innerHTML = `<p class="msg bad">Could not load questions. Check your internet.</p>`; });
DB.onUser(u => { user = u; if (u && !$("q-name").value) $("q-name").value = u.name.split(" ")[0]; });
