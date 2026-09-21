<?php
require_once __DIR__ . '/../config/Database.php';

class CatalogRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function listarRegioes(): array
    {
        return $this->db->query(
            "SELECT id, nome, taxa_fixa, cep_inicio, cep_fim
             FROM regioes_entrega ORDER BY id"
        )->fetchAll();
    }

    public function buscarRegiaoPorCep(string $cep): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, nome, taxa_fixa, cep_inicio, cep_fim
             FROM regioes_entrega
             WHERE :cep BETWEEN cep_inicio AND cep_fim
             LIMIT 1"
        );
        $stmt->execute([':cep' => $cep]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function listarFormasPagamento(): array
    {
        return $this->db->query(
            "SELECT id, descricao FROM formas_pagamento WHERE ativo = 1 ORDER BY id"
        )->fetchAll();
    }

    public function buscarFormaPagamento(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, descricao FROM formas_pagamento WHERE id = :id AND ativo = 1"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function buscarEstabelecimento(): ?array
    {
        $row = $this->db->query(
            "SELECT nome, telefone, endereco, aberto_para_pedidos
             FROM estabelecimento ORDER BY id LIMIT 1"
        )->fetch();
        return $row ?: null;
    }
}
