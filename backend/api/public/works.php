<?php
require_method('GET');

$s = get_settings(['works_eyebrow', 'works_heading', 'works_categories']);
$items = db()->query(
    'SELECT title, category, video_url, thumbnail FROM works WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

json_response([
    'success' => true,
    'data'    => [
        'eyebrow'    => $s['works_eyebrow'] ?? '',
        'heading'    => $s['works_heading'] ?? '',
        'categories' => array_values(array_filter(array_map('trim', preg_split('/\R/', $s['works_categories'] ?? '')))),
        'items'      => $items,
    ],
]);
