<?php
// Contact section content (multipart because of the background image).
require_auth();

const CONTACT_KEYS = [
    'contact_eyebrow', 'contact_heading', 'contact_subheading', 'contact_phone', 'contact_email',
    'contact_address', 'contact_map_embed', 'contact_directions_url', 'contact_bg_image',
    'contact_notify_email', 'contact_success_message',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings(CONTACT_KEYS)]);
}

require_method('POST');

$in = input();
$t = fn(string $k) => trim((string) ($in[$k] ?? ''));

$v = [];
foreach (array_diff(CONTACT_KEYS, ['contact_bg_image']) as $k) {
    $v[$k] = $t($k);
}

$errors = [];
if ($v['contact_heading'] === '' || mb_strlen($v['contact_heading']) > 120) $errors['contact_heading'] = 'Enter a heading (max 120 characters).';
foreach (['contact_eyebrow' => 80, 'contact_subheading' => 120, 'contact_address' => 200, 'contact_success_message' => 300] as $k => $max) {
    if (mb_strlen($v[$k]) > $max) $errors[$k] = "Max $max characters.";
}
if ($v['contact_phone'] !== '' && !preg_match('/^\+?[0-9 \-]{6,20}$/', $v['contact_phone'])) {
    $errors['contact_phone'] = 'Use digits only (spaces, - and a leading + are allowed).';
}
if ($v['contact_email'] !== '' && !filter_var($v['contact_email'], FILTER_VALIDATE_EMAIL)) $errors['contact_email'] = 'Enter a valid email address.';
if ($v['contact_notify_email'] === '' || !filter_var($v['contact_notify_email'], FILTER_VALIDATE_EMAIL)) {
    $errors['contact_notify_email'] = 'Enter the email address that should receive new enquiries.';
}
// Only Google Maps embeds are accepted for the map iframe.
if ($v['contact_map_embed'] !== '' && !preg_match('~^https://(www\.)?google\.com/maps[^\s]*$~i', $v['contact_map_embed'])) {
    $errors['contact_map_embed'] = 'Paste a Google Maps embed link (it starts with https://www.google.com/maps).';
}
if ($v['contact_directions_url'] !== '' && !preg_match('~^https://[^\s]+$~i', $v['contact_directions_url'])) {
    $errors['contact_directions_url'] = 'Enter a full link starting with https://';
}
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

foreach ($v as $k => $val) set_setting($k, $val);
if ($path = save_image_upload('contact_bg_image', 'contact')) {
    set_setting('contact_bg_image', $path);
} elseif (filter_var($in['remove_bg_image'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
    set_setting('contact_bg_image', '');
}

json_response(['success' => true, 'data' => get_settings(CONTACT_KEYS)]);
