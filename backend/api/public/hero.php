<?php
require_method('GET');

$s = get_settings([
    'hero_eyebrow', 'hero_heading', 'hero_description',
    'hero_btn1_label', 'hero_btn1_url', 'hero_btn2_label', 'hero_btn2_url',
    'hero_tags', 'hero_bg_image',
]);

$button = fn(string $p) => ($s["{$p}_label"] ?? '') !== '' && ($s["{$p}_url"] ?? '') !== ''
    ? ['label' => $s["{$p}_label"], 'url' => $s["{$p}_url"]]
    : null;

json_response([
    'success' => true,
    'data'    => [
        'eyebrow'     => $s['hero_eyebrow'] ?? '',
        'heading'     => $s['hero_heading'] ?? '',
        'description' => $s['hero_description'] ?? '',
        'button1'     => $button('hero_btn1'),
        'button2'     => $button('hero_btn2'),
        'tags'        => array_values(array_filter(array_map('trim', preg_split('/\R/', $s['hero_tags'] ?? '')))),
        'image'       => $s['hero_bg_image'] ?? '',
    ],
]);
