<?php
// Settings, lowest to highest priority:
//   1. built-in local-development defaults (below)
//   2. config.local.php (git-ignored; copy config.local.example.php) for your own computer
//   3. environment variables, when set (this is how Render and TiDB Cloud are configured)

$config = [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'og_creations',
        'user'    => 'root',
        'pass'    => '',
        'charset' => 'utf8mb4',
        'ssl'     => false,   // TiDB Cloud requires an encrypted connection (DB_SSL=1)
        'ssl_ca'  => '',      // e.g. /etc/ssl/certs/ca-certificates.crt (verifies the server certificate)
        'timezone' => '+05:30', // session time zone, so every connection stores/reads the same local time
    ],
    'app' => [
        'debug'             => true,   // set APP_DEBUG=0 in production
        'frontend_url'      => 'http://localhost:5173',
        'token_ttl_hours'   => 12,
        'reset_ttl_minutes' => 30,
    ],
    'mail' => [
        'from'      => 'no-reply@ogcreations.com',
        'from_name' => 'OG Creations',
    ],
];

$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $config = array_replace_recursive($config, require $local);
}

// [section, key, environment variable, type]
$overrides = [
    ['db', 'host', 'DB_HOST', 'string'],
    ['db', 'port', 'DB_PORT', 'int'],
    ['db', 'name', 'DB_NAME', 'string'],
    ['db', 'user', 'DB_USER', 'string'],
    ['db', 'pass', 'DB_PASS', 'string'],
    ['db', 'ssl', 'DB_SSL', 'bool'],
    ['db', 'ssl_ca', 'DB_SSL_CA', 'string'],
    ['db', 'timezone', 'DB_TIMEZONE', 'string'],
    ['app', 'debug', 'APP_DEBUG', 'bool'],
    ['app', 'frontend_url', 'FRONTEND_URL', 'string'],
    ['mail', 'from', 'MAIL_FROM', 'string'],
    ['mail', 'from_name', 'MAIL_FROM_NAME', 'string'],
];
foreach ($overrides as [$section, $key, $name, $type]) {
    $v = getenv($name);
    if ($v === false || $v === '') {
        continue;
    }
    $config[$section][$key] = match ($type) {
        'int'   => (int) $v,
        'bool'  => filter_var($v, FILTER_VALIDATE_BOOLEAN),
        default => $v,
    };
}

return $config;
