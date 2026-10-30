<?php
declare(strict_types=1);

// Front controller. Dev:  php -S localhost:8000 -t backend backend/index.php
// Apache/XAMPP: .htaccess rewrites /api/* here.
require __DIR__ . '/core/bootstrap.php';
send_cors_headers();

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (!preg_match('#/api/([a-z0-9\-/]+)/?$#', $path, $m)) {
    fail('Not found', 404);
}

$file = __DIR__ . '/api/' . $m[1] . '.php';
if (!is_file($file)) {
    fail('Not found', 404);
}
require $file;
