<?php
require_method('GET');

$keys = ['bts_heading_bold', 'bts_heading_light', 'bts_3_subtitle'];
foreach ([1, 2, 3, 4, 5] as $n) {
    $keys[] = "bts_{$n}_image";
    $keys[] = "bts_{$n}_caption";
}
$s = get_settings($keys);

$photos = [];
foreach ([1, 2, 3, 4, 5] as $n) {
    $photos[] = [
        'image'    => $s["bts_{$n}_image"] ?? '',
        'caption'  => $s["bts_{$n}_caption"] ?? '',
        'subtitle' => $n === 3 ? ($s['bts_3_subtitle'] ?? '') : '',
    ];
}

json_response([
    'success' => true,
    'data'    => [
        'heading_bold'  => $s['bts_heading_bold'] ?? '',
        'heading_light' => $s['bts_heading_light'] ?? '',
        'photos'        => $photos,
    ],
]);
