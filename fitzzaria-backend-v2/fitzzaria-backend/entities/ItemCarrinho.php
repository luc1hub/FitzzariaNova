<?php

// entities/ItemCarrinho.php
// Item do carrinho (transitório — vive só na sessão PHP).
// front (carrinho.js) usa por item:
//   idItem, idProduto, nome, tamanho, quantidade, precoUnitario, opcoes[]

require_once __DIR__ . '/OpcaoPersonalizacao.php';

class ItemCarrinho
{
    public int    $idItem;
    public int    $idProduto;
    public string $nome;
    public ?string $tamanho;
    public int    $quantidade;
    public float  $precoUnitario;   // calculado no servidor

    /** @var OpcaoPersonalizacao[] */
    public array  $opcoes = [];

    public function __construct(array $dados)
    {
        $this->idItem        = (int)   ($dados['idItem'] ?? 0);
        $this->idProduto     = (int)   $dados['idProduto'];
        $this->nome          =         $dados['nome'];
        $this->tamanho       =         $dados['tamanho'] ?? null;
        $this->quantidade    = (int)   $dados['quantidade'];
        $this->precoUnitario = (float) ($dados['precoUnitario'] ?? 0);
    }

    public function calcularSubtotal(): float
    {
        return round($this->precoUnitario * $this->quantidade, 2);
    }

    public function toArray(): array
    {
        return [
            'idItem'        => $this->idItem,
            'idProduto'     => $this->idProduto,
            'nome'          => $this->nome,
            'tamanho'       => $this->tamanho,
            'quantidade'    => $this->quantidade,
            'precoUnitario' => $this->precoUnitario,
            'opcoes'        => array_map(fn($o) => $o->toArray(), $this->opcoes),
        ];
    }
}
