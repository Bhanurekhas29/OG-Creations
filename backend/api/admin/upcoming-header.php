<?php
require_auth();

$keys = ['upcoming_heading', 'upcoming_subtitle'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in       = input();
$heading  = trim((string) ($in['upcoming_heading'] ?? ''));
$subtitle = trim((string) ($in['upcoming_subtitle'] ?? ''));

$errors = [];
if ($heading === '' || mb_strlen($heading) > 80) $errors['upcoming_heading'] = 'Enter a heading (max 80 characters).';
if (mb_strlen($subtitle) > 160) $errors['upcoming_subtitle'] = 'Max 160 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('upcoming_heading', $heading);
set_setting('upcoming_subtitle', $subtitle);

json_response(['success' => true, 'data' => get_settings($keys)]);
