<?php
// teste.php
// Arquivo para testar se o banco, as entidades e os repositories estão funcionando.
// COMO USAR:
//   1. Coloque a pasta fitzzaria-backend dentro de C:\xampp\htdocs (Win)
//      ou /Applications/XAMPP/htdocs (Mac)
//   2. Ligue Apache + MySQL no XAMPP
//   3. Importe o fitzzaria_banco.sql no phpMyAdmin
//   4. Abra no navegador: http://localhost/fitzzaria-backend/teste.php
//
// Se aparecer os produtos, regiões e formas de pagamento em JSON, está tudo OK!

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/repositories/ProdutoRepository.php';
require_once __DIR__ . '/repositories/PedidoRepository.php';
require_once __DIR__ . '/entities/RegiaoEntrega.php';
require_once __DIR__ . '/entities/FormaPagamento.php';
require_once __DIR__ . '/entities/Estabelecimento.php';

echo "<html><head><meta charset='utf-8'><title>Teste Fitzzaria</title>";
echo "<style>
  body{font-family:system-ui,Arial;background:#1e1e1e;color:#ddd;padding:24px;line-height:1.5}
  h2{color:#4ec9b0;border-bottom:1px solid #333;padding-bottom:6px;margin-top:32px}
  .ok{color:#6a9955;font-weight:bold}
  .erro{color:#f14c4c;font-weight:bold}
  pre{background:#252526;padding:14px;border-radius:8px;overflow-x:auto;border:1px solid #333}
</style></head><body>";
echo "<h1>🍕 Teste do back-end Fitzzaria</h1>";

// ── Teste 1: Conexão ──────────────────────────────────────────
echo "<h2>1. Conexão com o banco</h2>";
try {
    $db = Database::getConnection();
    echo "<p class='ok'>✔ Conectou no banco com sucesso!</p>";
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro ao conectar: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Confira usuário/senha em config/Database.php e se o MySQL está ligado no XAMPP.</p>";
    exit;
}

// ── Teste 2: Produtos ─────────────────────────────────────────
echo "<h2>2. Produtos (ProdutoRepository->listarDisponiveis)</h2>";
try {
    $repo = new ProdutoRepository();
    $produtos = $repo->listarDisponiveis();
    echo "<p class='ok'>✔ " . count($produtos) . " produtos encontrados.</p>";
    $saida = array_map(fn($p) => $p->toArray(), $produtos);
    echo "<pre>" . htmlspecialchars(json_encode($saida, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// ── Teste 3: Filtro por categoria ─────────────────────────────
echo "<h2>3. Filtro por categoria = 'Fit'</h2>";
try {
    $repo = new ProdutoRepository();
    $fit = $repo->listarDisponiveis('Fit');
    echo "<p class='ok'>✔ " . count($fit) . " produtos Fit.</p>";
    echo "<pre>" . htmlspecialchars(implode(", ", array_map(fn($p) => $p->nome, $fit))) . "</pre>";
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// ── Teste 4: Produto por ID com tamanhos e opções ─────────────
echo "<h2>4. Produto id=1 com tamanhos e opções</h2>";
try {
    $repo = new ProdutoRepository();
    $p = $repo->buscarPorId(1);
    if ($p) {
        echo "<p class='ok'>✔ Produto: {$p->nome}</p>";
        echo "<pre>" . htmlspecialchars(json_encode($p->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
    } else {
        echo "<p class='erro'>✗ Produto id=1 não encontrado.</p>";
    }
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// ── Teste 5: Cálculo de preço personalizado ───────────────────
echo "<h2>5. Cálculo de preço (base + Grande + Extra Queijo)</h2>";
try {
    $repo = new ProdutoRepository();
    $p = $repo->buscarPorId(1);
    $grande = $repo->buscarTamanhoPorNome(1, 'Grande');
    $extraQueijo = $repo->buscarOpcaoPorId(1); // Extra Queijo
    if ($p && $grande && $extraQueijo) {
        $preco = $p->calcularPrecoPersonalizado($grande, [$extraQueijo]);
        echo "<p class='ok'>✔ {$p->nome} (base R$ {$p->precoBase}) + Grande (R$ {$grande->adicionalPreco}) + Extra Queijo (R$ {$extraQueijo->valorAdicional}) = <b>R$ {$preco}</b></p>";
    } else {
        echo "<p class='erro'>✗ Faltou produto, tamanho ou opção. Confira se o banco foi importado.</p>";
    }
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// ── Teste 6: Regiões e formas de pagamento ────────────────────
echo "<h2>6. Regiões de entrega e formas de pagamento</h2>";
try {
    $db = Database::getConnection();
    $regioes = $db->query("SELECT * FROM regioes_entrega")->fetchAll();
    $formas   = $db->query("SELECT * FROM formas_pagamento")->fetchAll();
    echo "<p class='ok'>✔ " . count($regioes) . " regiões, " . count($formas) . " formas de pagamento.</p>";
    $reg = array_map(fn($r) => (new RegiaoEntrega($r))->toArray(), $regioes);
    $fp  = array_map(fn($f) => (new FormaPagamento($f))->toArray(), $formas);
    echo "<pre>" . htmlspecialchars(json_encode(['regioes'=>$reg,'formasPagamento'=>$fp], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
} catch (Throwable $e) {
    echo "<p class='erro'>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<h2>✅ Fim dos testes</h2>";
echo "<p>Se todos os itens acima estão verdes, sua parte (banco + entidades + repositories) está funcionando!</p>";
echo "</body></html>";
