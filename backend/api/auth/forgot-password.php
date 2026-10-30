<?php
require_method('POST');

$email = strtolower(trim((string) (input()['email'] ?? '')));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Enter a valid email address.', 422);
}

$stmt = db()->prepare('SELECT id, name FROM users WHERE email = ? AND is_active = 1');
$stmt->execute([$email]);

if ($user = $stmt->fetch()) {
    $token = bin2hex(random_bytes(32));
    $minutes = (int) config('app.reset_ttl_minutes');

    db()->prepare('DELETE FROM password_resets WHERE user_id = ?')->execute([$user['id']]);
    db()->prepare(
        'INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))'
    )->execute([$user['id'], hash('sha256', $token), $minutes]);

    $link = rtrim(config('app.frontend_url'), '/') . '/admin/reset-password?token=' . $token;
    $site = get_settings(['site_name'])['site_name'] ?? 'OG Creations';
    send_mail(
        $email,
        "Reset your $site admin password",
        "Hi {$user['name']},\n\nUse the link below to set a new password. It expires in $minutes minutes.\n\n$link\n\nIf you didn't request this, ignore this email."
    );
}

// Same response whether or not the account exists (no user enumeration).
json_response(['success' => true, 'message' => 'If that email is registered, a reset link has been sent.']);
