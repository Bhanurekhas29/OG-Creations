<?php
require_method('GET');
$user = require_auth();

// Counters are added here as each module (enquiries, etc.) is built.
json_response([
    'success' => true,
    'data'    => [
        'user'  => $user,
        'stats' => [
            'users' => (int) db()->query('SELECT COUNT(*) FROM users')->fetchColumn(),
            'unread_enquiries' => (int) db()->query('SELECT COUNT(*) FROM enquiries WHERE is_read = 0')->fetchColumn(),
        ],
    ],
]);
