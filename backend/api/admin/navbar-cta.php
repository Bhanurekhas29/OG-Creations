<?php
require_auth();

$keys = ['nav_cta_enabled', 'nav_cta_label', 'nav_cta_url'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in    = input();
$label = trim((string) ($in['nav_cta_label'] ?? ''));
$url   = trim((string) ($in['nav_cta_url'] ?? ''));

$errors = [];
if ($label === '' || mb_strlen($label) > 40) $errors['nav_cta_label'] = 'Enter button text (max 40 characters).';
if (!valid_link($url) || strlen($url) > 255) $errors['nav_cta_url'] = 'Use a full link (https://…), a path (/contact) or an anchor (#contact).';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('nav_cta_enabled', filter_var($in['nav_cta_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN) ? '1' : '0');
set_setting('nav_cta_label', $label);
set_setting('nav_cta_url', $url);

json_response(['success' => true, 'data' => get_settings($keys)]);
