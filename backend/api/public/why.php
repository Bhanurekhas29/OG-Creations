<?php
require_method('GET');

$s = get_settings(['why_eyebrow', 'why_heading', 'why_image', 'why_subtext']);
$items = db()->query(
    'SELECT title, description FROM why_items WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

json_response([
    'success' => true,
    'data'    => [
        'eyebrow' => $s['why_eyebrow'] ?? '',
        'heading' => $s['why_heading'] ?? '',
        'subtext' => $s['why_subtext'] ?? '',
        'image'   => $s['why_image'] ?? '',
        'items'   => $items,
    ],
]);
