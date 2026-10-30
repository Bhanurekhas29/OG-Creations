<?php
// List / create / update / delete production-process steps.
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

// Must match frontend/src/shared/processIcons.js
const PROCESS_ICONS = [
    'Lightbulb', 'ClipboardList', 'Users', 'Clapperboard', 'Package', 'Camera', 'Film', 'Pencil',
    'Scissors', 'Music', 'Megaphone', 'Star', 'Sparkles', 'Rocket', 'CheckCircle', 'Palette', 'Mic',
];

function step_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, title, description, icon, sort_order, is_active FROM process_steps WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    $r['id'] = (int) $r['id'];
    $r['sort_order'] = (int) $r['sort_order'];
    $r['is_active'] = (int) $r['is_active'];
    return $r;
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM process_steps ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => step_row((int) $i), $ids), 'icons' => PROCESS_ICONS]);
}

$in = input();
$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !step_row($id)) fail('Step not found.', 404);
    db()->prepare('DELETE FROM process_steps WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

if (!in_array($method, ['POST', 'PUT'], true)) fail('Method not allowed', 405);
if ($method === 'PUT' && (!$id || !step_row($id))) fail('Step not found.', 404);

$title = trim((string) ($in['title'] ?? ''));
$desc  = trim((string) ($in['description'] ?? ''));
$icon  = (string) ($in['icon'] ?? '');

$errors = [];
if ($title === '' || mb_strlen($title) > 60) $errors['title'] = 'Enter a title (max 60 characters).';
if (mb_strlen($desc) > 255) $errors['description'] = 'Max 255 characters.';
if (!in_array($icon, PROCESS_ICONS, true)) $errors['icon'] = 'Choose an icon from the list.';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$active = empty($in['is_active']) ? 0 : 1;

if ($method === 'PUT') {
    db()->prepare('UPDATE process_steps SET title = ?, description = ?, icon = ?, is_active = ? WHERE id = ?')
        ->execute([$title, $desc, $icon, $active, $id]);
    json_response(['success' => true, 'data' => step_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM process_steps')->fetchColumn();
db()->prepare('INSERT INTO process_steps (title, description, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?)')
    ->execute([$title, $desc, $icon, $next, $active]);
json_response(['success' => true, 'data' => step_row((int) db()->lastInsertId())], 201);
