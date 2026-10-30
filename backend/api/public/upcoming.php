<?php
require_method('GET');

$s = get_settings(['upcoming_heading', 'upcoming_subtitle']);
$rows = db()->query(
    'SELECT title, tagline, lead_actor, lead_actress, supporting_cast, release_date, status_label, image
       FROM upcoming_projects WHERE is_active = 1 ORDER BY sort_order, id'
)->fetchAll();

$items = array_map(fn($r) => [
    'title'        => $r['title'],
    'tagline'      => preg_replace('/\R/', "\n", $r['tagline']),
    'lead_actor'   => $r['lead_actor'],
    'lead_actress' => $r['lead_actress'],
    'cast'         => array_values(array_filter(array_map('trim', preg_split('/\R/', $r['supporting_cast'])))),
    'release_date' => $r['release_date'],
    'status'       => $r['status_label'],
    'image'        => $r['image'],
], $rows);

json_response([
    'success' => true,
    'data'    => [
        'heading'  => $s['upcoming_heading'] ?? '',
        'subtitle' => $s['upcoming_subtitle'] ?? '',
        'items'    => $items,
    ],
]);
