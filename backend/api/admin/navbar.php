<?php
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

function nav_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, label, url, sort_order, is_active FROM nav_items WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    return $r ? ['id' => (int) $r['id'], 'label' => $r['label'], 'url' => $r['url'], 'sort_order' => (int) $r['sort_order'], 'is_active' => (int) $r['is_active']] : null;
}

function validate_nav(array $in): array
{
    $v = ['label' => trim((string) ($in['label'] ?? '')), 'url' => trim((string) ($in['url'] ?? ''))];
    $e = [];
    if ($v['label'] === '' || mb_strlen($v['label']) > 60) $e['label'] = 'Enter a label (max 60 characters).';
    if (!valid_link($v['url']) || strlen($v['url']) > 255) $e['url'] = 'Use a full link (https://…), a path (/about) or an anchor (#contact).';
    return [$v, $e];
}

if ($method === 'GET') {
    $rows = db()->query('SELECT id FROM nav_items ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map('nav_row', array_map('intval', $rows))]);
}

$in = input();

if ($method === 'POST') {
    [$v, $errors] = validate_nav($in);
    if ($errors) fail('Please fix the highlighted fields.', 422, $errors);
    $next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM nav_items')->fetchColumn();
    db()->prepare('INSERT INTO nav_items (label, url, sort_order, is_active) VALUES (?, ?, ?, ?)')
        ->execute([$v['label'], $v['url'], $next, empty($in['is_active']) ? 0 : 1]);
    json_response(['success' => true, 'data' => nav_row((int) db()->lastInsertId())], 201);
}

$id = (int) ($_GET['id'] ?? 0);
if (!$id || !nav_row($id)) fail('Menu item not found.', 404);

if ($method === 'PUT') {
    [$v, $errors] = validate_nav($in);
    if ($errors) fail('Please fix the highlighted fields.', 422, $errors);
    db()->prepare('UPDATE nav_items SET label = ?, url = ?, is_active = ? WHERE id = ?')
        ->execute([$v['label'], $v['url'], empty($in['is_active']) ? 0 : 1, $id]);
    json_response(['success' => true, 'data' => nav_row($id)]);
}

if ($method === 'DELETE') {
    db()->prepare('DELETE FROM nav_items WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

fail('Method not allowed', 405);
