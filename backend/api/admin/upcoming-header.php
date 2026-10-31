<?php
require_auth();

$keys = ['upcoming_heading', 'upcoming_subtitle', 'upcoming_image_alt'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in       = input();
$heading  = trim((string) ($in['upcoming_heading'] ?? ''));
$subtitle = trim((string) ($in['upcoming_subtitle'] ?? ''));
$alt      = trim((string) ($in['upcoming_image_alt'] ?? ''));

$errors = [];
if ($heading === '' || mb_strlen($heading) > 80) $errors['upcoming_heading'] = 'Enter a heading (max 80 characters).';
if (mb_strlen($subtitle) > 160) $errors['upcoming_subtitle'] = 'Max 160 characters.';
if (mb_strlen($alt) > 160) $errors['upcoming_image_alt'] = 'Max 160 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('upcoming_heading', $heading);
set_setting('upcoming_subtitle', $subtitle);
set_setting('upcoming_image_alt', $alt);

json_response(['success' => true, 'data' => get_settings($keys)]);
