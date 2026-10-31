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

// Videos live on disk. Served with Range support so players can seek.
$videoFile = video_dir() . '/' . $name;
if (preg_match('/\.(mp4|webm)$/', $name) && is_file($videoFile)) {
    $size = filesize($videoFile);
    $start = 0;
    $end = $size - 1;
    header('Content-Type: ' . (str_ends_with($name, '.webm') ? 'video/webm' : 'video/mp4'));
    header('Accept-Ranges: bytes');
    header('X-Content-Type-Options: nosniff');
    if (preg_match('/^bytes=(\d*)-(\d*)$/', $_SERVER['HTTP_RANGE'] ?? '', $r) && ($r[1] !== '' || $r[2] !== '')) {
        if ($r[1] === '') { $start = max(0, $size - (int) $r[2]); } else { $start = (int) $r[1]; if ($r[2] !== '') $end = min($end, (int) $r[2]); }
        if ($start > $end || $start >= $size) {
            http_response_code(416);
            header("Content-Range: bytes */$size");
            exit;
        }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }
    header('Content-Length: ' . ($end - $start + 1));
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
        $fp = fopen($videoFile, 'rb');
        fseek($fp, $start);
        $left = $end - $start + 1;
        while ($left > 0 && !feof($fp)) {
            $chunk = fread($fp, min(8192 * 8, $left));
            echo $chunk;
            $left -= strlen($chunk);
            flush();
        }
        fclose($fp);
    }
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
