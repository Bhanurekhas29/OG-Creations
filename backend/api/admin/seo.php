<?php
require_auth();

$keys = ['meta_title', 'meta_description', 'meta_keywords'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in = input();
$title = trim((string) ($in['meta_title'] ?? ''));
$desc  = trim((string) ($in['meta_description'] ?? ''));
$kw    = trim((string) ($in['meta_keywords'] ?? ''));

$errors = [];
if (mb_strlen($title) > 120)  $errors['meta_title'] = 'Keep the title under 120 characters.';
if (mb_strlen($desc) > 320)   $errors['meta_description'] = 'Keep the description under 320 characters.';
if (mb_strlen($kw) > 500)     $errors['meta_keywords'] = 'Keep keywords under 500 characters.';
if ($errors) {
    fail('Please fix the highlighted fields.', 422, $errors);
}

set_setting('meta_title', $title);
set_setting('meta_description', $desc);
set_setting('meta_keywords', $kw);

json_response(['success' => true, 'data' => get_settings($keys)]);
