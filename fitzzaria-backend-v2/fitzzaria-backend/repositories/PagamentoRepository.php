<?php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../entities/Pagamento.php';

// repositories/PagamentoRepository.php
// Persistência de pagamentos via PDO. pedido_id é o identificador (FTZ...).

class PagamentoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function salvar(Pagamento $pagamento): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO pagamentos (pedido_id, forma_pagamento_id, valor, status, processado_em)
            VALUES (:pedido_id, :forma_pagamento_id, :valor, :status, :processado_em)
        ");
        $stmt->execute([
            ':pedido_id'          => $pagamento->pedidoId,
            ':forma_pagamento_id' => $pagamento->formaPagamentoId,
            ':valor'              => $pagamento->valor,
            ':status'             => $pagamento->status,
            ':processado_em'      => $pagamento->processadoEm,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function atualizarStatus(int $pagamentoId, string $status, string $processadoEm): void
    {
        $stmt = $this->db->prepare("
            UPDATE pagamentos
            SET status = :status, processado_em = :processado_em
            WHERE id = :id
        ");
        $stmt->execute([
            ':status'        => $status,
            ':processado_em' => $processadoEm,
            ':id'            => $pagamentoId,
        ]);
    }

    public function buscarPorPedidoId(string $pedidoId): ?Pagamento
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM pagamentos WHERE pedido_id = :pid"
        );
        $stmt->execute([':pid' => $pedidoId]);
        $row = $stmt->fetch();
        return $row ? new Pagamento($row) : null;
    }
}
