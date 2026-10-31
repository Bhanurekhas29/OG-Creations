<?php
// Section heading + the large photo (multipart).
require_auth();

$keys = ['why_eyebrow', 'why_heading', 'why_image', 'why_subtext'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$intro   = trim((string) ($in['why_subtext'] ?? ''));
$eyebrow = trim((string) ($in['why_eyebrow'] ?? ''));
$heading = trim((string) ($in['why_heading'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['why_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['why_heading'] = 'Enter a heading (max 120 characters).';
if (mb_strlen($intro) > 400) $errors['why_subtext'] = 'Max 400 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('why_eyebrow', $eyebrow);
set_setting('why_heading', $heading);
if ($path = save_image_upload('why_image', 'why')) {
    set_setting('why_image', $path);
}
set_setting('why_subtext', $intro);

json_response(['success' => true, 'data' => get_settings($keys)]);
