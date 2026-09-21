<?php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../entities/Pedido.php';
require_once __DIR__ . '/../entities/ItemPedido.php';
require_once __DIR__ . '/../entities/OpcaoPersonalizacao.php';

// repositories/PedidoRepository.php
// Persistência e leitura de pedidos via PDO.
// Trabalha com identificador (FTZxxxxxx) como chave.

class PedidoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function buscarPorId(string $identificador): ?Pedido
    {
        // JOIN para trazer o nome da região e a descrição da forma de pagamento
        // já prontos (o front espera 'regiaoEntrega' e 'formaPagamento' como texto)
        $stmt = $this->db->prepare("
            SELECT p.*,
                   r.nome      AS regiaoEntrega,
                   f.descricao AS formaPagamento
            FROM pedidos p
            LEFT JOIN regioes_entrega  r ON r.id = p.regiao_entrega_id
            LEFT JOIN formas_pagamento f ON f.id = p.forma_pagamento_id
            WHERE p.identificador = :id
        ");
        $stmt->execute([':id' => $identificador]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $pedido        = new Pedido($row);
        $pedido->itens = $this->buscarItensDoPedido($identificador);
        return $pedido;
    }

    /** @return Pedido[] */
    public function listarPorStatus(string $status): array
    {
        $stmt = $this->db->prepare("
            SELECT p.*,
                   r.nome      AS regiaoEntrega,
                   f.descricao AS formaPagamento
            FROM pedidos p
            LEFT JOIN regioes_entrega  r ON r.id = p.regiao_entrega_id
            LEFT JOIN formas_pagamento f ON f.id = p.forma_pagamento_id
            WHERE p.status_atual = :status
            ORDER BY p.data_hora ASC
        ");
        $stmt->execute([':status' => $status]);

        $pedidos = [];
        foreach ($stmt->fetchAll() as $row) {
            $pedido        = new Pedido($row);
            $pedido->itens = $this->buscarItensDoPedido($pedido->identificador);
            $pedidos[]     = $pedido;
        }
        return $pedidos;
    }

    /**
     * Verifica se um identificador já existe (para garantir unicidade do FTZ...).
     */
    public function identificadorExiste(string $identificador): bool
    {
        $stmt = $this->db->prepare(
            "SELECT 1 FROM pedidos WHERE identificador = :id LIMIT 1"
        );
        $stmt->execute([':id' => $identificador]);
        return (bool) $stmt->fetch();
    }

    /**
     * Salva o cabeçalho do pedido.
     */
    public function salvar(Pedido $pedido): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO pedidos
                (identificador, forma_recebimento, cep, regiao_entrega_id, taxa_entrega,
                 endereco_entrega, forma_pagamento_id, cliente_nome, cliente_telefone,
                 status_atual, subtotal, valor_total)
            VALUES
                (:identificador, :forma_recebimento, :cep, :regiao_entrega_id, :taxa_entrega,
                 :endereco_entrega, :forma_pagamento_id, :cliente_nome, :cliente_telefone,
                 :status_atual, :subtotal, :valor_total)
        ");
        $stmt->execute([
            ':identificador'      => $pedido->identificador,
            ':forma_recebimento'  => $pedido->formaRecebimento,
            ':cep'                => $pedido->cep,
            ':regiao_entrega_id'  => $pedido->regiaoEntregaId,
            ':taxa_entrega'       => $pedido->taxaEntrega,
            ':endereco_entrega'   => $pedido->enderecoEntrega,
            ':forma_pagamento_id' => $pedido->formaPagamentoId,
            ':cliente_nome'       => $pedido->clienteNome,
            ':cliente_telefone'   => $pedido->clienteTelefone,
            ':status_atual'       => Pedido::STATUS_CONFIRMADO,
            ':subtotal'           => $pedido->subtotal,
            ':valor_total'        => $pedido->valorTotal,
        ]);
    }

    /**
     * Salva um item do pedido e retorna o id gerado.
     */
    public function salvarItem(ItemPedido $item): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO itens_pedido
                (pedido_id, produto_id, produto_nome, tamanho, quantidade, preco_unitario, subtotal)
            VALUES
                (:pedido_id, :produto_id, :produto_nome, :tamanho, :quantidade, :preco_unitario, :subtotal)
        ");
        $stmt->execute([
            ':pedido_id'      => $item->pedidoId,
            ':produto_id'     => $item->idProduto,
            ':produto_nome'   => $item->nome,
            ':tamanho'        => $item->tamanho,
            ':quantidade'     => $item->quantidade,
            ':preco_unitario' => $item->precoUnitario,
            ':subtotal'       => $item->subtotal,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function salvarOpcaoDoItem(int $itemPedidoId, OpcaoPersonalizacao $opcao): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO item_pedido_opcoes (item_pedido_id, opcao_id, opcao_nome, valor_adicional)
            VALUES (:item_id, :opcao_id, :opcao_nome, :valor)
        ");
        $stmt->execute([
            ':item_id'    => $itemPedidoId,
            ':opcao_id'   => $opcao->idOpcao,
            ':opcao_nome' => $opcao->nome,
            ':valor'      => $opcao->valorAdicional,
        ]);
    }

    public function atualizarStatus(string $identificador, string $novoStatus): void
    {
        $stmt = $this->db->prepare(
            "UPDATE pedidos SET status_atual = :status WHERE identificador = :id"
        );
        $stmt->execute([':status' => $novoStatus, ':id' => $identificador]);
    }

    /**
     * Define a previsão de conclusão (data/hora) — usado no "aceitar pedido".
     */
    public function definirPrevisao(string $identificador, string $previsaoIso): void
    {
        $stmt = $this->db->prepare(
            "UPDATE pedidos SET previsao_conclusao = :previsao WHERE identificador = :id"
        );
        $stmt->execute([':previsao' => $previsaoIso, ':id' => $identificador]);
    }

    public function marcarClienteNotificado(string $identificador): void
    {
        $stmt = $this->db->prepare(
            "UPDATE pedidos SET cliente_notificado = 1 WHERE identificador = :id"
        );
        $stmt->execute([':id' => $identificador]);
    }

    /** @return ItemPedido[] */
    private function buscarItensDoPedido(string $identificador): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM itens_pedido WHERE pedido_id = :id"
        );
        $stmt->execute([':id' => $identificador]);

        $itens = [];
        foreach ($stmt->fetchAll() as $row) {
            $item         = new ItemPedido($row);
            $item->opcoes = $this->buscarOpcoesDoItem($item->id);
            $itens[]      = $item;
        }
        return $itens;
    }

    /** @return OpcaoPersonalizacao[] */
    private function buscarOpcoesDoItem(int $itemPedidoId): array
    {
        $stmt = $this->db->prepare(
            "SELECT opcao_id AS id, opcao_nome AS nome, valor_adicional
             FROM item_pedido_opcoes WHERE item_pedido_id = :id"
        );
        $stmt->execute([':id' => $itemPedidoId]);
        return array_map(fn($r) => new OpcaoPersonalizacao($r), $stmt->fetchAll());
    }
}
