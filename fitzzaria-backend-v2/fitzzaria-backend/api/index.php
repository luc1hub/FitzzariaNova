<?php
require_once __DIR__ . '/_bootstrap.php';

jsonResponse([
    'nome' => 'Fitzzaria API',
    'versao' => '1.0.0',
    'status' => 'online',
    'endpoints' => [
        'GET /api/produtos.php',
        'GET /api/produtos.php?id=1',
        'GET /api/regioes-entrega.php?cep=11010000',
        'GET /api/formas-pagamento.php',
        'GET /api/estabelecimento.php',
        'POST /api/pedidos.php',
        'GET /api/pedidos.php?id=FTZ123456',
        'GET /api/pedidos.php?status=CONFIRMADO',
        'POST /api/pedidos.php/FTZ123456/aceitar',
        'POST /api/pedidos.php/FTZ123456/iniciar-preparo',
        'POST /api/pedidos.php/FTZ123456/finalizar-preparo',
        'POST /api/pedidos.php/FTZ123456/notificar',
        'POST /api/pedidos.php/FTZ123456/finalizar-atendimento',
        'POST /api/auth.php',
        'GET /api/auth.php',
        'DELETE /api/auth.php',
    ],
]);
