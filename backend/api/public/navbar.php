<?php
require_method('GET');

$items = db()->query('SELECT label, url FROM nav_items WHERE is_active = 1 ORDER BY sort_order, id')->fetchAll();
$s = get_settings(['nav_cta_enabled', 'nav_cta_label', 'nav_cta_url']);

json_response([
    'success' => true,
    'data'    => [
        'items' => $items,
        'cta'   => ($s['nav_cta_enabled'] ?? '0') === '1'
            ? ['label' => $s['nav_cta_label'] ?? '', 'url' => $s['nav_cta_url'] ?? '#']
            : null,
    ],
]);
