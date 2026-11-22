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

export const LIVE = !!firebaseConfig.apiKey;
const DB = LIVE ? await import("./db-firebase.js") : await import("./db-local.js");
export default DB;
