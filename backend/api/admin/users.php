<?php
// Users added here sign in to the admin panel exactly like the main admin.
$me = require_auth();
$method = $_SERVER['REQUEST_METHOD'];

function user_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, name, username, email, role, is_active, created_at FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row) {
        $row['id'] = (int) $row['id'];
        $row['is_active'] = (int) $row['is_active'];
    }
    return $row ?: null;
}

/** Validates name/username/email; returns [clean values, errors]. */
function validate_user(array $in, ?int $ignoreId): array
{
    $v = [
        'name'     => trim((string) ($in['name'] ?? '')),
        'username' => trim((string) ($in['username'] ?? '')),
        'email'    => strtolower(trim((string) ($in['email'] ?? ''))),
    ];
    $e = [];
    if ($v['name'] === '' || mb_strlen($v['name']) > 120) $e['name'] = 'Enter a name (max 120 characters).';
    if (!preg_match('/^[A-Za-z0-9._-]{3,60}$/', $v['username'])) $e['username'] = '3-60 characters: letters, numbers, . _ -';
    if (!filter_var($v['email'], FILTER_VALIDATE_EMAIL)) $e['email'] = 'Enter a valid email address.';

    foreach (['username', 'email'] as $f) {
        if (isset($e[$f])) continue;
        $stmt = db()->prepare("SELECT COUNT(*) FROM users WHERE $f = ? AND id <> ?");
        $stmt->execute([$v[$f], $ignoreId ?? 0]);
        if ((int) $stmt->fetchColumn() > 0) $e[$f] = ucfirst($f) . ' is already taken.';
    }
    return [$v, $e];
}

if ($method === 'GET') {
    $rows = db()->query(
        'SELECT id, name, username, email, role, is_active, created_at FROM users ORDER BY id'
    )->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['is_active'] = (int) $r['is_active'];
    }
    json_response(['success' => true, 'data' => $rows, 'me' => $me['id']]);
}

$in = input();

if ($method === 'POST') {
    [$v, $errors] = validate_user($in, null);
    $password = (string) ($in['password'] ?? '');
    if (strlen($password) < 8) $errors['password'] = 'Password must be at least 8 characters.';
    if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

    db()->prepare('INSERT INTO users (name, username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$v['name'], $v['username'], $v['email'], password_hash($password, PASSWORD_DEFAULT), 'admin', empty($in['is_active']) ? 0 : 1]);
    json_response(['success' => true, 'data' => user_row((int) db()->lastInsertId())], 201);
}

$id = (int) ($_GET['id'] ?? $in['id'] ?? 0);
$target = $id ? user_row($id) : null;
if (!$target) fail('User not found.', 404);

if ($method === 'PUT') {
    [$v, $errors] = validate_user($in, $id);
    $password = (string) ($in['password'] ?? '');
    if ($password !== '' && strlen($password) < 8) $errors['password'] = 'Password must be at least 8 characters.';
    $active = empty($in['is_active']) ? 0 : 1;
    if ($id === $me['id'] && !$active) $errors['is_active'] = 'You cannot deactivate your own account.';
    if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

    db()->prepare('UPDATE users SET name = ?, username = ?, email = ?, is_active = ? WHERE id = ?')
        ->execute([$v['name'], $v['username'], $v['email'], $active, $id]);
    if ($password !== '') {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
    }
    // Password change or deactivation signs that user out everywhere.
    if ($password !== '' || !$active) {
        db()->prepare('DELETE FROM auth_tokens WHERE user_id = ?' . ($id === $me['id'] ? ' AND token_hash <> ?' : ''))
            ->execute($id === $me['id'] ? [$id, hash('sha256', bearer_token())] : [$id]);
    }
    json_response(['success' => true, 'data' => user_row($id)]);
}

if ($method === 'DELETE') {
    if ($id === $me['id']) fail('You cannot delete your own account.', 422);
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

fail('Method not allowed', 405);
