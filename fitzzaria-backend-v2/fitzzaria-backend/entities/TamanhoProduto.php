<?php

// entities/TamanhoProduto.php
// Tamanho disponível para um produto (Média ou Grande) e seu adicional de preço.

class TamanhoProduto
{
    public int    $id;
    public int    $produtoId;
    public string $nome;          // 'Média' | 'Grande'
    public float  $adicionalPreco;

    public function __construct(array $dados)
    {
        $this->id             = (int)   $dados['id'];
        $this->produtoId      = (int)   $dados['produto_id'];
        $this->nome           =         $dados['nome'];
        $this->adicionalPreco = (float) $dados['adicional_preco'];
    }
}
