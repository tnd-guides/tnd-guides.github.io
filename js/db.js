/* TND Guides – database
   Uses Firebase when js/config.js has keys, otherwise the demo store.
   Both files have the same functions:
     onUser(cb)                 cb({uid, email, name, verified, isAdmin}) or cb(null)
     currentUser() / refreshUser()
     signUp(name, email, pass)  new account + confirm email
     signIn(email, pass)        log in (adminLogin is the same)
     googleSignIn()             log in with Google
     resendVerify() / resetPassword(email)
     guest()                    invisible guest login for the forum
     logout()
     set(path, id, data)
     watch(path, cb, filter?)   live list; filter = [field, value]
     add(path, data)            returns new id
     update(path, id, data)
     remove(path, id)
     addMany(path, list)
*/
import { firebaseConfig } from "./config.js";

/* Add ?demo=1 to any page address to try the site with example data (saved only in this browser tab). */
let demo = false;
try {
  if (new URLSearchParams(location.search).has("demo")) sessionStorage.setItem("tnd_demo", "1");
  demo = sessionStorage.getItem("tnd_demo") === "1";
} catch (e) { /* ignore */ }
export const LIVE = !!firebaseConfig.apiKey && !demo;
const DB = LIVE ? await import("./db-firebase.js?v=7") : await import("./db-local.js?v=7");
export default DB;
