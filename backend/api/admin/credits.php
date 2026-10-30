<?php
require_auth();

$keys = ['show_credits', 'credit_url'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$in  = input();
$url = trim((string) ($in['credit_url'] ?? ''));
if (!filter_var($url, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $url)) {
    fail('Enter a valid link starting with http:// or https://', 422, ['credit_url' => 'Invalid URL']);
}

$show = filter_var($in['show_credits'] ?? false, FILTER_VALIDATE_BOOLEAN);
set_setting('show_credits', $show ? '1' : '0');
set_setting('credit_url', $url);

json_response(['success' => true, 'data' => get_settings($keys)]);
