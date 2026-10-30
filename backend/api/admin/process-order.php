<?php
require_auth();
require_method('POST');

$ids = input()['ids'] ?? null;
if (!is_array($ids) || !$ids) {
    fail('Invalid order.', 422);
}

$pdo = db();
$pdo->beginTransaction();
$stmt = $pdo->prepare('UPDATE process_steps SET sort_order = ? WHERE id = ?');
foreach (array_values($ids) as $i => $id) {
    $stmt->execute([$i + 1, (int) $id]);
}
$pdo->commit();

json_response(['success' => true]);
