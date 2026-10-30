<?php
require_auth();

const FOOTER_TEXT_KEYS = ['footer_tagline', 'footer_description', 'footer_copyright', 'social_instagram', 'social_facebook', 'social_youtube'];

/** Decodes a stored JSON list of {label,url}; bad data becomes an empty list. */
function link_list(?string $json): array
{
    $list = json_decode((string) $json, true);
    return is_array($list) ? array_values($list) : [];
}

/** Validates a submitted list of {label,url}; returns [clean list, error message or null]. */
function clean_links($raw, string $what): array
{
    if (!is_array($raw)) return [[], null];
    $out = [];
    foreach ($raw as $row) {
        $label = trim((string) ($row['label'] ?? ''));
        $url   = trim((string) ($row['url'] ?? ''));
        if ($label === '' && $url === '') continue;
        if ($label === '' || mb_strlen($label) > 40) return [[], "$what: every link needs a label (max 40 characters)."];
        if (!valid_link($url) || strlen($url) > 255) return [[], "$what: \"$label\" needs a valid link (https://…, /page or #section)."];
        $out[] = ['label' => $label, 'url' => $url];
    }
    if (count($out) > 10) return [[], "$what: use at most 10 links."];
    return [$out, null];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = get_settings(array_merge(FOOTER_TEXT_KEYS, ['footer_navigate', 'footer_services']));
    $s['footer_navigate'] = link_list($s['footer_navigate'] ?? '');
    $s['footer_services'] = link_list($s['footer_services'] ?? '');
    json_response(['success' => true, 'data' => $s]);
}

require_method('POST');

$in = input();
$t = fn(string $k) => trim((string) ($in[$k] ?? ''));

$errors = [];
foreach (['footer_tagline' => 80, 'footer_copyright' => 120] as $k => $max) {
    if (mb_strlen($t($k)) > $max) $errors[$k] = "Max $max characters.";
}
if (mb_strlen($t('footer_description')) > 200) $errors['footer_description'] = 'Max 200 characters.';
foreach (['social_instagram', 'social_facebook', 'social_youtube'] as $k) {
    $v = $t($k);
    if ($v !== '' && (!preg_match('~^https://[^\s]+$~i', $v) || strlen($v) > 200)) {
        $errors[$k] = 'Enter the full page link, starting with https://';
    }
}

[$nav, $navErr] = clean_links($in['footer_navigate'] ?? [], 'Navigate');
[$svc, $svcErr] = clean_links($in['footer_services'] ?? [], 'Services');
if ($navErr) $errors['footer_navigate'] = $navErr;
if ($svcErr) $errors['footer_services'] = $svcErr;

if ($errors) fail('Please fix the highlighted fields.', 422, $errors);

foreach (FOOTER_TEXT_KEYS as $k) set_setting($k, $t($k));
set_setting('footer_navigate', json_encode($nav, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
set_setting('footer_services', json_encode($svc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

$s = get_settings(array_merge(FOOTER_TEXT_KEYS, ['footer_navigate', 'footer_services']));
$s['footer_navigate'] = $nav;
$s['footer_services'] = $svc;
json_response(['success' => true, 'data' => $s]);
