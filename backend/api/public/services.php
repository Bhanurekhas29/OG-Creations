<?php
require_method('GET');

$s = get_settings(['services_eyebrow', 'services_heading']);
$items = db()->query(
    'SELECT title, description, image FROM services WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

json_response([
    'success' => true,
    'data'    => [
        'eyebrow' => $s['services_eyebrow'] ?? '',
        'heading' => $s['services_heading'] ?? '',
        'items'   => $items,
    ],
]);
