<?php

// entities/ItemPedido.php
// Item persistido dentro de um pedido confirmado.
// Serializa igual ao item do carrinho no front:
//   idProduto, nome, tamanho, quantidade, precoUnitario, opcoes[]

require_once __DIR__ . '/OpcaoPersonalizacao.php';

class ItemPedido
{
    public int     $id;
    public string  $pedidoId;        // identificador do pedido (FTZ...)
    public int     $idProduto;
    public string  $nome;            // snapshot do nome do produto
    public ?string $tamanho;
    public int     $quantidade;
    public float   $precoUnitario;   // snapshot
    public float   $subtotal;

    /** @var OpcaoPersonalizacao[] */
    public array   $opcoes = [];

    public function __construct(array $dados)
    {
        $this->id            = (int)   ($dados['id'] ?? 0);
        $this->pedidoId      =         ($dados['pedido_id'] ?? '');
        $this->idProduto     = (int)   ($dados['produto_id'] ?? $dados['idProduto']);
        $this->nome          =         ($dados['produto_nome'] ?? $dados['nome']);
        $this->tamanho       =         $dados['tamanho'] ?? null;
        $this->quantidade    = (int)   $dados['quantidade'];
        $this->precoUnitario = (float) ($dados['preco_unitario'] ?? $dados['precoUnitario']);
        $this->subtotal      = (float) ($dados['subtotal'] ?? ($this->precoUnitario * $this->quantidade));
    }

    public function toArray(): array
    {
        return [
            'idProduto'     => $this->idProduto,
            'nome'          => $this->nome,
            'tamanho'       => $this->tamanho,
            'quantidade'    => $this->quantidade,
            'precoUnitario' => $this->precoUnitario,
            'opcoes'        => array_map(fn($o) => $o->toArray(), $this->opcoes),
        ];
    }
}
