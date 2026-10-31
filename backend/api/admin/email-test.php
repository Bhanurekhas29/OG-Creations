<?php
// Sends a test email using the saved Email Settings, so you can see whether they work.
require_auth();
require_method('POST');

$to = trim((string) (input()['to'] ?? ''));
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    fail('Enter the email address that should receive the test.', 422, ['to' => 'Invalid email']);
}

$site = get_settings(['site_name'])['site_name'] ?? 'OG Creations';
$error = null;
$ok = send_mail($to, "Test email from $site", "This is a test email from the $site admin panel.\n\nIf you can read this, your Email Settings work.\n", $error);

if (!$ok) {
    fail($error ?: 'The test email could not be sent.', 422);
}
json_response(['success' => true, 'message' => "Test email sent to $to. Check the inbox (and the spam folder)."]);
