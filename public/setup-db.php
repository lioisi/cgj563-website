<?php
/**
 * Setup endpoint disabled in production by security policy.
 * Use controlled SQL migrations from a private environment.
 */

http_response_code(403);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'error' => 'Forbidden',
    'message' => 'Database setup via public HTTP is disabled.'
]);
