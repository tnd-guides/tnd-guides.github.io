/* TND Guides – DEMO database (saved in this browser only).
   Used automatically while js/config.js has no Firebase keys.
   Admin login in demo mode: any email + password "demo". */
import { DEFAULT_GRADES } from "./common.js";

const KEY = "guruhub_demo_v5";
const listeners = [];
let userCb = [];

function newId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

function exampleStore() {
  const ago = (d, h) => { const x = new Date(Date.now() - d * 86400000); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const grades = DEFAULT_GRADES.map(g => ({ id: newId(), ...JSON.parse(JSON.stringify(g)) }));
  const g = name => grades.find(x => x.name === name).id;
  const t1 = newId(), t2 = newId(), t3 = newId();
  const teachers = [
    { id: t1, name: "Mrs. Dilrukshi Perera", about: "B.Sc. (Colombo), SLTS Grade 1", years: 12, mediums: ["Sinhala", "English"],
      bio: "Teaches O/L and A/L maths step by step, with lots of past paper practice.", photo: "",
      subjects: [g("O/Level") + "|Maths", g("Grade 10") + "|Maths", g("Grade 9") + "|Maths", g("A/L Maths") + "|Combined Maths"],
      free: ["Mon-eve", "Wed-eve", "Sat-am"], rating: 4, reviews: 1, lessons: 1,
      district: "Kandy", areas: "Kandy town hall, Peradeniya",
      classes: [{ type: "hall", fee: 1500, per: "month" }, { type: "group", fee: 2500, per: "month" }, { type: "online", fee: 2000, per: "month" }] },
    { id: t2, name: "Mr. Kasun Jayawardena", about: "B.Sc. Eng. (Moratuwa)", years: 6, mediums: ["Sinhala"],
      bio: "Makes physics simple with real-life examples.", photo: "",
      subjects: [g("A/L Maths") + "|Physics", g("A/L Science") + "|Physics", g("O/Level") + "|Science"],
      free: ["Tue-eve", "Thu-eve", "Sat-pm"], rating: 0, reviews: 0, lessons: 0,
      district: "Colombo", areas: "Maharagama, Nugegoda",
      classes: [{ type: "group", fee: 3000, per: "month" }, { type: "individual", fee: 1500, per: "hour" }] },
    { id: t3, name: "Ms. Fathima Rizna", about: "B.A. English (Kelaniya)", years: 8, mediums: ["English", "Tamil"],
      bio: "Friendly English teacher for grammar, essays and speaking.", photo: "",
      subjects: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "O/Level"].map(n => g(n) + "|English"),
      free: ["Mon-pm", "Fri-pm", "Sat-am"], rating: 0, reviews: 0, lessons: 0,
      district: "Gampaha", areas: "Negombo",
      classes: [{ type: "online", fee: 800, per: "class" }] }
  ];
  const teacherPrivate = [
    { id: t1, phone: "077 123 4412" }, { id: t2, phone: "071 555 0889" }, { id: t3, phone: "075 900 1230" }
  ];
  const demoLink = "https://drive.google.com/";
  const paper = (grade, subject, kind, year, medium) => ({
    id: newId(), gradeId: g(grade), gradeName: grade, subject, kind, year, medium,
    title: `${year} ${grade} ${subject}`, free: false, made: ago(30, 9) });
  const papers = [
    paper("O/Level", "Maths", "past", 2024, "Sinhala"), paper("O/Level", "Maths", "scheme", 2024, "Sinhala"),
    paper("O/Level", "Maths", "past", 2023, "Sinhala"), paper("O/Level", "Maths", "scheme", 2023, "Sinhala"),
    paper("O/Level", "Maths", "past", 2023, "English"), paper("O/Level", "Maths", "model", 2025, "Sinhala"),
    paper("O/Level", "Maths", "notes", 2025, "Sinhala"),
    paper("A/L Maths", "Combined Maths", "past", 2024, "Sinhala"), paper("A/L Maths", "Combined Maths", "scheme", 2024, "Sinhala"),
    paper("A/L Maths", "Physics", "past", 2024, "Sinhala"), paper("Grade 8", "English", "school", 2025, "English")
  ];
  papers[0].free = true; papers[0].url = demoLink;            // one free example
  const paperLinks = papers.filter(p => !p.free).map(p => ({ id: p.id, url: demoLink }));
  const settings = [{ id: "payment", price: "Rs. 500", period: "for 1 month",
    howToPay: "Bank: Example Bank, Kandy branch\nAccount name: TND Guides\nAccount no: 0000 0000 00\n(Demo details only)" }];
  const p1 = newId(), p2 = newId();
  return {
    grades, teachers, teacherPrivate, papers, paperLinks, settings, access: [], payments: [], teacherApps: [],
    requests: [
      { id: newId(), uid: "demo-ashan", student: "Ashan", gradeId: g("A/L Maths"), gradeName: "A/L Maths", subject: "Combined Maths",
        need: "I don't understand integration by parts.", place: "Online class", district: "", free: ["Mon-eve", "Sat-am"],
        made: new Date(Date.now() - 40 * 60000).toISOString(), status: "new", teacherId: "", teacherName: "", when: "",
        preferTeacherId: "", preferTeacherName: "" }
    ],
    sessions: [
      { id: newId(), requestId: "old", uid: "demo-nimali", teacherId: t1, teacherName: teachers[0].name, student: "Nimali",
        subject: "Maths", gradeName: "O/Level", when: ago(9, 18), status: "done", stars: 4, comment: "Good, but a bit fast." }
    ],
    posts: [
      { id: p1, uid: "demo", name: "Nimali", gradeId: g("O/Level"), gradeName: "O/Level", section: "O/Level", subject: "Maths",
        title: "How do I find the 8th term of 3, 6, 12, 24 …?", text: "Is there a quick way?", made: ago(1, 9), answerCount: 1 },
      { id: p2, uid: "demo", name: "Hiruni", gradeId: g("Grade 8"), gradeName: "Grade 8", section: "Secondary", subject: "English",
        title: "When do I use 'since' and when do I use 'for'?", text: "", made: ago(3, 16), answerCount: 0 }
    ],
    ["posts/" + p1 + "/answers"]: [
      { id: newId(), uid: "demo", name: "Dinuka", text: "Each number is 2 times the last. Term = 3 × 2^(n − 1), so the 8th term is 384.", made: ago(1, 11), admin: false }
    ]
  };
}

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.grades) return s; } catch (e) { /* ignore */ }
  const s = exampleStore(); save(s); return s;
}
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }

function emit() {
  const s = load();
  listeners.forEach(l => {
    const list = (s[l.path] || []).filter(d => !l.filter || d[l.filter[0]] === l.filter[1]);
    l.cb(JSON.parse(JSON.stringify(list)));
  });
}
window.addEventListener("storage", e => { if (e.key === KEY) emit(); });

/* ---------- Users ---------- */
/* Demo accounts live in this browser. Demo admin: any email + password "demo".
   Confirm emails are not really sent; the login page shows a "confirm now" button instead. */
const UKEY = "guruhub_demo_users", SKEY = "guruhub_demo_session";
const authErr = code => { const e = new Error(code); e.code = code; return e; };
function users() { try { return JSON.parse(localStorage.getItem(UKEY)) || {}; } catch (e) { return {}; } }
function saveUsers(u) { try { localStorage.setItem(UKEY, JSON.stringify(u)); } catch (e) { /* ignore */ } }
function session() { try { return localStorage.getItem(SKEY) || ""; } catch (e) { return ""; } }
function setSession(email) { try { email ? localStorage.setItem(SKEY, email) : localStorage.removeItem(SKEY); } catch (e) { /* ignore */ } }
function me() {
  const email = session(); if (!email) return null;
  const u = users()[email]; if (!u) return null;
  return { uid: u.uid, email, name: u.name, verified: u.verified, isAdmin: !!u.admin };
}
function tell() { const u = me(); userCb.forEach(cb => cb(u)); }
window.addEventListener("storage", e => { if (e.key === SKEY || e.key === UKEY) tell(); });

export function onUser(cb) { userCb.push(cb); setTimeout(() => cb(me()), 0); return () => { userCb = userCb.filter(x => x !== cb); }; }
export async function currentUser() { return me(); }
export async function refreshUser() { return me(); }
export async function signUp(name, email, password) {
  email = email.toLowerCase(); const all = users();
  if (all[email]) throw authErr("auth/email-already-in-use");
  if (password.length < 6) throw authErr("auth/weak-password");
  all[email] = { uid: "u-" + newId(), name, pw: password, verified: false };
  saveUsers(all); setSession(email); tell(); return me();
}
export async function signIn(email, password) {
  email = email.toLowerCase(); const all = users();
  if (!all[email] && password === "demo") { all[email] = { uid: "admin-" + newId(), name: "Admin", pw: "demo", verified: true, admin: true }; saveUsers(all); }
  if (!all[email] || all[email].pw !== password) throw authErr("auth/invalid-credential");
  setSession(email); tell(); return me();
}
export const adminLogin = signIn;
export async function googleSignIn() {
  const email = "demo.student@gmail.com", all = users();
  if (!all[email]) { all[email] = { uid: "g-" + newId(), name: "Demo Student", pw: newId(), verified: true }; saveUsers(all); }
  setSession(email); tell(); return me();
}
export async function resendVerify() { /* demo: nothing is sent */ }
export async function resetPassword(email) { if (!users()[email.toLowerCase()]) return; }
export async function demoVerify() { const all = users(), e = session(); if (all[e]) { all[e].verified = true; saveUsers(all); tell(); } }
export async function guest() {
  const u = me(); if (u) return u.uid;
  let id; try { id = localStorage.getItem("guruhub_demo_guest"); if (!id) { id = "guest-" + newId(); localStorage.setItem("guruhub_demo_guest", id); } } catch (e) { id = "guest-temp"; }
  return id;
}
export async function logout() { setSession(""); tell(); }

/* ---------- Data ---------- */
export function watch(path, cb, filter) {
  const l = { path, cb, filter };
  listeners.push(l);
  setTimeout(emit, 0);
  return () => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); };
}
export async function add(path, data) {
  const s = load(), id = newId();
  (s[path] = s[path] || []).push({ id, ...data });
  save(s); emit(); return id;
}
export async function set(path, id, data) {
  const s = load(); s[path] = (s[path] || []).filter(x => x.id !== id);
  s[path].push({ id, ...data });
  save(s); emit();
}
export async function update(path, id, data) {
  const s = load(), d = (s[path] || []).find(x => x.id === id);
  if (d) Object.assign(d, data);
  save(s); emit();
}
export async function remove(path, id) {
  const s = load(); s[path] = (s[path] || []).filter(x => x.id !== id);
  save(s); emit();
}
export async function addMany(path, list) {
  const s = load(); s[path] = s[path] || [];
  list.forEach(d => s[path].push({ id: newId(), ...d }));
  save(s); emit();
}
export function resetDemo() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } emit(); }
