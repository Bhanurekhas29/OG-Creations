<?php
// List / create / update / delete FAQ questions.
require_auth();
ensure_faq_table();
$method = $_SERVER['REQUEST_METHOD'];

function faq_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, question, answer, sort_order, is_active FROM faqs WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    $r['id'] = (int) $r['id'];
    $r['sort_order'] = (int) $r['sort_order'];
    $r['is_active'] = (int) $r['is_active'];
    return $r;
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM faqs ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => faq_row((int) $i), $ids)]);
}

$in = input();
$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !faq_row($id)) fail('Question not found.', 404);
    db()->prepare('DELETE FROM faqs WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

if (!in_array($method, ['POST', 'PUT'], true)) fail('Method not allowed', 405);
if ($method === 'PUT' && (!$id || !faq_row($id))) fail('Question not found.', 404);

$question = trim((string) ($in['question'] ?? ''));
$answer   = trim((string) ($in['answer'] ?? ''));

$errors = [];
if ($question === '' || mb_strlen($question) > 255) $errors['question'] = 'Enter a question (max 255 characters).';
if ($answer === '' || mb_strlen($answer) > 1500) $errors['answer'] = 'Enter an answer (max 1500 characters).';
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$active = empty($in['is_active']) ? 0 : 1;

if ($method === 'PUT') {
    db()->prepare('UPDATE faqs SET question = ?, answer = ?, is_active = ? WHERE id = ?')
        ->execute([$question, $answer, $active, $id]);
    json_response(['success' => true, 'data' => faq_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM faqs')->fetchColumn();
db()->prepare('INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, ?)')
    ->execute([$question, $answer, $next, $active]);
json_response(['success' => true, 'data' => faq_row((int) db()->lastInsertId())], 201);
