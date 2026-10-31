<?php
declare(strict_types=1);

/**
 * Email sending through SMTP (Gmail, your domain's mail...), set up in the admin under Email Settings.
 * In debug mode every message is also written to backend/storage/mail.log.
 */

const MAIL_SETTING_KEYS = [
    'mail_from_name', 'mail_from_email',
    'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass',
];

function mail_settings(): array
{
    $s = get_settings(MAIL_SETTING_KEYS);
    return $s + [
        'mail_from_name'  => (string) config('mail.from_name'),
        'mail_from_email' => (string) config('mail.from'),
        'smtp_host'       => '',
        'smtp_port'       => '587',
        'smtp_secure'     => 'tls',
        'smtp_user'       => '',
        'smtp_pass'       => '',
    ];
}

/** Removes line breaks so a value can never inject extra mail headers. */
function mail_clean(string $v): string
{
    return trim(str_replace(["\r", "\n", "\0"], ' ', $v));
}

/** Sends one plain-text email. Returns false and fills $error with the reason when it fails. */
function send_mail(string $to, string $subject, string $body, ?string &$error = null): bool
{
    if (config('app.debug')) {
        $entry = sprintf("[%s] To: %s\nSubject: %s\n%s\n%s\n", date('c'), $to, $subject, $body, str_repeat('-', 60));
        @file_put_contents(__DIR__ . '/../storage/mail.log', $entry, FILE_APPEND);
    }

    $m  = mail_settings();
    $to = mail_clean($to);
    $subject = mail_clean($subject);
    $fromEmail = mail_clean((string) $m['mail_from_email']);
    $fromName  = mail_clean((string) $m['mail_from_name']);

    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $error = 'The recipient address is not valid.';
        return false;
    }
    if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
        $error = 'Set a valid "From" email address in Email Settings first.';
        return false;
    }

    try {
        return smtp_send($m, $fromEmail, $fromName, $to, $subject, $body, $error);
    } catch (Throwable $e) {
        $error = $e->getMessage();
        return false;
    }
}

// ---- SMTP ---------------------------------------------------------------------

function smtp_send(array $m, string $fromEmail, string $fromName, string $to, string $subject, string $body, ?string &$error): bool
{
    $host   = trim((string) $m['smtp_host']);
    $port   = (int) $m['smtp_port'];
    $secure = (string) $m['smtp_secure'];     // tls (STARTTLS) | ssl (implicit) | none
    $user   = (string) $m['smtp_user'];
    $pass   = (string) $m['smtp_pass'];

    if ($host === '' || $port < 1) {
        $error = 'Enter the SMTP host and port in Email Settings.';
        return false;
    }

    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]);
    $fp = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        $error = "Could not connect to $host:$port ($errstr).";
        return false;
    }
    stream_set_timeout($fp, 15);

    $read = static function () use ($fp): string {
        $data = '';
        while (($line = fgets($fp, 1024)) !== false) {
            $data .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };
    $cmd = static function (string $line) use ($fp, $read): string {
        fwrite($fp, $line . "\r\n");
        return $read();
    };
    $fail = static function (string $step, string $response) use (&$error, $fp): bool {
        $error = "SMTP $step failed: " . trim(preg_replace('/\s+/', ' ', $response));
        @fwrite($fp, "QUIT\r\n");
        @fclose($fp);
        return false;
    };
    $code = static fn(string $r): int => (int) substr($r, 0, 3);

    $r = $read();
    if ($code($r) !== 220) return $fail('connection', $r);

    $hello = 'ogcreations.local';
    $r = $cmd("EHLO $hello");
    if ($code($r) !== 250) return $fail('greeting', $r);

    if ($secure === 'tls') {
        $r = $cmd('STARTTLS');
        if ($code($r) !== 220) return $fail('STARTTLS', $r);
        if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            return $fail('secure connection', 'could not start TLS (certificate not trusted by this server?)');
        }
        $r = $cmd("EHLO $hello");
        if ($code($r) !== 250) return $fail('greeting', $r);
    }

    if ($user !== '') {
        $r = $cmd('AUTH LOGIN');
        if ($code($r) !== 334) return $fail('login', $r);
        $r = $cmd(base64_encode($user));
        if ($code($r) !== 334) return $fail('username', $r);
        $r = $cmd(base64_encode($pass));
        if ($code($r) !== 235) return $fail('password (check the app password)', $r);
    }

    $r = $cmd("MAIL FROM:<$fromEmail>");
    if ($code($r) !== 250) return $fail('sender address', $r);
    $r = $cmd("RCPT TO:<$to>");
    if (!in_array($code($r), [250, 251], true)) return $fail('recipient address', $r);
    $r = $cmd('DATA');
    if ($code($r) !== 354) return $fail('message start', $r);

    $domain = substr(strrchr($fromEmail, '@') ?: '@localhost', 1);
    $headers = [
        'Date: ' . date('r'),
        'From: ' . ($fromName !== '' ? '=?UTF-8?B?' . base64_encode($fromName) . '?= ' : '') . "<$fromEmail>",
        "To: <$to>",
        'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
        'Message-ID: <' . bin2hex(random_bytes(8)) . "@$domain>",
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    $message = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");
    fwrite($fp, $message . "\r\n.\r\n");
    $r = $read();
    if ($code($r) !== 250) return $fail('sending the message', $r);

    @fwrite($fp, "QUIT\r\n");
    @fclose($fp);
    return true;
}
