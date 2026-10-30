<?php
// List / create / update / delete service cards.
// Create and update both use POST (multipart) because PHP does not parse files on PUT.
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

function svc_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, title, description, image, sort_order, is_active FROM services WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    return [
        'id' => (int) $r['id'], 'title' => $r['title'], 'description' => $r['description'],
        'image' => $r['image'], 'sort_order' => (int) $r['sort_order'], 'is_active' => (int) $r['is_active'],
    ];
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM services ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => svc_row((int) $i), $ids)]);
}

$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !svc_row($id)) fail('Service not found.', 404);
    db()->prepare('DELETE FROM services WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

require_method('POST');
if ($id && !svc_row($id)) fail('Service not found.', 404);

$in    = input();
$title = trim((string) ($in['title'] ?? ''));
$desc  = trim((string) ($in['description'] ?? ''));

$errors = [];
if ($title === '' || mb_strlen($title) > 60) $errors['title'] = 'Enter a title (max 60 characters).';
if (mb_strlen($desc) > 255) $errors['description'] = 'Max 255 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$active = filter_var($in['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$image  = save_image_upload('image', 'service');

if ($id) {
    db()->prepare('UPDATE services SET title = ?, description = ?, is_active = ? WHERE id = ?')
        ->execute([$title, $desc, $active, $id]);
    if ($image) db()->prepare('UPDATE services SET image = ? WHERE id = ?')->execute([$image, $id]);
    json_response(['success' => true, 'data' => svc_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services')->fetchColumn();
db()->prepare('INSERT INTO services (title, description, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?)')
    ->execute([$title, $desc, $image ?? '', $next, $active]);
json_response(['success' => true, 'data' => svc_row((int) db()->lastInsertId())], 201);
