<?php
// Usage: php backend/database/install.php [username] [email] [password]
// Creates the database, tables and the first admin user.
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit('CLI only');
}

$config = require __DIR__ . '/../config/config.php';
$c = $config['db'];

$pdo = new PDO("mysql:host={$c['host']};port={$c['port']};charset={$c['charset']}", $c['user'], $c['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$pdo->exec("CREATE DATABASE IF NOT EXISTS `{$c['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE `{$c['name']}`");
$pdo->exec(file_get_contents(__DIR__ . '/schema.sql'));
echo "Schema installed.\n";

$username = $argv[1] ?? 'admin';
$email    = $argv[2] ?? 'admin@ogcreations.com';
$password = $argv[3] ?? null;

$exists = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ? OR email = ?');
$exists->execute([$username, $email]);
if ((int) $exists->fetchColumn() > 0) {
    echo "Admin user already exists - nothing to seed.\n";
    exit;
}

$generated = $password === null;
$password  = $password ?? bin2hex(random_bytes(6));
$pdo->prepare('INSERT INTO users (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    ->execute(['Administrator', $username, $email, password_hash($password, PASSWORD_DEFAULT), 'admin']);

echo "Admin created.\n  username: $username\n  email:    $email\n";
echo $generated ? "  password: $password   (generated - change it after first login)\n" : "  password: (as provided)\n";
