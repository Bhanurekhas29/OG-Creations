<?php
require_method('GET');

$s = get_settings(['marquee_enabled', 'marquee_items', 'marquee_speed']);
$items = array_values(array_filter(array_map('trim', preg_split('/\R/', $s['marquee_items'] ?? ''))));

json_response([
    'success' => true,
    'data'    => [
        'enabled' => ($s['marquee_enabled'] ?? '0') === '1' && $items !== [],
        'items'   => $items,
        'speed'   => (int) ($s['marquee_speed'] ?? 30),
    ],
]);
