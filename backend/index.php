<?php
declare(strict_types=1);

// Front controller. Dev:  php -S localhost:8000 -t backend backend/index.php
// Apache/XAMPP: .htaccess rewrites /api/* and /media/* here.
require __DIR__ . '/core/bootstrap.php';
send_cors_headers();

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// Images uploaded in the admin are stored in the database and served from /media/<name>.
if (preg_match('#^/media/([A-Za-z0-9._-]{1,120})$#', $path, $media)) {
    $mediaName = $media[1];
    require __DIR__ . '/api/public/media.php';
    exit;
}

if (!preg_match('#/api/([a-z0-9\-/]+)/?$#', $path, $m)) {
    fail('Not found', 404);
}

$file = __DIR__ . '/api/' . $m[1] . '.php';
if (!is_file($file)) {
    fail('Not found', 404);
}
require $file;
