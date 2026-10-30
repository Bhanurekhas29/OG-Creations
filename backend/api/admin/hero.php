<?php
require_auth();

const HERO_KEYS = [
    'hero_eyebrow', 'hero_heading', 'hero_description',
    'hero_btn1_label', 'hero_btn1_url', 'hero_btn2_label', 'hero_btn2_url',
    'hero_tags', 'hero_bg_image',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings(HERO_KEYS)]);
}

require_method('POST');

$in = input();
$t = fn(string $k) => trim((string) ($in[$k] ?? ''));

$v = [
    'hero_eyebrow'     => $t('hero_eyebrow'),
    'hero_heading'     => $t('hero_heading'),
    'hero_description' => $t('hero_description'),
    'hero_btn1_label'  => $t('hero_btn1_label'),
    'hero_btn1_url'    => $t('hero_btn1_url'),
    'hero_btn2_label'  => $t('hero_btn2_label'),
    'hero_btn2_url'    => $t('hero_btn2_url'),
];

$errors = [];
if (mb_strlen($v['hero_eyebrow']) > 120) $errors['hero_eyebrow'] = 'Max 120 characters.';
if ($v['hero_heading'] === '' || mb_strlen($v['hero_heading']) > 200) $errors['hero_heading'] = 'Enter a heading (max 200 characters).';
if (mb_strlen($v['hero_description']) > 500) $errors['hero_description'] = 'Max 500 characters.';

// A button is optional: leave its text and link empty to hide it.
foreach (['hero_btn1', 'hero_btn2'] as $b) {
    $label = $v["{$b}_label"];
    $url   = $v["{$b}_url"];
    if ($label === '' && $url === '') continue;
    if ($label === '' || mb_strlen($label) > 40) $errors["{$b}_label"] = 'Enter button text (max 40 characters).';
    if (!valid_link($url) || strlen($url) > 255) $errors["{$b}_url"] = 'Use a full link (https://…), a path (/page) or an anchor (#contact).';
}

$tags = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) ($in['hero_tags'] ?? '')))));
if (count($tags) > 8) $errors['hero_tags'] = 'Use at most 8 items.';
foreach ($tags as $tag) {
    if (mb_strlen($tag) > 40) { $errors['hero_tags'] = 'Each item must be 40 characters or fewer.'; break; }
}

if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

foreach ($v as $k => $val) set_setting($k, $val);
set_setting('hero_tags', implode("\n", $tags));

if ($path = save_image_upload('hero_bg_image', 'hero')) {
    set_setting('hero_bg_image', $path);
} elseif (filter_var($in['remove_bg_image'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
    set_setting('hero_bg_image', '');
}

json_response(['success' => true, 'data' => get_settings(HERO_KEYS)]);
