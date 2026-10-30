# OG Creations

Landing page with an admin panel for OG Creations (film and creative production, Chennai).

- **Frontend:** React + Vite (`frontend/`) - the public website at `/` and the admin panel at `/admin` (`frontend/src/admin`)
- **Backend:** plain PHP, no framework (`backend/`) - a small JSON API under `/api`
- **Database:** MySQL (TiDB Cloud in production)

> A step-by-step guide in simple English (updating the site, free-plan limits, fixing problems) is in **DEPLOYMENT.md**.

## Folders

```
backend/    PHP API (api/, core/, config/, database/)
frontend/   React app (src/site = public site, src/admin = admin panel, public/images = starting images)
docker/     Apache + PHP settings for the container
Dockerfile, render.yaml   deployment on Render
```

## Run it on your computer

1. **Requirements:** PHP 8.1+ (with PDO MySQL), MySQL / MariaDB, Node.js 18+.
2. **Settings:** copy `backend/config/config.local.example.php` to `backend/config/config.local.php` and enter your MySQL user and password. That file is git-ignored, so your password is never committed.
3. **Create the database, tables, starting content and first admin user:**

   ```bash
   php backend/database/install.php
   ```

   It prints the admin username and a generated password. To choose your own:
   `php backend/database/install.php <username> <email> <password>`. Change the password after the first login. It is safe to run again; existing data is kept.
4. **Run the API** from the project root:

   ```bash
   php -S localhost:8000 -t backend backend/index.php
   ```
5. **Run the website** in a second terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173` for the site and `http://localhost:5173/admin` for the admin panel. The dev server forwards `/api` and `/media` to the PHP server.

## Deploy for free: Render + TiDB Cloud

Render runs one Docker container (Apache + PHP) that serves both the website and the API. TiDB Cloud Serverless provides the MySQL database. Both have free plans.

**1. Create the database (TiDB Cloud)**

1. Sign up at tidbcloud.com and create a free **Serverless** cluster.
2. Click **Connect** and note the **host**, **port** (4000), **user** and **password**. Create the password if asked.
3. From your own computer, create the tables and the first admin user in that database. Set the connection details only for this one command (they are not saved anywhere):

   PowerShell:
   ```powershell
   $env:DB_HOST="gateway01.xxx.prod.aws.tidbcloud.com"; $env:DB_PORT="4000"; $env:DB_USER="xxxx.root"; $env:DB_PASS="your-password"; $env:DB_SSL="1"
   php backend/database/install.php admin you@example.com "YourStrongPassword"
   ```
   macOS / Linux:
   ```bash
   DB_HOST=gateway01.xxx.prod.aws.tidbcloud.com DB_PORT=4000 DB_USER=xxxx.root DB_PASS='your-password' DB_SSL=1 \
     php backend/database/install.php admin you@example.com 'YourStrongPassword'
   ```

**2. Create the website (Render)**

1. Sign in at render.com and choose **New > Blueprint**, then pick this GitHub repository. Render reads `render.yaml` and creates a free web service.
2. When asked, enter the secret values: `DB_HOST`, `DB_USER`, `DB_PASS` (from TiDB Cloud) and `FRONTEND_URL` (the address Render gives the service, e.g. `https://og-creations.onrender.com`; you can add it after the first deploy and redeploy).
3. Wait for the build to finish, then open the address and sign in at `/admin`.

**Things to know about the free plans**

- Render's free web service sleeps after about 15 minutes without visitors; the first visit afterwards takes roughly half a minute.
- Images uploaded in the admin are stored **in the database** (the `media` table), so they survive restarts and redeploys. The images that ship with the project live in `frontend/public/images`.
- Free Render services cannot send email, so contact-form notifications and password-reset emails are not delivered. Enquiries are still saved and shown under **Enquiries** in the admin. A transactional email service (HTTP API) can be added later.

## Settings reference

Environment variables (override `config.local.php`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL` (1 for TiDB Cloud), `DB_SSL_CA`, `DB_TIMEZONE` (default `+05:30`), `APP_DEBUG` (0 in production), `FRONTEND_URL`, `MAIL_FROM`, `MAIL_FROM_NAME`.

## Notes

- **Email:** the app uses PHP `mail()`. In debug mode every message is also written to `backend/storage/mail.log`, which is how reset links can be read on a machine without a mail server.
- **Content:** every section of the landing page is edited from the admin panel.
