<?php
require_method('POST');

if ($token = bearer_token()) {
    db()->prepare('DELETE FROM auth_tokens WHERE token_hash = ?')->execute([hash('sha256', $token)]);
}
json_response(['success' => true]);
