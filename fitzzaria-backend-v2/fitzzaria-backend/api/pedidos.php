<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../services/PedidoService.php';

executar(function () {
    $service = new PedidoService();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'POST' && requestPathInfo() === '') {
        $body = jsonBody();
        return $service->criar($body);
    }

    $id = isset($_GET['id']) ? (string)$_GET['id'] : null;
    $status = isset($_GET['status']) ? (string)$_GET['status'] : null;

    // Suporta também /api/pedidos.php/FTZ123456/acao, quando o Apache
    // disponibilizar PATH_INFO.
    $parts = requestPathInfo() !== '' ? explode('/', requestPathInfo()) : [];
    if ($id === null && isset($parts[0]) && $parts[0] !== '') {
        $id = $parts[0];
    }
    $acao = $parts[1] ?? ($_GET['acao'] ?? null);

    if ($metodo === 'GET') {
        if ($id !== null && $id !== '') {
            return $service->buscar($id);
        }
        return $service->listarPorStatus($status);
    }

    if ($metodo === 'POST') {
        exigirLogin();
        if (!$id || !$acao) {
            throw new RuntimeException('Informe o pedido e a ação.', 422);
        }

        if ($acao === 'aceitar') {
            $body = jsonBody();
            $minutos = isset($body['minutosPrevisao']) ? (int)$body['minutosPrevisao'] : 30;
            return $service->aceitar($id, $minutos);
        }

        return match ($acao) {
            'iniciar-preparo' => $service->iniciarPreparo($id),
            'finalizar-preparo' => $service->finalizarPreparo($id),
            'notificar' => $service->notificar($id),
            'finalizar-atendimento' => $service->finalizarAtendimento($id),
            default => throw new RuntimeException('Ação de pedido inválida.', 404),
        };
    }

    jsonResponse(['erro' => 'Método não permitido.'], 405);
});
