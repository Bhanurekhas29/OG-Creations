# OG Creations - Deployment Manual

A simple guide for putting the website online, keeping it running, and fixing common problems.
No passwords are written in this file. Keep your passwords somewhere safe.

---

## 1. What you have

| Part | Where it lives | Cost |
|---|---|---|
| The website and admin panel | Render (a Docker web service named `og-creations`) | Free plan |
| The database | TiDB Cloud (a Starter cluster named `og-creations`, Singapore) | Free plan |
| The code | GitHub: `github.com/Bhanurekhas29/OG-Creations` (public) | Free |

- **Live website:** https://og-creations.onrender.com
- **Admin panel:** https://og-creations.onrender.com/admin/login (username: `admin`)
- **How it fits together:** visitors open the Render address. Render runs one container that shows the website and answers `/api` requests. The container reads and writes the TiDB database. Photos you upload in the admin are saved inside the database, so they are not lost when Render restarts.

---

## 2. Everyday tasks (no technical skills needed)

### Change text, photos, menus and sections
1. Open the admin panel and log in.
2. Choose a section in the left menu (for example **Hero Section**), change what you want, and press **Save changes**.
3. A green message confirms it. Refresh the website to see the change.

### Upload a photo
Use the upload box on the section's page. Photos are kept in the database and stay after restarts. Use JPG, PNG, WEBP or SVG, 2 MB or smaller. Smaller photos make the website faster.

### Read messages from the contact form
Open **Enquiries** in the admin. New messages are bold. Email notifications need **Email Settings** to be set up first (see section 8), so check this page regularly.

### Change the admin password
1. Admin panel, then **Users**.
2. Edit your user, type a new password (12 or more characters), and save.
3. You will be logged out. Log in again with the new password.

### Add another person who can use the admin
Admin panel, **Users**, **Add user**. Every user has full access, so only add people you trust.

---

## 3. Updating the website code

You only need this when a developer changes the code. Admin changes (section 2) never need it.

1. Make the change on your computer (or ask your developer).
2. Save it to GitHub:
   ```bash
   git add -A
   git commit -m "Describe what you changed"
   git push origin main
   ```
3. Render notices the push and rebuilds by itself (this is called auto deploy). It takes about 3 to 6 minutes.
4. Watch it: Render dashboard, then **og-creations**, then **Events** or **Logs**. Wait for the line **"Your service is live"**.
5. Open the website and check it.

**Every push redeploys the live site.** Even a change to a text file starts a rebuild.

**If a new version breaks the site:** Render dashboard, **og-creations**, **Events**. Find the last version that worked and use **Rollback** (or **Manual Deploy**, then **Deploy a specific commit**).

---

## 4. First-time setup from zero (if you ever need to repeat it)

Do the steps in order. Use **free plans only**.

### Step A - Put the code on GitHub
The code is already in the repository above. A new copy of it only needs `git push`.

### Step B - Create the database (TiDB Cloud)
1. Sign in at https://tidbcloud.com.
2. Click **Create Resource** and choose the plan **Starter**.
   - **Careful:** the page may have **Essential** selected by default. Essential costs from $400 a month. Click **Starter** (free) before anything else.
3. Name it `og-creations`, choose region **Singapore (ap-southeast-1)**, keep **Monthly Spending Limit = $0**, and click **Create**. The page should say "No credit card required".
4. When the cluster is **Active**, open **SQL Editor**.
5. Open the file `backend/database/schema.sql` from the project. In the SQL Editor, first type these two lines:
   ```sql
   CREATE DATABASE IF NOT EXISTS og_creations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE og_creations;
   ```
   then paste the whole contents of `schema.sql` under them. Run everything with **Shift + Ctrl + Enter**.
   (This creates the tables and the starting content, including the photos that come with the project.)
6. Create the first admin user. On your computer run this to make a password hash (replace `YourStrongPassword`):
   ```bash
   php -r "echo password_hash('YourStrongPassword', PASSWORD_DEFAULT);"
   ```
   Then run this in the SQL Editor (paste the hash between the quotes):
   ```sql
   INSERT INTO users (name, username, email, password_hash, role)
   VALUES ('Administrator', 'admin', 'admin@ogcreations.com', 'PASTE_THE_HASH_HERE', 'admin');
   ```
   Only the hash goes into the database, never the password itself.
7. Get the connection details: on the cluster's **Overview** page click **Connect**. Note the **host**, **port (4000)** and **username**. Click **Generate Password**, copy it, and keep it private. You will paste it into Render in the next step.

### Step C - Create the website (Render)
1. Sign in at https://dashboard.render.com.
2. Click **New**, then **Blueprint**. Choose the GitHub repository **OG-Creations** and press **Connect**.
3. Type a Blueprint name (for example `og-creations`).
4. Fill in the four boxes Render shows:

   | Box | What to enter |
   |---|---|
   | `DB_HOST` | the TiDB host (looks like `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`) |
   | `DB_USER` | the TiDB username (ends with `.root`) |
   | `DB_PASS` | the TiDB password you generated |
   | `FRONTEND_URL` | the website address, for example `https://og-creations.onrender.com` |

5. Check the plan says **Free**, then press **Deploy Blueprint**.
6. Wait for **"Your service is live"** in the logs (a few minutes). Open the address and log in to `/admin`.

---

## 5. All settings (environment variables)

These live in Render: **og-creations**, then **Environment**. Changing one makes Render redeploy.

| Name | Meaning | Value used now |
|---|---|---|
| `DB_HOST` | Database address | from TiDB Connect |
| `DB_PORT` | Database port | `4000` |
| `DB_NAME` | Database name | `og_creations` |
| `DB_USER` | Database user | from TiDB Connect |
| `DB_PASS` | Database password | secret - only in Render and TiDB |
| `DB_SSL` | Use an encrypted connection (TiDB needs it) | `1` |
| `DB_SSL_CA` | Certificate file used to check the database | `/etc/ssl/certs/ca-certificates.crt` |
| `APP_DEBUG` | `0` hides technical error details from visitors | `0` |
| `FRONTEND_URL` | The website address | `https://og-creations.onrender.com` |

Never put the database password in the code or in GitHub.

---

## 6. Running the website on your computer

Use this to try changes before they go live.

**One time**
1. Install PHP 8.1+, MySQL (for example XAMPP), and Node.js 18+.
2. Copy `backend/config/config.local.example.php` to `backend/config/config.local.php` and enter your own MySQL user and password. This file is never uploaded to GitHub.
3. Create the local database: `php backend/database/install.php`. It prints an admin username and a password. Keep it.

**Start** (use two terminals, in the project folder)
```bash
php -d upload_max_filesize=32M -d post_max_size=40M -S localhost:8000 -t backend backend/index.php
```
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 (website) and http://localhost:5173/admin (admin).

**Stop:** click each terminal and press **Ctrl + C**.

The local database is separate from the live one. Changes you make in your local admin do **not** appear on the live website.

---

## 7. Keeping the free plans working

**Render free plan**
- The website **goes to sleep** after about 15 minutes with no visitors. The first visit afterwards can take 50 seconds or more. This is normal on the free plan.
- Free running time is about **750 hours a month, shared by all your free Render services**. If you run many free services, this one can be paused until next month. Check: Render dashboard, then **Billing** or the service page.
- A paid plan removes sleeping. It is optional.

**TiDB free plan**
- Each organisation can have up to 5 free Starter clusters. Storage and usage are limited but far more than this website needs.
- Keep the spending limit at **$0** so nothing is ever charged.

**To take the website offline on purpose:** Render, **og-creations**, **Settings**, **Suspend Service**. (This turns the live website off until you resume it.)

---

## 8. Things that do not work yet

- **Emails.** Open **Email Settings** (Authentication & Authorization menu) and enter your SMTP details. For Gmail use the **Fill in Gmail settings** button, your Gmail address as username, and a Google App Password. Then press **Send test email**. Every contact-form message is also saved in **Enquiries**. If you forget the admin password, reset it with the steps in section 9.
- **Video files.** Videos are played from YouTube or Vimeo links. Do not upload video files.

---

- **Video uploads.** In the admin (Our Works) each project can use a video link (YouTube, Vimeo or .mp4 link) or an uploaded MP4/WebM file up to 30 MB. Uploaded files are kept on the server's disk, and Render's free disk is wiped on every restart, so the upload box is switched off on Render (`VIDEO_UPLOADS=0` in `render.yaml`). On a normal server with a permanent disk, set `VIDEO_UPLOADS=1` and `MAX_VIDEO_MB` (default 30) and make `backend/storage/videos` writable.

## 9. Problems and fixes

| Problem | What to do |
|---|---|
| The website is very slow on the first visit | Render woke up from sleep. Wait up to a minute and refresh. |
| The page shows an error or is blank | Render, **og-creations**, **Logs**. Read the last red lines. Most often a setting is wrong or the database cannot be reached. |
| "Server error" in the admin | Check the database is **Active** in TiDB Cloud. Check `DB_HOST`, `DB_USER`, `DB_PASS` in Render. |
| The database password was changed or leaked | TiDB: **Connect**, **Reset Password**. Then Render, **Environment**, update `DB_PASS`, **Save**. Render redeploys. |
| An image is missing | Open the section in the admin and upload it again. |
| The build fails after a code change | Read the red error in Render **Logs**, fix it, push again. Or roll back (section 3). |
| I forgot the admin password | See below. |

**Reset the admin password without email**
1. On your computer: `php -r "echo password_hash('NewStrongPassword', PASSWORD_DEFAULT);"`
2. TiDB Cloud, **og-creations**, **SQL Editor**. Run (paste your hash between the quotes):
   ```sql
   USE og_creations;
   UPDATE users SET password_hash = 'PASTE_THE_HASH_HERE' WHERE username = 'admin';
   DELETE FROM auth_tokens;
   ```
3. Log in with the new password.

---

## 10. Safety checklist

- [ ] Change the first admin password to a long one (12+ characters) the first time you log in.
- [ ] Never share the TiDB password or the admin password in chat, email or GitHub.
- [ ] Never upload `backend/config/config.local.php` (it is already blocked by `.gitignore`).
- [ ] Keep `APP_DEBUG` at `0` on Render.
- [ ] Remove users you no longer need (admin, **Users**).
- [ ] The GitHub repository is **public**. The photos and code in it can be seen by anyone. Make it private in GitHub, **Settings**, if you prefer. Render can still build from a private repository once it is connected.

---

## 11. Quick reference

| What | Where |
|---|---|
| Live website | https://og-creations.onrender.com |
| Admin panel | https://og-creations.onrender.com/admin/login |
| Render dashboard | https://dashboard.render.com (service `og-creations`) |
| TiDB Cloud | https://tidbcloud.com (cluster `og-creations`) |
| Code | https://github.com/Bhanurekhas29/OG-Creations |
| Deployment files in the code | `Dockerfile`, `render.yaml`, `docker/` |
| Database setup file | `backend/database/schema.sql` |

**Optional: use your own domain** (for example `www.ogcreations.com`): Render, **og-creations**, **Settings**, **Custom Domains**, **Add**, and follow the steps it shows at your domain company. Then change `FRONTEND_URL` in Render to the new address.
