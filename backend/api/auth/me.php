<?php
require_method('GET');
json_response(['success' => true, 'user' => require_auth()]);
