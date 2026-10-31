<?php
// Behind the Scenes: heading + five fixed photo slots (1 top-left, 2 bottom-left,
// 3 centre, 4 top-right, 5 bottom-right), each with a caption.
require_auth();

$keys = ['bts_heading_bold', 'bts_heading_light', 'bts_3_subtitle', 'bts_intro'];
foreach ([1, 2, 3, 4, 5] as $n) {
    $keys[] = "bts_{$n}_image";
    $keys[] = "bts_{$n}_caption";
    $keys[] = "bts_{$n}_alt";
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in = input();
$t = fn(string $k) => trim((string) ($in[$k] ?? ''));

$text = ['bts_heading_bold' => $t('bts_heading_bold'), 'bts_heading_light' => $t('bts_heading_light'), 'bts_3_subtitle' => $t('bts_3_subtitle')];
$long = ['bts_intro' => $t('bts_intro')];
foreach ([1, 2, 3, 4, 5] as $n) {
    $text["bts_{$n}_caption"] = $t("bts_{$n}_caption");
    $long["bts_{$n}_alt"] = $t("bts_{$n}_alt");
}

$errors = [];
if ($text['bts_heading_bold'] === '' && $text['bts_heading_light'] === '') $errors['bts_heading_bold'] = 'Enter a heading.';
foreach ($text as $k => $v) {
    if (mb_strlen($v) > 80) $errors[$k] = 'Max 80 characters.';
}
foreach ($long as $k => $v) {
    $max = $k === 'bts_intro' ? 400 : 160;
    if (mb_strlen($v) > $max) $errors[$k] = "Max $max characters.";
}
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

foreach ($text + $long as $k => $v) set_setting($k, $v);

foreach ([1, 2, 3, 4, 5] as $n) {
    if ($path = save_image_upload("bts_{$n}_image", "bts-$n")) {
        set_setting("bts_{$n}_image", $path);
    }
}

json_response(['success' => true, 'data' => get_settings($keys)]);
