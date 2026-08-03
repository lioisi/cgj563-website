<?php
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload']);
    exit;
}

$botcheck = trim((string)($data['botcheck'] ?? ''));
if ($botcheck !== '') {
    echo json_encode(['success' => true]);
    exit;
}

$name = trim((string)($data['name'] ?? ''));
$company = trim((string)($data['company'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$subject = trim((string)($data['subject'] ?? 'Solicitud de contacto desde cgj563.com'));

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email']);
    exit;
}

$to = 'info@cgj563.com';
$safeSubject = substr($subject, 0, 180);
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

$body = "Nuevo contacto desde cgj563.com\n\n"
    . "Nombre: $name\n"
    . "Empresa: $company\n"
    . "Email: $email\n"
    . "Telefono: $phone\n"
    . "\nMensaje:\n$message\n\n"
    . "IP: $ip\n"
    . "User-Agent: $ua\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: CGJ563 Web <noreply@cgj563.com>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($safeSubject) . '?=', $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mail delivery failed']);
    exit;
}

echo json_encode(['success' => true]);
