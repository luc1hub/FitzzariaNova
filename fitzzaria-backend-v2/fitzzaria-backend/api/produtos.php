<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../services/CatalogService.php';

executar(function () {
    exigirMetodo('GET');
    $service = new CatalogService();

    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id !== null && $id > 0) {
        return $service->buscarProduto($id);
    }

    $categoria = isset($_GET['categoria']) ? trim((string)$_GET['categoria']) : null;
    $precoMax = isset($_GET['precoMax']) ? (float)$_GET['precoMax'] : null;
    return $service->listarProdutos($categoria ?: null, $precoMax);
});
