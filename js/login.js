/* TND Guides – login, create account, confirm email, forgot password */
import DB, { LIVE } from "./db.js?v=7";
import { langSwitch, startTranslation } from "./i18n.js";
import { $, safe, icon, initials, demoBanner, authMessage, safeNext } from "./common.js";

demoBanner(LIVE);
langSwitch();
startTranslation();

const next = safeNext(new URLSearchParams(location.search).get("next"));
let mode = "login";      // or "signup"
let user = null;

function show(v) {
  ["start", "forgot", "verify", "account"].forEach(x => { $("v-" + x).hidden = x !== v; });
  $("v-loading").hidden = true;
}
const say = (id, text, kind = "bad") => { $(id).innerHTML = text ? `<p class="msg ${kind}">${text}</p>` : ""; };
function busy(btn, on, label) { btn.disabled = on; if (label) btn.textContent = label; }

/* Pick the right screen for the current user */
function decide(u) {
  user = u;
  if (!u) return show("start");
  if (!u.verified) {
    $("verify-email").textContent = u.email;
    $("demo-verify").hidden = LIVE;
    return show("verify");
  }
  if (next) { location.replace(next); return; }
  if (u.isAdmin && sessionStorage.getItem("tnd_just_logged_in")) { sessionStorage.removeItem("tnd_just_logged_in"); location.replace("admin.html"); return; }
  $("acc-avatar").textContent = initials(u.name);
  $("acc-name").textContent = u.name;
  $("acc-email").textContent = u.email;
  $("continue").href = u.isAdmin ? "admin.html" : "index.html";
  $("continue").textContent = u.isAdmin ? "Open admin" : "Continue";
  show("account");
}
DB.onUser(decide);

/* ---------- Log in / Create account tabs ---------- */
function setMode(m) {
  mode = m;
  const signup = m === "signup";
  $("tab-login").classList.toggle("on", !signup); $("tab-signup").classList.toggle("on", signup);
  $("tab-login").setAttribute("aria-selected", !signup); $("tab-signup").setAttribute("aria-selected", signup);
  $("row-name").hidden = !signup; $("row-pw2").hidden = !signup; $("pw-hint").hidden = !signup;
  $("to-forgot").hidden = signup;
  $("password").autocomplete = signup ? "new-password" : "current-password";
  $("go").textContent = signup ? "Create account" : "Log in";
  say("start-msg", "");
}
$("tab-login").addEventListener("click", () => setMode("login"));
$("tab-signup").addEventListener("click", () => setMode("signup"));
$("pw-eye").addEventListener("click", () => {
  const p = $("password"), showIt = p.type === "password";
  p.type = showIt ? "text" : "password"; $("password2").type = p.type;
  $("pw-eye").textContent = showIt ? "Hide" : "Show";
});

$("google").addEventListener("click", async () => {
  say("start-msg", ""); busy($("google"), true);
  try { sessionStorage.setItem("tnd_just_logged_in", "1"); await DB.googleSignIn(); }
  catch (e) { say("start-msg", authMessage(e)); }
  busy($("google"), false);
});

async function go() {
  const email = $("email").value.trim(), pw = $("password").value;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return say("start-msg", "Please type your email address.");
  if (!pw) return say("start-msg", "Please type your password.");
  const btn = $("go"), label = btn.textContent;
  if (mode === "signup") {
    const name = $("su-name").value.trim();
    if (!name) return say("start-msg", "Please type your name.");
    if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return say("start-msg", "Use at least 8 characters, with letters and numbers.");
    if (pw !== $("password2").value) return say("start-msg", "The two passwords are not the same.");
    busy(btn, true, "Creating…");
    try { await DB.signUp(name, email, pw); } catch (e) { say("start-msg", authMessage(e)); }
  } else {
    busy(btn, true, "Logging in…");
    try { sessionStorage.setItem("tnd_just_logged_in", "1"); await DB.signIn(email, pw); } catch (e) { say("start-msg", authMessage(e)); }
  }
  busy(btn, false, label);
}
$("go").addEventListener("click", go);
["email", "password", "password2"].forEach(id => $(id).addEventListener("keydown", e => { if (e.key === "Enter") go(); }));

/* ---------- Forgot password ---------- */
$("to-forgot").addEventListener("click", () => { $("f-email").value = $("email").value; say("forgot-msg", ""); show("forgot"); });
$("forgot-back").innerHTML = icon("back", 18) + "Back to log in";
$("forgot-back").addEventListener("click", () => show("start"));
$("send-reset").addEventListener("click", async () => {
  const email = $("f-email").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return say("forgot-msg", "Please type your email address.");
  busy($("send-reset"), true, "Sending…");
  try {
    await DB.resetPassword(email);
    say("forgot-msg", `If <b>${safe(email)}</b> has an account, a reset link is on its way. Check your email (and the Spam folder).`, "good");
  } catch (e) { say("forgot-msg", authMessage(e)); }
  busy($("send-reset"), false, "Send reset link");
});

/* ---------- Confirm email ---------- */
$("verify-icon").innerHTML = icon("send", 28);
$("verified").addEventListener("click", async () => {
  const u = await DB.refreshUser();
  if (u && u.verified) decide(u);
  else say("verify-msg", "Not confirmed yet. Open the link in the email first.");
});
$("resend").addEventListener("click", async () => {
  try { await DB.resendVerify(); say("verify-msg", "Sent again. Check your email.", "good"); }
  catch (e) { say("verify-msg", authMessage(e)); }
});
$("demo-verify").addEventListener("click", async () => { if (DB.demoVerify) await DB.demoVerify(); });
$("verify-logout").addEventListener("click", () => DB.logout());
$("logout").addEventListener("click", async () => { await DB.logout(); location.replace("login.html"); });

if (new URLSearchParams(location.search).get("mode") === "signup") setMode("signup");
