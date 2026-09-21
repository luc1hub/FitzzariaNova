<?php

// entities/OpcaoPersonalizacao.php
// Opção de personalização (ex: "Extra Queijo", "Borda Recheada").
// front usa: idOpcao, nome, valorAdicional

class OpcaoPersonalizacao
{
    public int    $idOpcao;
    public string $nome;
    public float  $valorAdicional;

    public function __construct(array $dados)
    {
        $this->idOpcao        = (int)   ($dados['id'] ?? $dados['idOpcao']);
        $this->nome           =         $dados['nome'];
        $this->valorAdicional = (float) ($dados['valor_adicional'] ?? $dados['valorAdicional']);
    }

    public function toArray(): array
    {
        return [
            'idOpcao'        => $this->idOpcao,
            'nome'           => $this->nome,
            'valorAdicional' => $this->valorAdicional,
        ];
    }
}
