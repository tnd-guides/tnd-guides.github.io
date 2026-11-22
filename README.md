<p align="center"><img src="img/logo-full.svg" alt="TND Guides" width="440"></p>

# TND Guides

A tutoring and past-paper website for Sri Lankan students, built for mobile first. Students tap their **grade card**, then a **subject card**. On each subject they find past papers, marking schemes, model papers, school papers and notes, and they can ask for a teacher. The admin gets an instant alert, chooses a teacher, and the lesson time is booked automatically. Students and teachers never contact each other directly.

**Live site:** <https://tnd-guides.github.io/tnd-guides/>

## Guides

| Guide | What it covers |
|---|---|
| [**SETUP.md**](SETUP.md) | Publish for free, step by step: GitHub Pages + Firebase, first use, changing the site later |
| [**ADMINS.md**](ADMINS.md) | Add or remove an admin, step by step (admins are set privately in Firebase, never on GitHub) |

## Pages

| Page | Who | What it does |
|---|---|---|
| `index.html` | Students | Grade cards → subject cards → papers + "Get a teacher". "My lessons" shows bookings and lets the student give stars. |
| `teachers.html` | Students | Teacher profiles: photo, qualifications, years, mediums, subjects, star rating. Tap a subject to ask for that teacher. |
| `forum.html` | Students | Ask the class and answer questions |
| `login.html` | Everyone | Log in with Google or email, create account, confirm email, forgot password |
| `admin.html` | Admin | Request alerts, choose teacher + auto-booking, lessons, **papers and marking schemes**, **teacher details**, **add/remove/move grade and subject cards**, forum moderation |

## Files

| File | What is inside |
|---|---|
| `js/config.js` | **Your Firebase keys go here** (not secret). No emails: admins are set in Firebase Rules |
| `js/common.js` | Starting Sri Lankan grades and subjects, paper types, scheduling, helpers |
| `js/icons.js` | Line icons used on the cards (no emoji) |
| `js/i18n.js` | Sinhala and Tamil translations and the language switch |
| `js/db.js` | Picks Firebase (live) or demo mode |
| `js/db-firebase.js` / `js/db-local.js` | Firebase version / demo version of the database |
| `js/app.js`, `js/teachers.js`, `js/forum.js`, `js/login.js`, `js/admin.js` | Code for each page |
| `css/style.css` | All the styles (mobile first) |
| `firestore.rules` | Database security rules. Paste into Firebase and put your admin Gmail **there**, not here |

## Test on your computer

```
py -m http.server 8000
```

Then open <http://localhost:8000>. Without Firebase keys the site runs in demo mode: the admin password is `demo`, and the login page shows a "Demo: confirm now" button because no real emails are sent.
