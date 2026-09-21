<?php

// entities/RegiaoEntrega.php
// Região de entrega e sua taxa fixa.
// front usa: idRegiao, nome, taxaFixa

class RegiaoEntrega
{
    public int    $idRegiao;
    public string $nome;
    public string $cepInicio;
    public string $cepFim;
    public float  $taxaFixa;

    public function __construct(array $dados)
    {
        $this->idRegiao  = (int)   ($dados['id'] ?? $dados['idRegiao']);
        $this->nome      =         $dados['nome'];
        $this->cepInicio =         $dados['cep_inicio'] ?? '';
        $this->cepFim    =         $dados['cep_fim']    ?? '';
        $this->taxaFixa  = (float) ($dados['taxa_fixa'] ?? $dados['taxaFixa']);
    }

    public function toArray(): array
    {
        return [
            'idRegiao' => $this->idRegiao,
            'nome'     => $this->nome,
            'taxaFixa' => $this->taxaFixa,
        ];
    }
}
