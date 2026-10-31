<?php
require_method('GET');

$s = get_settings(['process_eyebrow', 'process_heading', 'process_intro']);
$items = db()->query(
    'SELECT title, description, icon FROM process_steps WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

json_response([
    'success' => true,
    'data'    => [
        'eyebrow' => $s['process_eyebrow'] ?? '',
        'heading' => $s['process_heading'] ?? '',
        'intro'   => $s['process_intro'] ?? '',
        'items'   => $items,
    ],
]);
