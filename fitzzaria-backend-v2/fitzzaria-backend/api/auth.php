<?php
require_once __DIR__ . '/_bootstrap.php';

executar(function () {
    $service = new AuthService();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = jsonBody();
        $email = trim((string)($body['email'] ?? ''));
        $senha = (string)($body['senha'] ?? '');

        if ($email === '' || $senha === '') {
            throw new RuntimeException('Informe e-mail e senha.', 422);
        }

        return [
            'autenticado' => true,
            'funcionario' => $service->login($email, $senha),
        ];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $usuario = $service->usuarioAtual();
        if ($usuario === null) {
            jsonResponse(['autenticado' => false], 401);
        }
        return ['autenticado' => true, 'funcionario' => $usuario];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $service->logout();
        return ['mensagem' => 'Logout realizado com sucesso.'];
    }

    jsonResponse(['erro' => 'Método não permitido.'], 405);
});
