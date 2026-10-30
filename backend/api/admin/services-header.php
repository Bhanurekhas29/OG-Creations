<?php
require_auth();

$keys = ['services_eyebrow', 'services_heading'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$eyebrow = trim((string) ($in['services_eyebrow'] ?? ''));
$heading = trim((string) ($in['services_heading'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['services_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['services_heading'] = 'Enter a heading (max 120 characters).';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('services_eyebrow', $eyebrow);
set_setting('services_heading', $heading);

json_response(['success' => true, 'data' => get_settings($keys)]);
