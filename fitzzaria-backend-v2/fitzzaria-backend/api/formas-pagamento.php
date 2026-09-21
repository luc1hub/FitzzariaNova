<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../services/CatalogService.php';

executar(function () {
    exigirMetodo('GET');
    return (new CatalogService())->listarFormasPagamento();
});
