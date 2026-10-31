<?php
require_method('GET');

$all = get_settings();
if (($all['content_seo_v1'] ?? '') !== '1') {
    apply_seo_content_once($all);   // one-time content update (a no-op once done)
    $all = get_settings();          // re-read so this very response already has the new texts
}

if (($all['content_works_desc_v1'] ?? '') !== '1') {
    apply_works_descriptions_once($all);
}

json_response(['success' => true, 'data' => array_intersect_key($all, array_flip(PUBLIC_SETTING_KEYS))]);
