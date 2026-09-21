<?php

// entities/Estabelecimento.php
// Dados do estabelecimento.
// front usa: nome, abertoParaPedidos, telefone

class Estabelecimento
{
    public int     $id;
    public string  $nome;
    public string  $telefone;
    public string  $endereco;
    public bool    $abertoParaPedidos;

    public function __construct(array $dados)
    {
        $this->id                = (int)  $dados['id'];
        $this->nome              =        $dados['nome'];
        $this->telefone          =        $dados['telefone'];
        $this->endereco          =        $dados['endereco'] ?? '';
        $this->abertoParaPedidos = (bool) ($dados['aberto_para_pedidos'] ?? $dados['abertoParaPedidos']);
    }

    public function toArray(): array
    {
        return [
            'nome'              => $this->nome,
            'abertoParaPedidos' => $this->abertoParaPedidos,
            'telefone'          => $this->telefone,
        ];
    }
}
