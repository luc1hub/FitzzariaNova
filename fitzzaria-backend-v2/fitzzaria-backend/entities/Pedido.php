<?php

// entities/Pedido.php
// Pedido confirmado, persistido no banco.
// front (pedidos.js) usa:
//   identificador, dataHora, itens[], subtotal, taxaEntrega, valorTotal,
//   formaRecebimento, regiaoEntrega (nome), cep, formaPagamento (texto),
//   statusAtual, previsaoConclusao (ISO), clienteNotificado

require_once __DIR__ . '/ItemPedido.php';

class Pedido
{
    // Status possíveis (espelham o ENUM do banco e o FITZZ.statusPedido do front)
    const STATUS_CONFIRMADO           = 'CONFIRMADO';
    const STATUS_EM_PREPARACAO        = 'EM_PREPARACAO';
    const STATUS_PRONTO_PARA_RETIRADA = 'PRONTO_PARA_RETIRADA';
    const STATUS_SAIU_PARA_ENTREGA    = 'SAIU_PARA_ENTREGA';
    const STATUS_RETIRADO             = 'RETIRADO';
    const STATUS_ENTREGUE             = 'ENTREGUE';
    const STATUS_CANCELADO            = 'CANCELADO';

    // Transições válidas (bloqueia pulos de etapa)
    const TRANSICOES_VALIDAS = [
        self::STATUS_CONFIRMADO           => [self::STATUS_EM_PREPARACAO],
        self::STATUS_EM_PREPARACAO        => [self::STATUS_PRONTO_PARA_RETIRADA, self::STATUS_SAIU_PARA_ENTREGA],
        self::STATUS_PRONTO_PARA_RETIRADA => [self::STATUS_RETIRADO],
        self::STATUS_SAIU_PARA_ENTREGA    => [self::STATUS_ENTREGUE],
        self::STATUS_RETIRADO             => [],
        self::STATUS_ENTREGUE             => [],
        self::STATUS_CANCELADO            => [],
    ];

    public string  $identificador;    // 'FTZ428193'
    public string  $dataHora;         // ISO
    public string  $formaRecebimento; // 'ENTREGA' | 'RETIRADA'
    public ?string $cep;
    public ?int    $regiaoEntregaId;
    public ?string $regiaoEntregaNome;
    public float   $taxaEntrega;
    public ?string $enderecoEntrega;
    public ?int    $formaPagamentoId;
    public ?string $formaPagamento;   // texto (descricao)
    public ?string $clienteNome;
    public ?string $clienteTelefone;
    public string  $statusAtual;
    public ?string $previsaoConclusao; // ISO ou null
    public bool    $clienteNotificado;
    public float   $subtotal;
    public float   $valorTotal;

    /** @var ItemPedido[] */
    public array $itens = [];

    public function __construct(array $dados)
    {
        $this->identificador     =         $dados['identificador'];
        $this->dataHora          =         $dados['data_hora']          ?? $dados['dataHora'] ?? date('c');
        $this->formaRecebimento  =         $dados['forma_recebimento']  ?? $dados['formaRecebimento'];
        $this->cep               =         $dados['cep']                ?? null;
        $this->regiaoEntregaId   = isset($dados['regiao_entrega_id'])    ? (int) $dados['regiao_entrega_id'] : null;
        $this->regiaoEntregaNome =         $dados['regiaoEntrega']       ?? null;
        $this->taxaEntrega       = (float) ($dados['taxa_entrega']       ?? $dados['taxaEntrega'] ?? 0);
        $this->enderecoEntrega   =         $dados['endereco_entrega']    ?? null;
        $this->formaPagamentoId  = isset($dados['forma_pagamento_id'])   ? (int) $dados['forma_pagamento_id'] : null;
        $this->formaPagamento    =         $dados['formaPagamento']      ?? null;
        $this->clienteNome       =         $dados['cliente_nome']        ?? null;
        $this->clienteTelefone   =         $dados['cliente_telefone']    ?? null;
        $this->statusAtual       =         $dados['status_atual']        ?? $dados['statusAtual'] ?? self::STATUS_CONFIRMADO;
        $this->previsaoConclusao =         $dados['previsao_conclusao']  ?? $dados['previsaoConclusao'] ?? null;
        $this->clienteNotificado = (bool)  ($dados['cliente_notificado'] ?? false);
        $this->subtotal          = (float) ($dados['subtotal']          ?? 0);
        $this->valorTotal        = (float) ($dados['valor_total']        ?? $dados['valorTotal'] ?? 0);
    }

    public function podeTransicionarPara(string $novoStatus): bool
    {
        return in_array($novoStatus, self::TRANSICOES_VALIDAS[$this->statusAtual] ?? [], true);
    }

    /**
     * Serializa no formato que o front espera (igual ao objeto de criarPedido()).
     */
    public function toArray(): array
    {
        return [
            'identificador'     => $this->identificador,
            'dataHora'          => $this->dataHora,
            'itens'             => array_map(fn($i) => $i->toArray(), $this->itens),
            'subtotal'          => $this->subtotal,
            'taxaEntrega'       => $this->taxaEntrega,
            'valorTotal'        => $this->valorTotal,
            'formaRecebimento'  => $this->formaRecebimento,
            'regiaoEntrega'     => $this->regiaoEntregaNome,
            'cep'               => $this->cep,
            'formaPagamento'    => $this->formaPagamento,
            'statusAtual'       => $this->statusAtual,
            'previsaoConclusao' => $this->previsaoConclusao,
            'clienteNotificado' => $this->clienteNotificado,
        ];
    }
}
