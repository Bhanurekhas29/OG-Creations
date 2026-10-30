<?php
declare(strict_types=1);

$GLOBALS['config'] = require __DIR__ . '/../config/config.php';

function config(string $key, $default = null)
{
    $value = $GLOBALS['config'];
    foreach (explode('.', $key) as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config('db');
        $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset={$c['charset']}";
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Sends the JSON response to the visitor first, then runs $after (e.g. slow work like email). */
function json_response_then($data, int $status, callable $after): void
{
    ignore_user_abort(true);
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    header('Content-Length: ' . strlen($body));
    header('Connection: close');
    echo $body;
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        while (ob_get_level() > 0) {
            ob_end_flush();
        }
        flush();
    }
    $after();
    exit;
}

function fail(string $message, int $status = 400, array $errors = []): void
{
    json_response(['success' => false, 'message' => $message, 'errors' => $errors], $status);
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        fail('Method not allowed', 405);
    }
}

/** JSON body (or form fields for multipart requests). */
function input(): array
{
    static $data = null;
    if ($data === null) {
        $raw = file_get_contents('php://input');
        $json = $raw !== '' ? json_decode($raw, true) : null;
        $data = is_array($json) ? $json : $_POST;
    }
    return $data;
}

function send_cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = [rtrim(config('app.frontend_url'), '/')];
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ---- Auth ------------------------------------------------------------------

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($header === '' && function_exists('getallheaders')) {
        $header = getallheaders()['Authorization'] ?? '';
    }
    return preg_match('/^Bearer\s+(\S+)$/i', $header, $m) ? $m[1] : null;
}

function create_token(int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $hours = (int) config('app.token_ttl_hours');
    $stmt = db()->prepare(
        'INSERT INTO auth_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))'
    );
    $stmt->execute([$userId, hash('sha256', $token), $hours]);
    return $token;
}

function current_user(): ?array
{
    $token = bearer_token();
    if (!$token) {
        return null;
    }
    $stmt = db()->prepare(
        'SELECT u.id, u.name, u.username, u.email, u.role
           FROM auth_tokens t JOIN users u ON u.id = t.user_id
          WHERE t.token_hash = ? AND t.expires_at > NOW() AND u.is_active = 1'
    );
    $stmt->execute([hash('sha256', $token)]);
    return $stmt->fetch() ?: null;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        fail('Unauthorized', 401);
    }
    return $user;
}

// ---- Settings --------------------------------------------------------------

function get_settings(array $keys = []): array
{
    $rows = db()->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll();
    $all = array_column($rows, 'setting_value', 'setting_key');
    return $keys ? array_intersect_key($all, array_flip($keys)) : $all;
}

function set_setting(string $key, string $value): void
{
    db()->prepare(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
    )->execute([$key, $value]);
}

/** Links may be http(s) URLs, site paths (/about) or in-page anchors (#contact). */
function valid_link(string $url): bool
{
    return (bool) preg_match('~^(https?://[^\s]+|/[^\s]*|#[^\s]*)$~i', $url);
}

/** Public-facing settings (everything the landing page and admin chrome need). */
const PUBLIC_SETTING_KEYS = [
    'site_name', 'header_logo', 'footer_logo',
    'meta_title', 'meta_description', 'meta_keywords',
    'show_credits', 'credit_url', 'favicon',
];

// ---- Uploads ---------------------------------------------------------------

/**
 * Saves an uploaded image from $_FILES[$field] into frontend/public/images.
 * Returns the public path (e.g. /images/header-logo-123.png) or null if no file was sent.
 */
function save_image_upload(string $field, string $prefix, array $extraTypes = []): ?string
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK || $f['size'] > 2 * 1024 * 1024) {
        fail('Image upload failed (max 2 MB).', 422, [$field => 'Invalid file']);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $allowed = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/svg+xml' => 'svg'] + $extraTypes;
    if (!isset($allowed[$mime])) {
        fail($extraTypes ? 'Image must be PNG, ICO, JPG, WEBP or SVG.' : 'Image must be PNG, JPG, WEBP or SVG.', 422, [$field => 'Invalid type']);
    }
    if ($mime === 'image/svg+xml' && preg_match('/<script|on\w+\s*=/i', file_get_contents($f['tmp_name']))) {
        fail('SVG contains disallowed content.', 422, [$field => 'Unsafe SVG']);
    }
    $dir = config('app.images_dir');
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $name = $prefix . '-' . time() . '-' . bin2hex(random_bytes(3)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($f['tmp_name'], "$dir/$name")) {
        fail('Could not save the image.', 500);
    }
    return "/images/$name";
}

// ---- Mail ------------------------------------------------------------------

/**
 * Sends via PHP mail(). In debug mode every message is also appended to
 * backend/storage/mail.log so reset links can be read without an SMTP server.
 */
function send_mail(string $to, string $subject, string $body): bool
{
    if (config('app.debug')) {
        $entry = sprintf("[%s] To: %s\nSubject: %s\n%s\n%s\n", date('c'), $to, $subject, $body, str_repeat('-', 60));
        file_put_contents(__DIR__ . '/../storage/mail.log', $entry, FILE_APPEND);
    }
    $from = config('mail.from');
    $name = config('mail.from_name');
    $headers = "From: $name <$from>\r\nContent-Type: text/plain; charset=utf-8";
    return @mail($to, $subject, $body, $headers);
}

set_exception_handler(function (Throwable $e) {
    error_log($e->getMessage());
    fail(config('app.debug') ? $e->getMessage() : 'Server error', 500);
});
