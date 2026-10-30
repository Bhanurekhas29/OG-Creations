<?php
require_method('GET');

$s = get_settings([
    'studio_eyebrow', 'studio_heading', 'studio_heading_accent', 'studio_text1', 'studio_text2',
    'studio_btn_label', 'studio_btn_url', 'studio_image1', 'studio_image2', 'studio_image3',
]);

json_response([
    'success' => true,
    'data'    => [
        'eyebrow'       => $s['studio_eyebrow'] ?? '',
        'heading'       => $s['studio_heading'] ?? '',
        'heading_accent' => $s['studio_heading_accent'] ?? '',
        'paragraphs'    => array_values(array_filter([$s['studio_text1'] ?? '', $s['studio_text2'] ?? ''])),
        'button'        => ($s['studio_btn_label'] ?? '') !== '' && ($s['studio_btn_url'] ?? '') !== ''
            ? ['label' => $s['studio_btn_label'], 'url' => $s['studio_btn_url']]
            : null,
        'images'        => [$s['studio_image1'] ?? '', $s['studio_image2'] ?? '', $s['studio_image3'] ?? ''],
    ],
]);
