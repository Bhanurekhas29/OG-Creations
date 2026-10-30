<?php
require_auth();

$keys = ['process_eyebrow', 'process_heading'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$eyebrow = trim((string) ($in['process_eyebrow'] ?? ''));
$heading = trim((string) ($in['process_heading'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['process_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['process_heading'] = 'Enter a heading (max 120 characters).';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('process_eyebrow', $eyebrow);
set_setting('process_heading', $heading);

json_response(['success' => true, 'data' => get_settings($keys)]);
