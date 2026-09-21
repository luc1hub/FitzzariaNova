<?php

// entities/Pagamento.php
// Pagamento de um pedido. pedidoId é o identificador (FTZ...).
// processar() aprova sempre (decisão do grupo: não é foco da disciplina).

class Pagamento
{
    const STATUS_PENDENTE = 'PENDENTE';
    const STATUS_APROVADO = 'APROVADO';
    const STATUS_RECUSADO = 'RECUSADO';

    public int     $id;
    public string  $pedidoId;
    public int     $formaPagamentoId;
    public float   $valor;
    public string  $status;
    public ?string $processadoEm;

    public function __construct(array $dados)
    {
        $this->id               = (int)   ($dados['id'] ?? 0);
        $this->pedidoId         =         $dados['pedido_id'];
        $this->formaPagamentoId = (int)   $dados['forma_pagamento_id'];
        $this->valor            = (float) $dados['valor'];
        $this->status           =         $dados['status'] ?? self::STATUS_PENDENTE;
        $this->processadoEm     =         $dados['processado_em'] ?? null;
    }

    public function processar(): bool
    {
        $this->status       = self::STATUS_APROVADO;
        $this->processadoEm = date('Y-m-d H:i:s');
        return true;
    }

    public function foiAprovado(): bool
    {
        return $this->status === self::STATUS_APROVADO;
    }
}
