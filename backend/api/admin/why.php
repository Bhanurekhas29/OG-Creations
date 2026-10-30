<?php
// List / create / update / delete "Why choose us" reasons.
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

function why_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, title, description, sort_order, is_active FROM why_items WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    $r['id'] = (int) $r['id'];
    $r['sort_order'] = (int) $r['sort_order'];
    $r['is_active'] = (int) $r['is_active'];
    return $r;
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM why_items ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => why_row((int) $i), $ids)]);
}

$in = input();
$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !why_row($id)) fail('Item not found.', 404);
    db()->prepare('DELETE FROM why_items WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

if (!in_array($method, ['POST', 'PUT'], true)) fail('Method not allowed', 405);
if ($method === 'PUT' && (!$id || !why_row($id))) fail('Item not found.', 404);

$title = trim((string) ($in['title'] ?? ''));
$desc  = trim((string) ($in['description'] ?? ''));

$errors = [];
if ($title === '' || mb_strlen($title) > 80) $errors['title'] = 'Enter a title (max 80 characters).';
if (mb_strlen($desc) > 255) $errors['description'] = 'Max 255 characters.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$active = empty($in['is_active']) ? 0 : 1;

if ($method === 'PUT') {
    db()->prepare('UPDATE why_items SET title = ?, description = ?, is_active = ? WHERE id = ?')
        ->execute([$title, $desc, $active, $id]);
    json_response(['success' => true, 'data' => why_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM why_items')->fetchColumn();
db()->prepare('INSERT INTO why_items (title, description, sort_order, is_active) VALUES (?, ?, ?, ?)')
    ->execute([$title, $desc, $next, $active]);
json_response(['success' => true, 'data' => why_row((int) db()->lastInsertId())], 201);
