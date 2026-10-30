<?php
// Copy this file to config.local.php (git-ignored) and edit the values for your computer.
// Anything set here overrides the defaults and environment variables in config.php.
return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'og_creations',
        'user' => 'root',
        'pass' => '',
    ],
    'app' => [
        'debug' => true,   // set false in production
    ],
];
