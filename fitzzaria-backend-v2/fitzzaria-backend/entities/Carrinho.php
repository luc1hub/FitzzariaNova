<?php

// entities/Carrinho.php
// Carrinho completo (transitório — vive na sessão PHP).
// front (carrinho.js) guarda: { itens[], formaRecebimento, idRegiaoEntrega, cep }

require_once __DIR__ . '/ItemCarrinho.php';

class Carrinho
{
    /** @var ItemCarrinho[] */
    public array   $itens = [];
    public ?string $formaRecebimento = null;   // 'ENTREGA' | 'RETIRADA'
    public ?int    $idRegiaoEntrega  = null;
    public ?string $cep              = null;
    public float   $taxaEntrega      = 0.00;

    public function adicionarItem(ItemCarrinho $item): void
    {
        $this->itens[] = $item;
    }

    public function removerItem(int $idItem): void
    {
        $this->itens = array_values(array_filter(
            $this->itens,
            fn(ItemCarrinho $i) => $i->idItem !== $idItem
        ));
    }

    public function calcularSubtotal(): float
    {
        $subtotal = 0.0;
        foreach ($this->itens as $item) {
            $subtotal += $item->calcularSubtotal();
        }
        return round($subtotal, 2);
    }

    public function calcularTotal(): float
    {
        return round($this->calcularSubtotal() + $this->taxaEntrega, 2);
    }

    public function estaVazio(): bool
    {
        return empty($this->itens);
    }

    public function toArray(): array
    {
        return [
            'itens'            => array_map(fn($i) => $i->toArray(), $this->itens),
            'formaRecebimento' => $this->formaRecebimento,
            'idRegiaoEntrega'  => $this->idRegiaoEntrega,
            'cep'              => $this->cep,
        ];
    }
}
