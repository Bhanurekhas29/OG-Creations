<?php
require_method('GET');

$s = get_settings([
    'site_name', 'footer_logo', 'footer_tagline', 'footer_description', 'footer_copyright',
    'footer_navigate', 'footer_services', 'social_instagram', 'social_facebook', 'social_youtube',
    'float_wa_enabled', 'float_wa_number', 'contact_phone', 'contact_email', 'contact_address',
    'show_credits', 'credit_url',
]);

$list = function (?string $json): array {
    $l = json_decode((string) $json, true);
    return is_array($l) ? array_values($l) : [];
};

// The WhatsApp icon uses the number from Floating Buttons.
$wa = ($s['float_wa_number'] ?? '') !== '' ? 'https://wa.me/' . $s['float_wa_number'] : '';

json_response([
    'success' => true,
    'data'    => [
        'site_name'   => $s['site_name'] ?? '',
        'logo'        => $s['footer_logo'] ?? '',
        'tagline'     => $s['footer_tagline'] ?? '',
        'description' => $s['footer_description'] ?? '',
        'copyright'   => $s['footer_copyright'] ?? '',
        'navigate'    => $list($s['footer_navigate'] ?? ''),
        'services'    => $list($s['footer_services'] ?? ''),
        'contact'     => [
            'phone'   => $s['contact_phone'] ?? '',
            'email'   => $s['contact_email'] ?? '',
            'address' => $s['contact_address'] ?? '',
        ],
        'social'      => [
            'instagram' => $s['social_instagram'] ?? '',
            'whatsapp'  => $wa,
            'facebook'  => $s['social_facebook'] ?? '',
            'youtube'   => $s['social_youtube'] ?? '',
        ],
        'credits'     => ['show' => ($s['show_credits'] ?? '0') === '1', 'url' => $s['credit_url'] ?? ''],
    ],
]);
