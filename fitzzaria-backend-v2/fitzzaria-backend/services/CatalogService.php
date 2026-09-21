<?php
require_once __DIR__ . '/../repositories/ProdutoRepository.php';
require_once __DIR__ . '/../repositories/CatalogRepository.php';
require_once __DIR__ . '/../entities/RegiaoEntrega.php';
require_once __DIR__ . '/../entities/FormaPagamento.php';
require_once __DIR__ . '/../entities/Estabelecimento.php';

class CatalogService
{
    private ProdutoRepository $produtos;
    private CatalogRepository $catalogo;

    public function __construct()
    {
        $this->produtos = new ProdutoRepository();
        $this->catalogo = new CatalogRepository();
    }

    public function listarProdutos(?string $categoria = null, ?float $precoMax = null): array
    {
        return array_map(
            fn($p) => $p->toArray(),
            $this->produtos->listarDisponiveis($categoria, $precoMax)
        );
    }

    public function buscarProduto(int $id): array
    {
        $produto = $this->produtos->buscarPorId($id);
        if (!$produto) {
            throw new RuntimeException('Produto não encontrado.', 404);
        }
        return $produto->toArray();
    }

    public function listarRegioes(): array
    {
        return array_map(fn($r) => [
            'idRegiao' => (int)$r['id'],
            'nome' => $r['nome'],
            'taxaFixa' => (float)$r['taxa_fixa'],
        ], $this->catalogo->listarRegioes());
    }

    public function buscarRegiaoPorCep(string $cep): array
    {
        $cep = preg_replace('/\D/', '', $cep);
        if (strlen($cep) !== 8) {
            throw new RuntimeException('CEP deve conter 8 dígitos.', 422);
        }

        $regiao = $this->catalogo->buscarRegiaoPorCep($cep);
        if (!$regiao) {
            throw new RuntimeException('CEP fora da área de entrega.', 404);
        }

        return [
            'idRegiao' => (int)$regiao['id'],
            'nome' => $regiao['nome'],
            'taxaFixa' => (float)$regiao['taxa_fixa'],
        ];
    }

    public function listarFormasPagamento(): array
    {
        return array_map(fn($f) => [
            'idFormaPagamento' => (int)$f['id'],
            'descricao' => $f['descricao'],
        ], $this->catalogo->listarFormasPagamento());
    }

    public function estabelecimento(): array
    {
        $e = $this->catalogo->buscarEstabelecimento();
        if (!$e) {
            throw new RuntimeException('Estabelecimento não configurado.', 500);
        }
        return [
            'nome' => $e['nome'],
            'abertoParaPedidos' => (bool)$e['aberto_para_pedidos'],
            'telefone' => $e['telefone'],
        ];
    }
}
