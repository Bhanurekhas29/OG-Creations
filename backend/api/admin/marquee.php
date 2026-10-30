<?php
require_auth();

$keys = ['marquee_enabled', 'marquee_items', 'marquee_speed'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in    = input();
$items = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) ($in['marquee_items'] ?? '')))));
$speed = (int) ($in['marquee_speed'] ?? 30);

$errors = [];
if (!$items) $errors['marquee_items'] = 'Add at least one item.';
elseif (count($items) > 20) $errors['marquee_items'] = 'Use at most 20 items.';
else {
    foreach ($items as $item) {
        if (mb_strlen($item) > 40) { $errors['marquee_items'] = 'Each item must be 40 characters or fewer.'; break; }
    }
}
if ($speed < 10 || $speed > 120) $errors['marquee_speed'] = 'Choose a value between 10 and 120 seconds.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('marquee_enabled', filter_var($in['marquee_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN) ? '1' : '0');
set_setting('marquee_items', implode("\n", $items));
set_setting('marquee_speed', (string) $speed);

json_response(['success' => true, 'data' => get_settings($keys)]);
