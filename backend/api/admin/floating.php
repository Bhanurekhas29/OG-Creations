<?php
// Floating call / WhatsApp buttons shown on every page of the website.
require_auth();

$keys = ['float_call_enabled', 'float_call_number', 'float_wa_enabled', 'float_wa_number', 'float_wa_message'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in   = input();
$call = preg_replace('/[^0-9+]/', '', (string) ($in['float_call_number'] ?? ''));
$wa   = preg_replace('/\D/', '', (string) ($in['float_wa_number'] ?? ''));
$msg  = trim((string) ($in['float_wa_message'] ?? ''));
$callOn = filter_var($in['float_call_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
$waOn   = filter_var($in['float_wa_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);

$errors = [];
if ($callOn && !preg_match('/^\+?[0-9]{7,15}$/', $call)) $errors['float_call_number'] = 'Enter the phone number to call (digits only).';
if ($waOn && !preg_match('/^[0-9]{10,15}$/', $wa)) $errors['float_wa_number'] = 'Enter the WhatsApp number with country code, e.g. 919884277001.';
if (mb_strlen($msg) > 200) $errors['float_wa_message'] = 'Max 200 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

set_setting('float_call_enabled', $callOn ? '1' : '0');
set_setting('float_call_number', $call);
set_setting('float_wa_enabled', $waOn ? '1' : '0');
set_setting('float_wa_number', $wa);
set_setting('float_wa_message', $msg);

json_response(['success' => true, 'data' => get_settings($keys)]);
