<?php

// entities/FormaPagamento.php
// Forma de pagamento aceita.
// front usa: idFormaPagamento, descricao

class FormaPagamento
{
    public int    $idFormaPagamento;
    public string $descricao;

    public function __construct(array $dados)
    {
        $this->idFormaPagamento = (int) ($dados['id'] ?? $dados['idFormaPagamento']);
        $this->descricao        =       $dados['descricao'];
    }

    public function toArray(): array
    {
        return [
            'idFormaPagamento' => $this->idFormaPagamento,
            'descricao'        => $this->descricao,
        ];
    }
}
