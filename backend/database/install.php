<?php
// Usage: php backend/database/install.php [username] [email] [password]
// Creates the database (if allowed), the tables, the starting content and the first admin user.
// Safe to run again: existing data is kept. Connection settings come from backend/config/config.php
// (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_SSL, DB_SSL_CA can be set as environment variables).
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit('CLI only');
}

$config = require __DIR__ . '/../config/config.php';
require __DIR__ . '/../core/database.php';
$c = $config['db'];

$options = pdo_options($c, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo = new PDO("mysql:host={$c['host']};port={$c['port']};charset={$c['charset']}", $c['user'], $c['pass'], $options);

try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$c['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (PDOException $e) {
    echo "Note: could not create the database ({$e->getMessage()}). Continuing - it must already exist.\n";
}
$pdo->exec("USE `{$c['name']}`");

// Run the schema one statement at a time (works on MySQL, MariaDB and TiDB).
$sql = file_get_contents(__DIR__ . '/schema.sql');
$count = 0;
foreach (preg_split('/;[ \t]*\r?\n/', $sql) as $statement) {
    $statement = trim($statement);
    $withoutComments = trim(preg_replace('/^--.*$/m', '', $statement));
    if ($withoutComments === '') {
        continue;
    }
    try {
        $pdo->exec($statement);
        $count++;
    } catch (PDOException $e) {
        fwrite(STDERR, "Failed statement:\n" . substr($statement, 0, 300) . "\n" . $e->getMessage() . "\n");
        exit(1);
    }
}
echo "Schema installed ($count statements).\n";

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
