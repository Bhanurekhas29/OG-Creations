<?php
// List / create / update / delete featured projects (video + thumbnail).
// Create and update both use POST (multipart) because PHP does not parse files on PUT.
require_auth();
ensure_works_description();
$method = $_SERVER['REQUEST_METHOD'];

function work_row(int $id): ?array
{
    $stmt = db()->prepare('SELECT id, title, category, description, video_url, thumbnail, sort_order, is_active FROM works WHERE id = ?');
    $stmt->execute([$id]);
    $r = $stmt->fetch();
    if (!$r) return null;
    $r['id'] = (int) $r['id'];
    $r['sort_order'] = (int) $r['sort_order'];
    $r['is_active'] = (int) $r['is_active'];
    return $r;
}

if ($method === 'GET') {
    $ids = db()->query('SELECT id FROM works ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response(['success' => true, 'data' => array_map(fn($i) => work_row((int) $i), $ids)]);
}

$id = (int) ($_GET['id'] ?? 0);

if ($method === 'DELETE') {
    if (!$id || !($old = work_row($id))) fail('Project not found.', 404);
    delete_uploaded_video($old['video_url']);
    db()->prepare('DELETE FROM works WHERE id = ?')->execute([$id]);
    json_response(['success' => true]);
}

require_method('POST');
if ($id && !work_row($id)) fail('Project not found.', 404);

$in       = input();
$title    = trim((string) ($in['title'] ?? ''));
$category = trim((string) ($in['category'] ?? ''));
$desc     = trim((string) ($in['description'] ?? ''));
$video    = trim((string) ($in['video_url'] ?? ''));

$errors = [];
if ($title === '' || mb_strlen($title) > 80) $errors['title'] = 'Enter a title (max 80 characters).';
if (mb_strlen($category) > 60) $errors['category'] = 'Max 60 characters.';
if (mb_strlen($desc) > 255) $errors['description'] = 'Max 255 characters.';
if ($video !== '' && (!preg_match('~^https?://[^\s]+$~i', $video) || strlen($video) > 500)) {
    $errors['video_url'] = 'Enter a full video link starting with http:// or https://';
}
if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

$active = filter_var($in['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$thumb  = save_image_upload('thumbnail', 'work');
$upload = save_video_upload('video_file', 'work-video');   // an uploaded file replaces the link
if ($upload) $video = $upload;

if ($id) {
    $before = work_row($id)['video_url'];
    if ($before !== $video) delete_uploaded_video($before);
    db()->prepare('UPDATE works SET title = ?, category = ?, description = ?, video_url = ?, is_active = ? WHERE id = ?')
        ->execute([$title, $category, $desc, $video, $active, $id]);
    if ($thumb) db()->prepare('UPDATE works SET thumbnail = ? WHERE id = ?')->execute([$thumb, $id]);
    json_response(['success' => true, 'data' => work_row($id)]);
}

$next = (int) db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM works')->fetchColumn();
db()->prepare('INSERT INTO works (title, category, description, video_url, thumbnail, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)')
    ->execute([$title, $category, $desc, $video, $thumb ?? '', $next, $active]);
json_response(['success' => true, 'data' => work_row((int) db()->lastInsertId())], 201);
