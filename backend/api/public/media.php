<?php
// Serves an image uploaded through the admin and stored in the database: GET /media/<name>
// (index.php sets $mediaName). Names are unique and never change, so responses are cached for a year
// and a repeat request is answered with 304 without touching the database.
$name = $mediaName ?? '';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    fail('Method not allowed', 405);
}

$etag = '"' . md5($name) . '"';
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=31536000, immutable');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
    http_response_code(304);
    exit;
}

$stmt = db()->prepare('SELECT mime, data FROM media WHERE name = ?');
$stmt->execute([$name]);
$row = $stmt->fetch();
if (!$row) {
    header_remove('ETag');
    header('Cache-Control: no-store');
    fail('Image not found', 404);
}

header('Content-Type: ' . $row['mime']);
header('Content-Length: ' . strlen($row['data']));
header('X-Content-Type-Options: nosniff');
if ($row['mime'] === 'image/svg+xml') {
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox");
}
if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
    echo $row['data'];
}
exit;
