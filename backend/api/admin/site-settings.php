<?php
require_auth();

$keys = ['site_name', 'header_logo', 'footer_logo'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings($keys)]);
}

require_method('POST');

$siteName = trim((string) (input()['site_name'] ?? ''));
if ($siteName === '') {
    fail('Website name is required.', 422, ['site_name' => 'Required']);
}
set_setting('site_name', $siteName);

if ($path = save_image_upload('header_logo', 'header-logo')) {
    set_setting('header_logo', $path);
}
if ($path = save_image_upload('footer_logo', 'footer-logo')) {
    set_setting('footer_logo', $path);
}

json_response(['success' => true, 'data' => get_settings($keys)]);
