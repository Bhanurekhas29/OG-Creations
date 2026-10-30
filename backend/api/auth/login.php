<?php
require_method('POST');

$in = input();
$identifier = trim((string) ($in['identifier'] ?? ''));
$password   = (string) ($in['password'] ?? '');

if ($identifier === '' || $password === '') {
    fail('Enter your username/email and password.', 422);
}

$stmt = db()->prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1');
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    usleep(400000); // slow down brute force
    fail('Invalid credentials.', 401);
}

// Drop expired tokens while we're here.
db()->exec('DELETE FROM auth_tokens WHERE expires_at < NOW()');

json_response([
    'success' => true,
    'token'   => create_token((int) $user['id']),
    'user'    => [
        'id'       => (int) $user['id'],
        'name'     => $user['name'],
        'username' => $user['username'],
        'email'    => $user['email'],
        'role'     => $user['role'],
    ],
]);
