<?php
require_auth();

$keys = ['process_eyebrow', 'process_heading', 'process_intro'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$intro   = trim((string) ($in['process_intro'] ?? ''));
$eyebrow = trim((string) ($in['process_eyebrow'] ?? ''));
$heading = trim((string) ($in['process_heading'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['process_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['process_heading'] = 'Enter a heading (max 120 characters).';
if (mb_strlen($intro) > 400) $errors['process_intro'] = 'Max 400 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('process_eyebrow', $eyebrow);
set_setting('process_heading', $heading);
set_setting('process_intro', $intro);

json_response(['success' => true, 'data' => get_settings($keys)]);
