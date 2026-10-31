<?php
// GET  -> contact section content + service options for the form
// POST -> validate and store a new enquiry, then email the notification address
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $s = get_settings([
        'contact_eyebrow', 'contact_heading', 'contact_subheading', 'contact_phone', 'contact_email',
        'contact_address', 'contact_map_embed', 'contact_directions_url', 'contact_bg_image',
        'contact_intro', 'contact_map_title',
    ]);
    $services = db()->query('SELECT title FROM services WHERE is_active = 1 ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
    json_response([
        'success' => true,
        'data'    => [
            'eyebrow'        => $s['contact_eyebrow'] ?? '',
            'heading'        => $s['contact_heading'] ?? '',
            'subheading'     => $s['contact_subheading'] ?? '',
            'intro'          => $s['contact_intro'] ?? '',
            'map_title'      => $s['contact_map_title'] ?? '',
            'phone'          => $s['contact_phone'] ?? '',
            'email'          => $s['contact_email'] ?? '',
            'address'        => $s['contact_address'] ?? '',
            'map_embed'      => $s['contact_map_embed'] ?? '',
            'directions_url' => $s['contact_directions_url'] ?? '',
            'image'          => $s['contact_bg_image'] ?? '',
            'services'       => array_values($services),
        ],
    ]);
}

require_method('POST');

$in = input();

// Honeypot: real visitors never see or fill this field. Pretend success to bots.
if (trim((string) ($in['website'] ?? '')) !== '') {
    json_response(['success' => true, 'message' => 'Thank you!']);
}

$name    = trim((string) ($in['name'] ?? ''));
$phone   = trim((string) ($in['phone'] ?? ''));
$email   = strtolower(trim((string) ($in['email'] ?? '')));
$service = trim((string) ($in['service'] ?? ''));
$message = trim((string) ($in['message'] ?? ''));

$errors = [];
if (!preg_match('/^[\p{L}\p{M} .\'-]{2,80}$/u', $name)) $errors['name'] = 'Enter your full name (letters only, 2-80 characters).';
if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) $errors['phone'] = 'Enter a valid 10-digit mobile number.';
if (!preg_match('/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/', $email) || strlen($email) > 120) {
    $errors['email'] = 'Enter a valid email address, e.g. you@example.com';
}

$valid = db()->query('SELECT title FROM services WHERE is_active = 1')->fetchAll(PDO::FETCH_COLUMN);
$valid[] = 'Other';
if (!in_array($service, $valid, true)) $errors['service'] = 'Please choose a service.';

$len = mb_strlen($message);
if ($len < 10 || $len > 1000) $errors['message'] = 'Tell us a little about your project (10-1000 characters).';

if ($errors) fail('Please correct the highlighted fields.', 422, $errors);

// Basic abuse limit: 5 enquiries per IP per hour.
$ip = substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
$recent = db()->prepare('SELECT COUNT(*) FROM enquiries WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
$recent->execute([$ip]);
if ((int) $recent->fetchColumn() >= 5) {
    fail('You have sent several enquiries recently. Please try again later or call us.', 429);
}

db()->prepare('INSERT INTO enquiries (name, phone, email, service, message, ip) VALUES (?, ?, ?, ?, ?, ?)')
    ->execute([$name, $phone, $email, $service, $message, $ip]);

$s = get_settings(['contact_notify_email', 'contact_success_message', 'site_name']);

// The enquiry is already saved; reply to the visitor now and send the email afterwards.
json_response_then([
    'success' => true,
    'message' => $s['contact_success_message'] ?? 'Thank you! Your enquiry has been received.',
], 201, function () use ($s, $name, $phone, $email, $service, $message) {
    if (empty($s['contact_notify_email'])) return;
    $site = $s['site_name'] ?? 'OG Creations';
    send_mail(
        $s['contact_notify_email'],
        "New enquiry from {$name} - {$site}",
        "Name: $name\nPhone: +91 $phone\nEmail: $email\nService: $service\n\nProject details:\n$message\n"
    );
});
