/* TND Guides – Firebase (Firestore + Auth) version of the database */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc,
  onSnapshot, query, where, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const fs = getFirestore(app);
const auth = getAuth(app);
getRedirectResult(auth).catch(e => console.warn(e));

/* ---------- Users ---------- */
function info(u) {
  if (!u || u.isAnonymous) return null;
  const email = (u.email || "").toLowerCase();
  return {
    uid: u.uid, email, verified: !!u.emailVerified,
    name: u.displayName || email.split("@")[0],
    isAdmin: false
  };
}
/* Is this user an admin? Firebase decides, using the email list in your
   Firestore Rules. Only admins may read teacherPrivate, so we just try. */
const adminCache = new Map();
async function withAdmin(u) {
  const i = info(u);
  if (!i || !i.verified) return i;
  if (!adminCache.has(i.uid)) {
    let ok = false;
    try { await getDoc(doc(fs, "teacherPrivate", "admin-check")); ok = true; } catch (e) { ok = false; }
    adminCache.set(i.uid, ok);
  }
  i.isAdmin = adminCache.get(i.uid);
  return i;
}
/* Where the "confirm email" and "reset password" links come back to */
const backToSite = () => ({ url: new URL("login.html", location.href).href });

export function onUser(cb) { return onAuthStateChanged(auth, async u => cb(await withAdmin(u))); }
export async function currentUser() { await auth.authStateReady(); return withAdmin(auth.currentUser); }
export async function refreshUser() {
  await auth.authStateReady();
  if (auth.currentUser) { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); adminCache.delete(auth.currentUser.uid); }
  return withAdmin(auth.currentUser);
}

export async function signUp(name, email, password) {
  const r = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(r.user, { displayName: name });
  await sendEmailVerification(r.user, backToSite());
  return info(r.user);
}
export async function signIn(email, password) {
  const r = await signInWithEmailAndPassword(auth, email, password);
  return info(r.user);
}
export const adminLogin = signIn;
export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try { return info((await signInWithPopup(auth, provider)).user); }
  catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider); return null;
    }
    throw e;
  }
}
export async function resendVerify() { if (auth.currentUser) await sendEmailVerification(auth.currentUser, backToSite()); }
export function resetPassword(email) { return sendPasswordResetEmail(auth, email, backToSite()); }
/* Invisible guest account so people can use the forum without logging in */
export async function guest() {
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser.uid;
}
export function logout() { return signOut(auth); }

/* ---------- Data ---------- */
const colRef = path => collection(fs, ...path.split("/"));
const docRef = (path, id) => doc(fs, ...path.split("/"), id);

export function watch(path, cb, filter, onError) {
  const q = filter ? query(colRef(path), where(filter[0], "==", filter[1])) : colRef(path);
  return onSnapshot(q,
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { console.error(path, err); if (onError) onError(err); });
}
export async function add(path, data) { return (await addDoc(colRef(path), data)).id; }
export function set(path, id, data) { return setDoc(docRef(path, id), data); }
export function update(path, id, data) { return updateDoc(docRef(path, id), data); }
export function remove(path, id) { return deleteDoc(docRef(path, id)); }
export async function addMany(path, list) {
  const batch = writeBatch(fs);
  list.forEach(item => batch.set(doc(colRef(path)), item));
  await batch.commit();
}
