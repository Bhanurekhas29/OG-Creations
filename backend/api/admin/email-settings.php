<?php
// Email Settings: how the website sends email (contact notifications, password resets).
// Secrets (SMTP password, Brevo key) are write-only: they are never sent back to the browser.
require_auth();

const PUBLIC_MAIL_KEYS = ['mail_method', 'mail_from_name', 'mail_from_email', 'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user'];

function email_settings_payload(): array
{
    $m = mail_settings();
    $out = array_intersect_key($m, array_flip(PUBLIC_MAIL_KEYS));
    $out['smtp_pass_set'] = $m['smtp_pass'] !== '';
    $out['brevo_key_set'] = $m['brevo_key'] !== '';
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => email_settings_payload()]);
}

require_method('POST');

$in = input();
$t  = fn(string $k) => trim((string) ($in[$k] ?? ''));
$current = mail_settings();

$method = $t('mail_method');
$errors = [];
if (!in_array($method, ['php', 'smtp', 'brevo'], true)) $errors['mail_method'] = 'Choose how emails are sent.';

$fromName  = mail_clean($t('mail_from_name'));
$fromEmail = mail_clean($t('mail_from_email'));
if (mb_strlen($fromName) > 80) $errors['mail_from_name'] = 'Max 80 characters.';
if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) $errors['mail_from_email'] = 'Enter a valid email address.';

$host   = mail_clean($t('smtp_host'));
$port   = (int) $t('smtp_port');
$secure = $t('smtp_secure');
$user   = mail_clean($t('smtp_user'));
$pass   = (string) ($in['smtp_pass'] ?? '');            // not trimmed: passwords may contain spaces
$key    = trim((string) ($in['brevo_key'] ?? ''));

// An empty secret box means "keep the one already saved".
$newPass = $pass !== '' ? $pass : $current['smtp_pass'];
$newKey  = $key  !== '' ? $key  : $current['brevo_key'];

if ($method === 'smtp') {
    if ($host === '' || mb_strlen($host) > 190) $errors['smtp_host'] = 'Enter the SMTP host, e.g. smtp.gmail.com';
    if ($port < 1 || $port > 65535) $errors['smtp_port'] = 'Enter a port between 1 and 65535 (usually 587).';
    if (!in_array($secure, ['tls', 'ssl', 'none'], true)) $errors['smtp_secure'] = 'Choose the security type.';
    if (mb_strlen($user) > 190) $errors['smtp_user'] = 'Max 190 characters.';
}
if ($method === 'brevo' && $newKey === '') $errors['brevo_key'] = 'Paste your Brevo API key.';

if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('mail_method', $method);
set_setting('mail_from_name', $fromName);
set_setting('mail_from_email', $fromEmail);
set_setting('smtp_host', $host);
set_setting('smtp_port', (string) ($port ?: 587));
set_setting('smtp_secure', in_array($secure, ['tls', 'ssl', 'none'], true) ? $secure : 'tls');
set_setting('smtp_user', $user);
set_setting('smtp_pass', $newPass);
set_setting('brevo_key', $newKey);

json_response(['success' => true, 'data' => email_settings_payload()]);
