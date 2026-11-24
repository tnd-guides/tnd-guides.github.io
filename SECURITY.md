# Security

How the site keeps students, teachers and the admin safe, and the few settings **you** need to turn on.

## What the site already does

| Protection | Where |
|---|---|
| **Admins are set only in the Firebase Rules** (private). No admin email is in any public file. | `firestore.rules` → `isAdmin()` |
| **Every save is checked by Firebase on its server**, so changing the website code can't get around it. | `firestore.rules` |
| **Each record may only contain its exact expected fields**, so nobody can add hidden data, set their own status, approve themselves, or pretend to be the admin. | `exactly([...])` in the rules |
| **Emails can't be faked**: payments and teacher requests must use the email of the logged-in account. | `myEmail()` in the rules |
| **Paid paper links stay hidden** until the admin approves the student's payment, and they lock again when the time ends. | `paperLinks`, `access`, `hasAccess()` |
| **Phone numbers and emails are blocked in public text** (forum, requests, reviews, teacher bios). | `noContact()` in the rules + the pages |
| **Teacher phone numbers are visible to admins only.** | `teacherPrivate`, `teacherApps` |
| **Admins must have a confirmed email**, and a student account can't open the admin page. | `verified()`, admin page |
| **Admin page logs itself out after 60 minutes** without use, in case a phone is shared or lost. | `js/admin.js` |
| **Content-Security-Policy** on every page: the browser only runs code from this site, Google/Firebase and Google Tag Manager. | `<meta http-equiv="Content-Security-Policy">` |
| **Only `https://` links** are ever used for papers and photos, so `javascript:` tricks are blocked. | `safeUrl()` in `js/common.js` |
| **All text from users is escaped** before it is shown (no HTML or script injection). | `safe()` in `js/common.js` |
| **Stronger passwords**: new accounts need 8+ characters with letters and numbers. | `js/login.js` |
| **Forum spam brake**: 30 seconds between posts from one device. Text size limits are in the rules. | `js/forum.js`, rules |
| **Old links and pages carry no personal data**, and the admin page is hidden from search engines. | `robots noindex`, `404.html` |

## Turn these on yourself (5 minutes, free)

1. **Paste the latest rules.** Every time `firestore.rules` changes:
   1. Copy it.
   2. Go to **Firestore Database → Rules**, paste, and put your admin Gmail(s) in `isAdmin()`.
   3. Click **Publish**.
2. **Password policy.** Go to **Authentication → Settings → Password policy**:
   - Turn on **Require enforcement**.
   - Minimum length **8**.
   - Tick **lowercase**, **uppercase** (optional) and **numeric**.
3. **Email enumeration protection.** Go to **Authentication → Settings → User actions** and make sure **Email enumeration protection** is on. This stops people checking which emails have accounts.
4. **Restrict the web API key** (stops others using your key on their own sites):
   1. Go to <https://console.cloud.google.com>, choose your Firebase project, then **APIs & Services → Credentials**, and open the **Browser key (auto created by Firebase)**.
   2. Under **Application restrictions**, choose **Websites** and add:
      - `https://YOUR-SITE-ADDRESS/*` (for example `https://tnd-guides.github.io/*`)
      - `https://YOUR-PROJECT-ID.firebaseapp.com/*`
      - `http://localhost/*` (only if you test on your computer)
   3. Click **Save**. Wait 5 minutes, then check that login and the grade cards still work.
5. **Protect every admin Gmail** with **2-Step Verification** (Google Account → Security), and never share its password.
6. **Keep the admin list short.** Remove people who no longer help (see [ADMINS.md](ADMINS.md)).

## Good to know

- The Firebase web keys in `js/config.js` are **not secret**. Every Firebase website shows them, and the rules protect your data.
- **Payments are checked by a person.** GitHub Pages can't take card payments, so always confirm the money arrived before pressing **Unlock**.
- **Google Drive links:** a student who opened a paid paper could share its Drive link. For important papers, open the file's **Share** settings in Drive and turn off **download, print and copy** for viewers.
- **Google Tag Manager** can add scripts to every page. Only add tags you trust. If a new tag needs another website, add that site to the `Content-Security-Policy` line in each `.html` file.
- **Found a problem?** Tell the site admin privately. Don't post it in the forum.
