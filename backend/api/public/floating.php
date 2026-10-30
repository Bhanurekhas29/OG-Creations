<?php
require_method('GET');

$s = get_settings(['float_call_enabled', 'float_call_number', 'float_wa_enabled', 'float_wa_number', 'float_wa_message']);

$call = ($s['float_call_enabled'] ?? '0') === '1' && ($s['float_call_number'] ?? '') !== ''
    ? 'tel:' . (preg_match('/^[0-9]{10}$/', $s['float_call_number']) ? '+91' : '') . $s['float_call_number'] : null;

$wa = null;
if (($s['float_wa_enabled'] ?? '0') === '1' && ($s['float_wa_number'] ?? '') !== '') {
    $wa = 'https://wa.me/' . $s['float_wa_number'];
    if (($s['float_wa_message'] ?? '') !== '') $wa .= '?text=' . rawurlencode($s['float_wa_message']);
}

json_response(['success' => true, 'data' => ['call' => $call, 'whatsapp' => $wa]]);
