<?php
require_auth();

const STUDIO_KEYS = [
    'studio_eyebrow', 'studio_heading', 'studio_heading_accent', 'studio_text1', 'studio_text2',
    'studio_btn_label', 'studio_btn_url', 'studio_image1', 'studio_image2', 'studio_image3',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings(STUDIO_KEYS)]);
}

require_method('POST');

$in = input();
$t = fn(string $k) => trim((string) ($in[$k] ?? ''));

$v = [
    'studio_eyebrow'        => $t('studio_eyebrow'),
    'studio_heading'        => $t('studio_heading'),
    'studio_heading_accent' => $t('studio_heading_accent'),
    'studio_text1'          => $t('studio_text1'),
    'studio_text2'          => $t('studio_text2'),
    'studio_btn_label'      => $t('studio_btn_label'),
    'studio_btn_url'        => $t('studio_btn_url'),
];

$errors = [];
if (mb_strlen($v['studio_eyebrow']) > 80) $errors['studio_eyebrow'] = 'Max 80 characters.';
if ($v['studio_heading'] === '' || mb_strlen($v['studio_heading']) > 120) $errors['studio_heading'] = 'Enter a heading (max 120 characters).';
if (mb_strlen($v['studio_heading_accent']) > 120) $errors['studio_heading_accent'] = 'Max 120 characters.';
foreach (['studio_text1', 'studio_text2'] as $k) {
    if (mb_strlen($v[$k]) > 600) $errors[$k] = 'Max 600 characters.';
}
if ($v['studio_btn_label'] !== '' || $v['studio_btn_url'] !== '') {
    if ($v['studio_btn_label'] === '' || mb_strlen($v['studio_btn_label']) > 40) $errors['studio_btn_label'] = 'Enter button text (max 40 characters).';
    if (!valid_link($v['studio_btn_url']) || strlen($v['studio_btn_url']) > 255) $errors['studio_btn_url'] = 'Use a full link (https://…), a path (/page) or an anchor (#services).';
}
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

foreach ($v as $k => $val) set_setting($k, $val);

foreach ([1, 2, 3] as $n) {
    if ($path = save_image_upload("studio_image$n", "studio-$n")) {
        set_setting("studio_image$n", $path);
    }
}

json_response(['success' => true, 'data' => get_settings(STUDIO_KEYS)]);
