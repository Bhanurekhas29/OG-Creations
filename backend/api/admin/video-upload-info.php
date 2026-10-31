<?php
// Tells the admin whether video files can be uploaded on this server, and the size limit.
require_auth();
json_response(['success' => true, 'data' => [
    'enabled' => (bool) config('app.video_uploads'),
    'max_mb'  => (int) config('app.max_video_mb'),
]]);
