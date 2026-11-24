/* TND Guides – shared helpers used by every page */
import { icon, hasIcon } from "./icons.js";
import { locale } from "./i18n.js";

/* ---------- Card colours (admin picks one per grade) ---------- */
export const COLORS = ["#c62828", "#1f6feb", "#15803d", "#6d28d9", "#c2410c", "#0f766e", "#be185d", "#92400e"];

/* ---------- Sections that group the grade cards ---------- */
export const SECTIONS = ["Primary", "Secondary", "O/Level", "A/Level", "Other"];

/* ---------- Paper types (like mathsapi.com) and mediums ---------- */
export const PAPER_KINDS = [
  { id: "past", name: "Past papers", one: "Past paper", icon: "file" },
  { id: "scheme", name: "Marking schemes", one: "Marking scheme", icon: "filecheck" },
  { id: "model", name: "Model papers", one: "Model paper", icon: "clipboard" },
  { id: "school", name: "School papers", one: "School paper", icon: "school" },
  { id: "notes", name: "Notes", one: "Notes", icon: "notebook" }
];
export const MEDIUMS = ["Sinhala", "English", "Tamil"];

/* ---------- Starting grades and subjects (Sri Lankan curriculum) ---------- */
const S = (name, icon) => ({ name, icon });
const primary = () => [S("Maths", "calculator"), S("Sinhala", "languages"), S("Tamil", "languages"), S("English", "type"), S("Environment", "leaf"), S("Religion", "sun")];
const secondary = () => [S("Maths", "calculator"), S("Science", "flask"), S("English", "type"), S("Sinhala", "languages"), S("Tamil", "languages"), S("History", "landmark"), S("Geography", "globe"), S("Civics", "scale"), S("ICT", "monitor"), S("Religion", "sun"), S("Health", "heart")];

export const DEFAULT_GRADES = [
  ...[1, 2, 3, 4, 5].map(g => ({ name: "Grade " + g, label: String(g), section: "Primary", color: (g - 1) % 8, subjects: primary() })),
  ...[6, 7, 8, 9, 10].map(g => ({ name: "Grade " + g, label: String(g), section: "Secondary", color: (g - 1) % 8, subjects: secondary() })),
  { name: "O/Level", label: "OL", section: "O/Level", color: 0, subjects: [S("Maths", "calculator"), S("Science", "flask"), S("English", "type"), S("Sinhala", "languages"), S("Tamil", "languages"), S("History", "landmark"), S("Religion", "sun"), S("ICT", "monitor"), S("Commerce", "store"), S("Geography", "globe")] },
  { name: "A/L Maths", label: "AL", section: "A/Level", color: 1, subjects: [S("Combined Maths", "sigma"), S("Physics", "magnet"), S("Chemistry", "testtube"), S("ICT", "monitor")] },
  { name: "A/L Science", label: "AL", section: "A/Level", color: 2, subjects: [S("Biology", "dna"), S("Physics", "magnet"), S("Chemistry", "testtube"), S("Agriculture", "sprout")] },
  { name: "A/L Commerce", label: "AL", section: "A/Level", color: 4, subjects: [S("Accounting", "receipt"), S("Business Studies", "briefcase"), S("Economics", "chart")] },
  { name: "A/L Arts", label: "AL", section: "A/Level", color: 3, subjects: [S("Political Science", "vote"), S("Geography", "globe"), S("Sinhala", "languages"), S("Logic", "puzzle"), S("History", "landmark")] },
  { name: "A/L Technology", label: "AL", section: "A/Level", color: 5, subjects: [S("Engineering Tech", "cog"), S("Science for Tech", "microscope"), S("Bio-systems Tech", "sprout")] }
].map((g, i) => ({ ...g, order: i + 1 }));

/* ---------- Free-time choices ---------- */
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_NAMES = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
export const TIMES = [
  { id: "am", name: "Morning", hint: "9 am", hour: 9 },
  { id: "pm", name: "Afternoon", hint: "2 pm", hour: 14 },
  { id: "eve", name: "Evening", hint: "6 pm", hour: 18 }
];

/* ---------- Small helpers ---------- */
export const $ = id => document.getElementById(id);
export function safe(text) {
  return String(text == null ? "" : text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
export const shortId = id => String(id).slice(0, 6).toUpperCase();
export const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
export const colorOf = g => COLORS[(g && g.color) || 0] || COLORS[0];
export function starsHtml(n, size = 16) {
  let out = "";
  for (let i = 1; i <= 5; i++) out += `<span class="${i <= Math.round(n) ? "star-on" : "star-off"}">${icon("star", size)}</span>`;
  return `<span class="stars" aria-label="${n.toFixed ? n.toFixed(1) : n} out of 5">${out}</span>`;
}
export function freeText(slot) {
  const [d, t] = slot.split("-");
  const time = TIMES.find(x => x.id === t);
  return DAY_NAMES[d] + " " + (time ? time.name.toLowerCase() : "");
}
export function niceDate(iso) {
  return new Date(iso).toLocaleString(locale(), { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}
export function timeAgo(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  if (m < 1440) return Math.round(m / 60) + " hours ago";
  return Math.round(m / 1440) + " days ago";
}
export const initials = name => String(name || "?").replace(/^(Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+/i, "").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

/* Subject icon (SVG). Unknown or old values fall back to a book icon. */
export const subjectIcon = (s, size = 26) => icon(hasIcon(s && s.icon) ? s.icon : "book", size);
/* Grade label: "1", "OL", "AL" … */
export const gradeLabel = g => safe(g.label || g.name.replace(/^Grade\s*/i, "").slice(0, 3));

/* Stops students sharing phone numbers or emails, so every meeting goes through the admin. */
export function hasContactInfo(text) {
  return /(\+?94|0)\s?7\d[\s-]?\d{3}[\s-]?\d{4}/.test(text) ||
         /[\w.+-]+@[\w-]+\.[\w.]+/.test(text) ||
         /\b(whats\s?app|viber|telegram|imo|call me|my number)\b/i.test(text);
}

/* Only https links are used in pages (blocks javascript: and other tricks) */
export const safeUrl = u => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || "")) ? String(u) : "#");

/* Accepts a Google Drive (or any https) link */
export function cleanLink(url) {
  url = String(url || "").trim();
  if (!/^https:\/\//i.test(url)) return "";
  return url;
}

export function showToast(text) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = text; t.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { t.hidden = true; }, 3800);
}

export function demoBanner(live) {
  if (live) return;
  const b = document.createElement("div");
  b.className = "demo-bar";
  b.innerHTML = `<div class="wrap">Demo mode: data is saved on this device only. See SETUP.md to go live.</div>`;
  document.body.prepend(b);
}

/* Bottom navigation bar for phones */
export function bottomNav(active) {
  const items = [
    ["index.html", "home", "Home", "home"],
    ["index.html#mine", "list", "My lessons", "mine"],
    ["teachers.html", "users", "Teachers", "teachers"],
    ["forum.html", "chat", "Ask class", "forum"]
  ];
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Main");
  nav.innerHTML = items.map(([href, ic, label, key]) =>
    `<a href="${href}" class="${key === active ? "on" : ""}">${icon(ic, 22)}<span>${label}</span></a>`).join("");
  document.body.appendChild(nav);
  document.body.classList.add("has-bottom-nav");
}

/* ---------- Teacher rating from reviews ---------- */
export function teacherScore(sessions, teacherId) {
  const done = sessions.filter(s => s.teacherId === teacherId && s.status === "done");
  const rated = done.filter(s => s.stars);
  const avg = rated.length ? rated.reduce((a, s) => a + s.stars, 0) / rated.length : 0;
  return { lessons: done.length, reviews: rated.length, avg: Math.round(avg * 10) / 10 };
}

/* ---------- Automatic scheduling ----------
   First day/time in the next 3 weeks when the student and the teacher
   are both free and the teacher has no other lesson then. */
export function findNextTime(request, teacher, sessions) {
  const taken = new Set(sessions.filter(s => s.status === "booked" && s.teacherId === teacher.id).map(s => new Date(s.when).getTime()));
  for (let add = 1; add <= 21; add++) {
    const day = new Date(); day.setDate(day.getDate() + add);
    const dayCode = DAYS[(day.getDay() + 6) % 7];
    for (const time of TIMES) {
      const slot = dayCode + "-" + time.id;
      if (!request.free.includes(slot) || !(teacher.free || []).includes(slot)) continue;
      const when = new Date(day); when.setHours(time.hour, 0, 0, 0);
      if (!taken.has(when.getTime())) return when.toISOString();
    }
  }
  return null;
}

/* ---------- Login helpers ---------- */
/* Plain-English message for a login error */
export function authMessage(e) {
  const code = (e && (e.code || e.message)) || "";
  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/user-not-found": "Wrong email or password.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/email-already-in-use": "This email already has an account. Choose Log in instead.",
    "auth/weak-password": "The password needs at least 6 letters or numbers.",
    "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
    "auth/network-request-failed": "No internet connection. Check it and try again.",
    "auth/popup-closed-by-user": "The Google window was closed. Try again.",
    "auth/cancelled-popup-request": "The Google window was closed. Try again.",
    "auth/unauthorized-domain": "This website address is not allowed yet. The admin must add it in Firebase (see SETUP.md).",
    "auth/operation-not-allowed": "This way of logging in is turned off. The admin must turn it on in Firebase."
  };
  return map[code] || "Something went wrong. Please try again.";
}
/* Only allow going back to a page on this site after login */
export function safeNext(next) {
  if (!next || /^[a-z]+:|^\/\/|\\/i.test(next)) return "";
  return next;
}
export function loginLink(next) { return "login.html?next=" + encodeURIComponent(next || "index.html"); }

/* Account button in the top bar: "Log in" or the user's initials */
export function accountChip(DB) {
  const bar = document.querySelector(".topbar .wrap");
  if (!bar) return;
  const a = document.createElement("a");
  a.className = "acct";
  a.href = "login.html";
  bar.appendChild(a);
  DB.onUser(u => {
    if (u) { a.innerHTML = `<span class="acct-dot">${safe(initials(u.name))}</span>`; a.href = "login.html"; a.setAttribute("aria-label", "My account"); a.classList.add("in"); }
    else { a.textContent = "Log in"; a.href = loginLink(location.pathname.split("/").pop() + location.hash); a.removeAttribute("aria-label"); a.classList.remove("in"); }
  });
}

/* ---------- Teacher class types, fees and places ---------- */
export const CLASS_TYPES = [
  { id: "online", name: "Online class" },
  { id: "group", name: "Group class" },
  { id: "hall", name: "Hall class" },
  { id: "individual", name: "Individual class" }
];
export const FEE_PER = [
  { id: "month", name: "per month" },
  { id: "class", name: "per class" },
  { id: "hour", name: "per hour" }
];
export const DISTRICTS = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
  "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

/* "Rs. 2,500 / month" */
export function feeText(c) {
  if (!c || !c.fee) return "";
  return "Rs. " + Number(c.fee).toLocaleString("en-US") + " / " + (c.per || "month");
}
/* Small chips showing each class type and its fee (used on teacher cards) */
export function classChips(classes) {
  return (classes || []).map(c => {
    const t = CLASS_TYPES.find(x => x.id === c.type);
    if (!t) return "";
    return `<span class="fee-chip"><b>${safe(t.name)}</b>${c.fee ? `<span>${safe(feeText(c))}</span>` : ""}</span>`;
  }).join("");
}
/* Form rows: tick a class type, type its fee, choose per month/class/hour.
   prefix keeps ids unique when the form is used twice on one page. */
export function classEditorHtml(prefix, classes) {
  const has = id => (classes || []).find(c => c.type === id);
  return CLASS_TYPES.map(t => {
    const c = has(t.id) || {};
    return `<div class="class-row">
      <label class="class-tick"><input type="checkbox" id="${prefix}-on-${t.id}" ${has(t.id) ? "checked" : ""}> ${safe(t.name)}</label>
      <label class="class-fee">Rs.<input id="${prefix}-fee-${t.id}" type="number" inputmode="numeric" min="0" step="50" value="${c.fee || ""}" placeholder="Fee" aria-label="${safe(t.name)} fee in rupees"></label>
      <select id="${prefix}-per-${t.id}" aria-label="${safe(t.name)} fee period">${FEE_PER.map(f => `<option value="${f.id}" ${c.per === f.id ? "selected" : ""}>${f.name}</option>`).join("")}</select>
    </div>`;
  }).join("");
}
export function readClassEditor(prefix) {
  return CLASS_TYPES.filter(t => { const el = document.getElementById(`${prefix}-on-${t.id}`); return el && el.checked; })
    .map(t => ({ type: t.id, fee: Math.max(0, parseInt(document.getElementById(`${prefix}-fee-${t.id}`).value, 10) || 0),
                 per: document.getElementById(`${prefix}-per-${t.id}`).value }));
}
export const districtOptions = (chosen) => `<option value="">Choose district</option>` +
  DISTRICTS.map(d => `<option ${d === chosen ? "selected" : ""}>${d}</option>`).join("");

/* Lowest fee, for "From Rs. …" */
export function lowestFee(classes) {
  const f = (classes || []).filter(c => c.fee).sort((a, b) => a.fee - b.fee)[0];
  return f ? feeText(f) : "";
}

/* Paid papers: does this access record still allow papers? */
export const accessActive = a => !!(a && a.untilMs && a.untilMs > Date.now());

export { icon };
