<?php
require_method('GET');

json_response(['success' => true, 'data' => get_settings(PUBLIC_SETTING_KEYS)]);
