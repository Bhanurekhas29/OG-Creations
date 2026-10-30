<?php
// Enquiries inbox: list, mark read/unread (POST ?id=&read=0|1), delete (DELETE ?id=).
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = db()->query(
        'SELECT id, name, phone, email, service, message, is_read, created_at FROM enquiries ORDER BY id DESC LIMIT 500'
    )->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['is_read'] = (int) $r['is_read'];
    }
    $unread = (int) db()->query('SELECT COUNT(*) FROM enquiries WHERE is_read = 0')->fetchColumn();
    json_response(['success' => true, 'data' => $rows, 'unread' => $unread]);
}

$id = (int) ($_GET['id'] ?? 0);
$exists = db()->prepare('SELECT COUNT(*) FROM enquiries WHERE id = ?');
$exists->execute([$id]);
if (!$id || !(int) $exists->fetchColumn()) fail('Enquiry not found.', 404);

if ($method === 'POST') {
    $read = filter_var($_GET['read'] ?? '1', FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    db()->prepare('UPDATE enquiries SET is_read = ? WHERE id = ?')->execute([$read, $id]);
    json_response(['success' => true]);
}

if ($method === 'DELETE') {
    db()->prepare('DELETE FROM enquiries WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

fail('Method not allowed', 405);
