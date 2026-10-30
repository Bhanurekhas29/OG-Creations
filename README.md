# OG Creations

Landing page with an admin panel for OG Creations (film and creative production, Chennai).

- **Frontend:** React + Vite (`frontend/`) - the public website at `/` and the admin panel at `/admin` (`frontend/src/admin`)
- **Backend:** plain PHP, no framework (`backend/`) - a small JSON API under `/api`
- **Database:** MySQL

## Folders

```
backend/    PHP API (api/, core/, config/, database/, storage/)
frontend/   React app (src/site = public site, src/admin = admin panel, public/images = images)
```

## Setup

1. **Requirements:** PHP 8.1+ (with PDO MySQL), MySQL / MariaDB, Node.js 18+.
2. **Backend settings:** copy `backend/config/config.example.php` to `backend/config/config.php` and enter your MySQL user and password. This file is ignored by git, so your password is never committed.
3. **Create the database, tables and first admin user:**

   ```bash
   php backend/database/install.php
   ```

   It prints the admin username and a generated password. You can also choose your own:
   `php backend/database/install.php <username> <email> <password>`. Change the password after the first login.
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

   Open `http://localhost:5173` for the site and `http://localhost:5173/admin` for the admin panel. The dev server forwards `/api` to the PHP server.

## Production build

```bash
cd frontend
npm run build
```

Serve `frontend/dist` as the website and expose `backend/` so that `/api/*` reaches `backend/index.php` (an Apache `.htaccess` is included). Set `debug` to `false` in `config.php`.

## Notes

- **Email:** the app uses PHP `mail()`. In debug mode every message is also written to `backend/storage/mail.log`, which is how reset links can be read on a machine without a mail server. A real SMTP setup is needed for delivery in production.
- **Content:** every section of the landing page is edited from the admin panel. Uploaded images are saved to `frontend/public/images`.
