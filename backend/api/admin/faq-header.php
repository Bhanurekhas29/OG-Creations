<?php
// FAQ section heading texts.
require_auth();

$keys = ['faq_eyebrow', 'faq_heading', 'faq_intro'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys) + ['faq_eyebrow' => '', 'faq_heading' => '', 'faq_intro' => '']]);
}

require_method('POST');

$in      = input();
$eyebrow = trim((string) ($in['faq_eyebrow'] ?? ''));
$heading = trim((string) ($in['faq_heading'] ?? ''));
$intro   = trim((string) ($in['faq_intro'] ?? ''));

$errors = [];
if (mb_strlen($eyebrow) > 80) $errors['faq_eyebrow'] = 'Max 80 characters.';
if ($heading === '' || mb_strlen($heading) > 120) $errors['faq_heading'] = 'Enter a heading (max 120 characters).';
if (mb_strlen($intro) > 400) $errors['faq_intro'] = 'Max 400 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('faq_eyebrow', $eyebrow);
set_setting('faq_heading', $heading);
set_setting('faq_intro', $intro);

json_response(['success' => true, 'data' => get_settings($keys)]);
