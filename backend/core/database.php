<?php
declare(strict_types=1);

/**
 * PDO options shared by the API and the installer.
 * TiDB Cloud only accepts encrypted connections: set DB_SSL=1 (and DB_SSL_CA to a CA bundle to
 * also verify the server certificate; without it the connection is encrypted but not verified).
 */
function pdo_options(array $c, array $extra = []): array
{
    $opts = $extra;
    if (!empty($c['timezone'])) {
        $opts[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET time_zone = '" . $c['timezone'] . "'";
    }
    if (!empty($c['ssl'])) {
        if (!empty($c['ssl_ca'])) {
            $opts[PDO::MYSQL_ATTR_SSL_CA] = $c['ssl_ca'];
            $opts[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        } else {
            $opts[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
        }
    }
    return $opts;
}
