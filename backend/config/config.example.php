<?php
// Copy this file to config.php and edit the values for your environment (XAMPP defaults shown).
return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'og_creations',
        'user'    => 'root',
        'pass'    => '',
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'debug'             => true,   // set false in production
        'frontend_url'      => 'http://localhost:5173',
        'token_ttl_hours'   => 12,
        'reset_ttl_minutes' => 30,
        'images_dir'        => __DIR__ . '/../../frontend/public/images',
    ],
    'mail' => [
        'from'      => 'no-reply@ogcreations.com',
        'from_name' => 'OG Creations',
    ],
];
