<?php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../entities/Produto.php';
require_once __DIR__ . '/../entities/TamanhoProduto.php';
require_once __DIR__ . '/../entities/OpcaoPersonalizacao.php';

// repositories/ProdutoRepository.php
// Leitura de produtos no banco via PDO.

class ProdutoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Lista produtos disponíveis, com filtros opcionais.
     * @param string|null $categoria  'Fit' | 'Vegana' | 'Low Carb' | null
     * @param float|null  $precoMax   preço base máximo
     * @return Produto[]
     */
    public function listarDisponiveis(?string $categoria = null, ?float $precoMax = null): array
    {
        $sql    = "SELECT * FROM produtos WHERE disponivel = 1";
        $params = [];

        if ($categoria !== null) {
            $sql .= " AND categoria = :categoria";
            $params[':categoria'] = $categoria;
        }
        if ($precoMax !== null) {
            $sql .= " AND preco_base <= :preco_max";
            $params[':preco_max'] = $precoMax;
        }
        $sql .= " ORDER BY nome ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $produtos = [];
        foreach ($stmt->fetchAll() as $row) {
            $produto           = new Produto($row);
            $produto->tamanhos = $this->buscarTamanhos($produto->idProduto);
            $produto->opcoes   = $this->buscarOpcoes($produto->idProduto);
            $produtos[]        = $produto;
        }
        return $produtos;
    }

    public function buscarPorId(int $id): ?Produto
    {
        $stmt = $this->db->prepare("SELECT * FROM produtos WHERE id = :id AND disponivel = 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $produto           = new Produto($row);
        $produto->tamanhos = $this->buscarTamanhos($id);
        $produto->opcoes   = $this->buscarOpcoes($id);
        return $produto;
    }

    /** @return TamanhoProduto[] */
    public function buscarTamanhos(int $produtoId): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM tamanhos_produto WHERE produto_id = :pid ORDER BY adicional_preco ASC"
        );
        $stmt->execute([':pid' => $produtoId]);
        return array_map(fn($r) => new TamanhoProduto($r), $stmt->fetchAll());
    }

    /** @return OpcaoPersonalizacao[] */
    public function buscarOpcoes(int $produtoId): array
    {
        $stmt = $this->db->prepare("
            SELECT op.*
            FROM opcoes_personalizacao op
            INNER JOIN produto_opcoes po ON po.opcao_id = op.id
            WHERE po.produto_id = :pid
            ORDER BY op.nome ASC
        ");
        $stmt->execute([':pid' => $produtoId]);
        return array_map(fn($r) => new OpcaoPersonalizacao($r), $stmt->fetchAll());
    }

    public function buscarOpcaoPorId(int $id): ?OpcaoPersonalizacao
    {
        $stmt = $this->db->prepare("SELECT * FROM opcoes_personalizacao WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ? new OpcaoPersonalizacao($row) : null;
    }

    public function buscarTamanhoPorId(int $id): ?TamanhoProduto
    {
        $stmt = $this->db->prepare("SELECT * FROM tamanhos_produto WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ? new TamanhoProduto($row) : null;
    }

    /**
     * Busca o tamanho de um produto pelo nome ('Média'/'Grande').
     * Útil porque o front manda o tamanho como texto, não como id.
     */
    public function buscarTamanhoPorNome(int $produtoId, string $nome): ?TamanhoProduto
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM tamanhos_produto WHERE produto_id = :pid AND nome = :nome"
        );
        $stmt->execute([':pid' => $produtoId, ':nome' => $nome]);
        $row = $stmt->fetch();
        return $row ? new TamanhoProduto($row) : null;
    }
}
