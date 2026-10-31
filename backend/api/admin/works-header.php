<?php
require_auth();

$keys = ['works_eyebrow', 'works_heading', 'works_categories', 'works_intro'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in      = input();
$intro   = trim((string) ($in['works_intro'] ?? ''));
$eyebrow = trim((string) ($in['works_eyebrow'] ?? ''));
$heading = trim((string) ($in['works_heading'] ?? ''));
$cats    = array_values(array_unique(array_filter(array_map('trim', preg_split('/\R/', (string) ($in['works_categories'] ?? ''))))));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['works_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['works_heading'] = 'Enter a heading (max 120 characters).';
if (count($cats) > 10) $errors['works_categories'] = 'Use at most 10 categories.';
foreach ($cats as $c) {
    if (mb_strlen($c) > 40) { $errors['works_categories'] = 'Each category must be 40 characters or fewer.'; break; }
}
if (mb_strlen($intro) > 400) $errors['works_intro'] = 'Max 400 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('works_eyebrow', $eyebrow);
set_setting('works_heading', $heading);
set_setting('works_categories', implode("\n", $cats));
set_setting('works_intro', $intro);

json_response(['success' => true, 'data' => get_settings($keys)]);
