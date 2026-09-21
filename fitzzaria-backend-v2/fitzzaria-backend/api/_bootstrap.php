<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5501',
];
if ($allowedOrigin !== '' && in_array($allowedOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/../services/AuthService.php';

function jsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('JSON inválido.', 400);
    }
    return $data;
}

function jsonResponse($data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function errorResponse(Throwable $e): never
{
    $status = (int)$e->getCode();
    if ($status < 400 || $status > 599) $status = 500;

    $payload = ['erro' => $e->getMessage()];
    if ($status === 500) {
        $payload['erro'] = 'Erro interno do servidor.';
    }
    jsonResponse($payload, $status);
}

function executar(callable $fn): never
{
    try {
        jsonResponse($fn());
    } catch (Throwable $e) {
        errorResponse($e);
    }
}

function exigirMetodo(string $metodo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        jsonResponse(['erro' => 'Método não permitido.'], 405);
    }
}

function exigirLogin(): array
{
    return (new AuthService())->exigirLogin();
}

function requestPathInfo(): string
{
    $path = $_SERVER['PATH_INFO'] ?? '';
    return trim($path, '/');
}
