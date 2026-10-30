<?php
// List / create / update / delete upcoming-project slides.
// Create and update both use POST (multipart) because PHP does not parse files on PUT.
require_auth();
$method = $_SERVER['REQUEST_METHOD'];

const UPCOMING_COLS = 'id, title, tagline, lead_actor, lead_actress, supporting_cast, release_date, status_label, image, sort_order, is_active';

function up_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT ' . UPCOMING_COLS . ' FROM upcoming_projects WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    $r['id'] = (int) $r['id'];
    $r['sort_order'] = (int) $r['sort_order'];
    $r['is_active'] = (int) $r['is_active'];
    return $r;
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM upcoming_projects ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => up_row((int) $i), $ids)]);
}

$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !up_row($id)) fail('Project not found.', 404);
    db()->prepare('DELETE FROM upcoming_projects WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

require_method('POST');
if ($id && !up_row($id)) fail('Project not found.', 404);

$in = input();
$t  = fn(string $k) => trim((string) ($in[$k] ?? ''));

$title   = $t('title');
$tagline = preg_replace('/\R/', "\n", $t('tagline'));
$actor   = $t('lead_actor');
$actress = $t('lead_actress');
$date    = $t('release_date');
$status  = $t('status_label');
$cast    = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) ($in['supporting_cast'] ?? '')))));

$errors = [];
if ($title === '' || mb_strlen($title) > 80) $errors['title'] = 'Enter a title (max 80 characters).';
if (mb_strlen($tagline) > 200) $errors['tagline'] = 'Max 200 characters.';
if (mb_strlen($actor) > 80) $errors['lead_actor'] = 'Max 80 characters.';
if (mb_strlen($actress) > 80) $errors['lead_actress'] = 'Max 80 characters.';
if (mb_strlen($date) > 40) $errors['release_date'] = 'Max 40 characters.';
if (mb_strlen($status) > 40) $errors['status_label'] = 'Max 40 characters.';
if (count($cast) > 8) $errors['supporting_cast'] = 'Use at most 8 names.';
foreach ($cast as $name) {
    if (mb_strlen($name) > 60) { $errors['supporting_cast'] = 'Each name must be 60 characters or fewer.'; break; }
}
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$castText = implode("\n", $cast);
$active   = filter_var($in['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$image    = save_image_upload('image', 'upcoming');

if ($id) {
    db()->prepare(
        'UPDATE upcoming_projects SET title = ?, tagline = ?, lead_actor = ?, lead_actress = ?, supporting_cast = ?,
                release_date = ?, status_label = ?, is_active = ? WHERE id = ?'
    )->execute([$title, $tagline, $actor, $actress, $castText, $date, $status, $active, $id]);
    if ($image) db()->prepare('UPDATE upcoming_projects SET image = ? WHERE id = ?')->execute([$image, $id]);
    json_response(['success' => true, 'data' => up_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM upcoming_projects')->fetchColumn();
db()->prepare(
    'INSERT INTO upcoming_projects (title, tagline, lead_actor, lead_actress, supporting_cast, release_date, status_label, image, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute([$title, $tagline, $actor, $actress, $castText, $date, $status, $image ?? '', $next, $active]);
json_response(['success' => true, 'data' => up_row((int) db()->lastInsertId())], 201);
