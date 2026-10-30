<?php
require_method('POST');

$in = input();
$token    = (string) ($in['token'] ?? '');
$password = (string) ($in['password'] ?? '');

if (strlen($password) < 8) {
    fail('Password must be at least 8 characters.', 422);
}

$stmt = db()->prepare(
    'SELECT id, user_id FROM password_resets
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()'
);
$stmt->execute([hash('sha256', $token)]);
$reset = $stmt->fetch();

if (!$reset) {
    fail('This reset link is invalid or has expired.', 400);
}

$pdo = db();
$pdo->beginTransaction();
$pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($password, PASSWORD_DEFAULT), $reset['user_id']]);
$pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')->execute([$reset['id']]);
$pdo->prepare('DELETE FROM auth_tokens WHERE user_id = ?')->execute([$reset['user_id']]); // sign out everywhere
$pdo->commit();

json_response(['success' => true, 'message' => 'Password updated. You can now sign in.']);
