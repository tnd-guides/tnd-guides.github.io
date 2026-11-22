# Publish TND Guides for free, step by step

You need two free accounts:

| Service | What it does | Cost |
|---|---|---|
| **GitHub** (github.com) | Stores the website files and puts the website online (GitHub Pages) | Free |
| **Firebase** (console.firebase.google.com) | The database, plus login with Google or email | Free (Spark plan, no card) |

It takes about **30 minutes** the first time. In these steps:
- **YOUR-NAME** means your GitHub username.
- **you@gmail.com** means the Gmail you will use as admin.

> **Keep personal things private:** never type your phone number, home address, passwords or personal email into any file on GitHub, because everything there is public. The admin email goes **only** into Firebase (Part 2, step 5), which is private.

---

## Part 1: Put the website on GitHub

### 1. Make a GitHub account
1. Go to <https://github.com> and click **Sign up**.
2. Choose a username. It becomes part of your website address: `https://YOUR-NAME.github.io/tnd-guides/`.
3. Confirm your email.

**Privacy tip:** go to **Settings → Emails** and tick **Keep my email addresses private**. Your email then won't show on your files or changes.

### 2. Make a repository (a folder for the website)
1. Click the **+** at the top right → **New repository**.
2. **Repository name:** `tnd-guides`
3. Choose **Public**. Free websites need a public repository.
4. Leave the other boxes unticked and click **Create repository**.

### 3. Upload the website files
1. On the new repository page, click **uploading an existing file**.
2. Open the `tnd-guides` folder on your computer. Select **everything inside it**: `index.html`, `teachers.html`, `forum.html`, `login.html`, `admin.html`, `firestore.rules`, the `css` and `js` folders, and the `.md` files.
3. Drag them all into the GitHub page.
4. At the bottom, click **Commit changes**.

> Upload the files **inside** the folder, not the folder itself. `index.html` must be at the top level of the repository.

### 4. Turn on the website (GitHub Pages)
1. In the repository, click **Settings** (top menu).
2. In the left menu, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose **main** and **/ (root)**, then click **Save**.
5. Wait 1–2 minutes and refresh the page. At the top it says
   **"Your site is live at https://YOUR-NAME.github.io/tnd-guides/"**.

The website now works in **demo mode**: each phone keeps its own data. Part 2 makes it real.

---

## Part 2: Connect Firebase (database and login)

### 1. Make the Firebase project
1. Go to <https://console.firebase.google.com> and sign in with your Gmail.
2. Click **Create a project**, name it `tnd-guides`, and click **Continue**.
3. Turn **Google Analytics off** and click **Create project**, then **Continue**.

### 2. Create the database
1. In the left menu: **Build → Firestore Database → Create database**.
2. If asked for an edition, choose **Standard**.
3. **Location:** choose **asia-south1 (Mumbai)**, the closest to Sri Lanka. It can't be changed later.
4. Choose **Start in production mode**, then click **Create**.

### 3. Turn on login
1. In the left menu: **Build → Authentication → Get started → Sign-in method**.
2. Turn on **Email/Password**: switch on the first option only, then **Save**.
3. Click **Add new provider → Google**, switch on **Enable**, choose your support email, then **Save**.
4. Click **Add new provider → Anonymous**, switch on **Enable**, then **Save**. This lets people use the forum without logging in.

### 4. Allow your website address
1. Still in Authentication, click **Settings → Authorized domains → Add domain**.
2. Type `YOUR-NAME.github.io` and click **Add**.

### 5. Paste the security rules and set the admin (private)
1. Go to **Firestore Database → Rules**.
2. On GitHub, open the file `firestore.rules` in your repository and click **Copy raw file** (the two-squares icon).
3. In Firebase, delete everything in the Rules box and **paste**.
4. Near the top, find:
   ```
   && request.auth.token.email.lower() in ['admin@example.com'];
   ```
   Change `admin@example.com` to **your admin Gmail**, in small letters:
   ```
   && request.auth.token.email.lower() in ['you@gmail.com'];
   ```
5. Click **Publish**.

> This is the **only** place your admin email is written. It's inside Firebase, so it isn't public. Don't put it in any GitHub file.

### 6. Copy your Firebase keys
1. Click the **gear icon → Project settings**.
2. Scroll down to **Your apps** and click the **`</>`** (Web) button.
3. Nickname: `tnd-guides`. Leave "Firebase Hosting" **unticked** and click **Register app**.
4. Copy the part that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

> These keys are **not secret**. Every Firebase website shows them. Your data is protected by the rules from step 5.

### 7. Put the keys on GitHub
1. In your GitHub repository, open `js/config.js` and click the **pencil icon** (Edit).
2. Replace the `firebaseConfig = { … };` part with yours. You can leave out `measurementId`.
3. Click **Commit changes**, then **Commit changes** again.
4. Wait about 1 minute. The yellow "Demo mode" bar disappears from the website.

---

## Part 3: First use

1. Open `https://YOUR-NAME.github.io/tnd-guides/admin.html`.
2. Tap **Continue with Google** and choose **your admin Gmail**.
3. Go to **Grades & subjects** and tap **Add Sri Lankan grades**. All the grade and subject cards appear.
4. **Teachers** tab: add your teachers. Their phone numbers are only visible to admins.
5. **Papers** tab: add papers:
   1. Upload the PDF to Google Drive.
   2. Click **Share** → **General access: Anyone with the link** → **Copy link**.
   3. Paste the link into **PDF link** and press **Add paper**.
6. Tap **Turn on pop-up alerts** so new student requests make a sound.
7. Share `https://YOUR-NAME.github.io/tnd-guides/` with students.

To add more admins, see [ADMINS.md](ADMINS.md).

---

## Changing the website later

- **Small change:** open the file on GitHub → pencil icon → edit → **Commit changes**. The site updates in about 1 minute.
- **Many files:** **Add file → Upload files**, drag in the new versions, then **Commit changes**. Files with the same name are replaced.

## If something goes wrong

| Message | Fix |
|---|---|
| "This website address is not allowed yet" | Part 2, step 4: add `YOUR-NAME.github.io` to Authorized domains |
| "This way of logging in is turned off" | Part 2, step 3: turn on Email/Password, Google and Anonymous |
| "…is not an admin account" | Log in with the Gmail that's in the Firebase Rules, or fix a typo there and **Publish** |
| "Could not save…" / "Could not load data…" | Check that the rules from Part 2, step 5 were pasted and **published** |
| Site still shows the old version | Wait 1–2 minutes, then refresh. On a phone, close and reopen the tab. |

## Free plan limits

- Firebase Spark: 50,000 reads and 20,000 writes per day. Google and email login are free.
- GitHub Pages: free for public repositories.

## How student accounts work

- **No login needed:** browsing grades, papers and teachers, and asking or answering in the forum.
- **Login needed:** asking for a teacher, and **My lessons**. Students can use Google, or email and password with an email confirm link.
- **Forgot password?** on the login page sends a reset link.
- The Firebase rules check all of this on the server, so it can't be skipped.

## Languages

Student pages have an **EN / සිං / த** switch. Translations are in [`js/i18n.js`](js/i18n.js): find the English line and change the Sinhala or Tamil text. The admin page is in English.

## Google Tag Manager

Every page loads the Google tag for container `GTM-K823GGZ5`. If you use your own container, replace that ID in the 5 `.html` files. Many users are children, so track simple page views only.

## Your own address (optional)

Buy a domain (for example `guruhub.lk`), add it in GitHub **Settings → Pages → Custom domain**, and add it to Firebase **Authorized domains**.
