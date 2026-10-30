<?php
require_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'data' => get_settings(['favicon'])]);
}

require_method('POST');

if (filter_var(input()['remove'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
    set_setting('favicon', '');
} elseif ($path = save_image_upload('favicon', 'favicon', ['image/x-icon' => 'ico', 'image/vnd.microsoft.icon' => 'ico'])) {
    set_setting('favicon', $path);
} else {
    fail('Choose an image to upload.', 422, ['favicon' => 'Required']);
}

json_response(['success' => true, 'data' => get_settings(['favicon'])]);
