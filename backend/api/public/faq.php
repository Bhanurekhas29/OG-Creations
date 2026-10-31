<?php
require_method('GET');
ensure_faq_table();

$s = get_settings(['faq_eyebrow', 'faq_heading', 'faq_intro']);
$items = db()->query(
    'SELECT question, answer FROM faqs WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

json_response([
    'success' => true,
    'data'    => [
        'eyebrow' => $s['faq_eyebrow'] ?? '',
        'heading' => $s['faq_heading'] ?? '',
        'intro'   => $s['faq_intro'] ?? '',
        'items'   => $items,
    ],
]);
