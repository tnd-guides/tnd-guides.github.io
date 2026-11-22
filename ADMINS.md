# Add or remove an admin, step by step

Admins are set in **one place only**: the **Firestore Rules** in Firebase. That place is private, so admin emails never appear on GitHub or on the website.

In these steps, **newadmin@gmail.com** means the new admin's Gmail.

---

## Add an admin

### Step 1: Add their Gmail in Firebase
1. Open <https://console.firebase.google.com> and click your project (the one you made for this site).
2. In the left menu, click **Firestore Database**.
3. Click the **Rules** tab at the top.
4. Near the top, find the line with the admin list. With one admin, it looks like this:
   ```
   && request.auth.token.email.lower() in ['you@gmail.com'];
   ```
5. Click just **before** the `]` and type a **comma**, a space, and the new Gmail in **'single quotes'**:
   ```
   && request.auth.token.email.lower() in ['you@gmail.com', 'newadmin@gmail.com'];
   ```
   - Use **small letters** only.
   - Each email goes in **'single quotes'**.
   - Put a **comma** between emails.
6. Click **Publish**.

### Step 2: The new admin logs in
1. They open `https://YOUR-NAME.github.io/tnd-guides/admin.html`.
2. They tap **Continue with Google** and choose **their** Gmail.
3. The admin page opens. ✅

If they were already logged in before you added them, they should tap **Log out** and log in again.

That's it. You don't need to change anything on GitHub.

---

## Remove an admin
1. Go to **Firestore Database → Rules** (same as above).
2. Delete their email **and the comma before it**, so the list looks right again:
   ```
   && request.auth.token.email.lower() in ['you@gmail.com'];
   ```
3. Click **Publish**.

They lose admin access straight away. If their admin page is still open, they can't save or see private data any more.

---

## Is this safe? Can anyone become admin?

**No.** Only the Gmails in the Firebase rules are admins.

- **Google checks the Gmail.** To log in as `you@gmail.com`, a person needs that Gmail's password.
- **Email accounts must be confirmed.** Even if someone types your Gmail on "Create account", the confirm link goes to **your** inbox.
- **Firebase checks every action on its server.** Someone who changes the website code still can't read teachers' phone numbers, change grades or papers, or see student requests.

Tips:
- Turn on **2-Step Verification** for every admin Gmail (Google Account → Security).
- Never share Gmail passwords.
- Keep the admin list short.

---

## Problems

| What the new admin sees | Fix |
|---|---|
| "…is not an admin account" | Check the spelling in the Rules list, use small letters, click **Publish**. Then log out and log in again. |
| "Confirm your email first" | They made an email + password account. They should open the confirm link in their inbox, or use **Continue with Google**. |
| Rules show a red error when publishing | A quote or comma is missing. The list must look like `['a@gmail.com', 'b@gmail.com']` |
