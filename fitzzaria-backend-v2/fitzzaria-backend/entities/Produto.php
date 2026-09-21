<?php

// entities/Produto.php
// Representa um produto do cardápio (pizza fit, vegana ou low carb).
// O método toArray() devolve os nomes de campo EXATOS que o front espera.

require_once __DIR__ . '/TamanhoProduto.php';
require_once __DIR__ . '/OpcaoPersonalizacao.php';

class Produto
{
    public int     $idProduto;
    public string  $nome;
    public string  $descricao;
    public string  $categoria;   // 'Fit' | 'Vegana' | 'Low Carb'
    public float   $precoBase;
    public ?string $imagem;
    public bool    $disponivel;
    public bool    $personalizavel;

    /** @var OpcaoPersonalizacao[] */
    public array $opcoes   = [];

    /** @var TamanhoProduto[] */
    public array $tamanhos = [];

    public function __construct(array $dados)
    {
        // aceita tanto colunas do banco (id, preco_base...) quanto já mapeadas
        $this->idProduto      = (int)   ($dados['id']             ?? $dados['idProduto']);
        $this->nome           =         $dados['nome'];
        $this->descricao      =         $dados['descricao']      ?? '';
        $this->categoria      =         $dados['categoria'];
        $this->precoBase      = (float) ($dados['preco_base']     ?? $dados['precoBase']);
        $this->imagem         =         $dados['imagem']         ?? null;
        $this->disponivel     = (bool)  ($dados['disponivel']     ?? true);
        $this->personalizavel = (bool)  ($dados['personalizavel'] ?? true);
    }

    /**
     * Calcula o preço personalizado: base + adicional do tamanho + opções.
     *
     * @param TamanhoProduto|null   $tamanho
     * @param OpcaoPersonalizacao[] $opcoesSelecionadas
     */
    public function calcularPrecoPersonalizado(
        ?TamanhoProduto $tamanho,
        array $opcoesSelecionadas
    ): float {
        $preco = $this->precoBase;

        if ($tamanho !== null) {
            $preco += $tamanho->adicionalPreco;
        }

        foreach ($opcoesSelecionadas as $opcao) {
            $preco += $opcao->valorAdicional;
        }

        return round($preco, 2);
    }

    /**
     * Serializa no formato que o front espera (data.js).
     */
    public function toArray(): array
    {
        return [
            'idProduto'      => $this->idProduto,
            'categoria'      => $this->categoria,
            'nome'           => $this->nome,
            'descricao'      => $this->descricao,
            'precoBase'      => $this->precoBase,
            'disponivel'     => $this->disponivel,
            'personalizavel' => $this->personalizavel,
            'imagem'         => $this->imagem,
            'tamanhos'       => $this->tamanhos === [] ? [] : array_map(
                fn(TamanhoProduto $t) => $t->nome, $this->tamanhos
            ),
            'opcoesPersonalizacao' => array_map(
                fn(OpcaoPersonalizacao $o) => $o->toArray(), $this->opcoes
            ),
        ];
    }
}
