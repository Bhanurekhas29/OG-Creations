<?php
require_auth();

$keys = ['services_eyebrow', 'services_heading', 'services_intro'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$intro   = trim((string) ($in['services_intro'] ?? ''));
$eyebrow = trim((string) ($in['services_eyebrow'] ?? ''));
$heading = trim((string) ($in['services_heading'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['services_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['services_heading'] = 'Enter a heading (max 120 characters).';
if (mb_strlen($intro) > 400) $errors['services_intro'] = 'Max 400 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('services_eyebrow', $eyebrow);
set_setting('services_heading', $heading);
set_setting('services_intro', $intro);

json_response(['success' => true, 'data' => get_settings($keys)]);
