<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../services/CatalogService.php';

executar(function () {
    exigirMetodo('GET');
    $service = new CatalogService();

    if (isset($_GET['cep'])) {
        return $service->buscarRegiaoPorCep((string)$_GET['cep']);
    }
    return $service->listarRegioes();
});
