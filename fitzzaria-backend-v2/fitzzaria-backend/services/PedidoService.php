<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../repositories/ProdutoRepository.php';
require_once __DIR__ . '/../repositories/PedidoRepository.php';
require_once __DIR__ . '/../repositories/PagamentoRepository.php';
require_once __DIR__ . '/../repositories/CatalogRepository.php';
require_once __DIR__ . '/../entities/Pedido.php';
require_once __DIR__ . '/../entities/ItemPedido.php';
require_once __DIR__ . '/../entities/Pagamento.php';

class PedidoService
{
    private PDO $db;
    private ProdutoRepository $produtos;
    private PedidoRepository $pedidos;
    private PagamentoRepository $pagamentos;
    private CatalogRepository $catalogo;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->produtos = new ProdutoRepository();
        $this->pedidos = new PedidoRepository();
        $this->pagamentos = new PagamentoRepository();
        $this->catalogo = new CatalogRepository();
    }

    public function criar(array $dados): array
    {
        $formaRecebimento = strtoupper(trim((string)($dados['formaRecebimento'] ?? '')));
        if (!in_array($formaRecebimento, ['ENTREGA', 'RETIRADA'], true)) {
            throw new RuntimeException('formaRecebimento deve ser ENTREGA ou RETIRADA.', 422);
        }

        $formaPagamentoId = (int)($dados['idFormaPagamento'] ?? 0);
        if (!$this->catalogo->buscarFormaPagamento($formaPagamentoId)) {
            throw new RuntimeException('Forma de pagamento inválida.', 422);
        }

        $itens = $dados['itens'] ?? [];
        if (!is_array($itens) || count($itens) === 0) {
            throw new RuntimeException('O pedido deve conter ao menos um item.', 422);
        }

        $regiao = null;
        $cep = null;
        $taxaEntrega = 0.0;

        if ($formaRecebimento === 'ENTREGA') {
            $cep = preg_replace('/\D/', '', (string)($dados['cep'] ?? ''));
            if (strlen($cep) !== 8) {
                throw new RuntimeException('CEP inválido para entrega.', 422);
            }
            $regiao = $this->catalogo->buscarRegiaoPorCep($cep);
            if (!$regiao) {
                throw new RuntimeException('CEP fora da área de entrega.', 422);
            }
            $taxaEntrega = (float)$regiao['taxa_fixa'];
        }

        $itensCalculados = [];
        $subtotal = 0.0;

        foreach ($itens as $index => $item) {
            $produtoId = (int)($item['idProduto'] ?? 0);
            $quantidade = (int)($item['quantidade'] ?? 0);
            $tamanhoNome = trim((string)($item['tamanho'] ?? ''));
            if ($quantidade < 1 || $quantidade > 99) {
                throw new RuntimeException("Quantidade inválida no item " . ($index + 1) . ".", 422);
            }

            $produto = $this->produtos->buscarPorId($produtoId);
            if (!$produto) {
                throw new RuntimeException("Produto {$produtoId} não encontrado/disponível.", 422);
            }

            $tamanho = $this->produtos->buscarTamanhoPorNome($produtoId, $tamanhoNome);
            if (!$tamanho) {
                throw new RuntimeException("Tamanho inválido para o produto {$produto->nome}.", 422);
            }

            $opcoesEntrada = $item['opcoes'] ?? [];
            if (!is_array($opcoesEntrada)) {
                throw new RuntimeException('Opções do item devem ser um array.', 422);
            }

            $opcoes = [];
            $idsVistos = [];
            foreach ($opcoesEntrada as $opcaoEntrada) {
                $opcaoId = (int)($opcaoEntrada['idOpcao'] ?? 0);
                if (isset($idsVistos[$opcaoId])) {
                    throw new RuntimeException('Opção repetida no mesmo item.', 422);
                }
                $idsVistos[$opcaoId] = true;

                $opcao = $this->produtos->buscarOpcaoPorId($opcaoId);
                if (!$opcao) {
                    throw new RuntimeException("Opção {$opcaoId} não encontrada.", 422);
                }

                $permitida = false;
                foreach ($produto->opcoes as $opcaoProduto) {
                    if ($opcaoProduto->idOpcao === $opcaoId) {
                        $permitida = true;
                        break;
                    }
                }
                if (!$permitida) {
                    throw new RuntimeException("Opção '{$opcao->nome}' não está disponível para {$produto->nome}.", 422);
                }
                $opcoes[] = $opcao;
            }

            $precoUnitario = $produto->calcularPrecoPersonalizado($tamanho, $opcoes);
            $subtotalItem = round($precoUnitario * $quantidade, 2);
            $subtotal += $subtotalItem;

            $itensCalculados[] = [
                'produto' => $produto,
                'tamanho' => $tamanho,
                'opcoes' => $opcoes,
                'quantidade' => $quantidade,
                'precoUnitario' => $precoUnitario,
                'subtotal' => $subtotalItem,
            ];
        }

        $subtotal = round($subtotal, 2);
        $valorTotal = round($subtotal + $taxaEntrega, 2);
        $identificador = $this->gerarIdentificadorUnico();

        $pedido = new Pedido([
            'identificador' => $identificador,
            'forma_recebimento' => $formaRecebimento,
            'cep' => $cep,
            'regiao_entrega_id' => $regiao ? (int)$regiao['id'] : null,
            'regiaoEntrega' => $regiao['nome'] ?? null,
            'taxa_entrega' => $taxaEntrega,
            'endereco_entrega' => $dados['enderecoEntrega'] ?? null,
            'forma_pagamento_id' => $formaPagamentoId,
            'formaPagamento' => $this->catalogo->buscarFormaPagamento($formaPagamentoId)['descricao'],
            'cliente_nome' => $dados['clienteNome'] ?? null,
            'cliente_telefone' => $dados['clienteTelefone'] ?? null,
            'status_atual' => Pedido::STATUS_CONFIRMADO,
            'subtotal' => $subtotal,
            'valor_total' => $valorTotal,
        ]);

        try {
            $this->db->beginTransaction();
            $this->pedidos->salvar($pedido);

            foreach ($itensCalculados as $itemCalc) {
                $itemPedido = new ItemPedido([
                    'pedido_id' => $identificador,
                    'produto_id' => $itemCalc['produto']->idProduto,
                    'produto_nome' => $itemCalc['produto']->nome,
                    'tamanho' => $itemCalc['tamanho']->nome,
                    'quantidade' => $itemCalc['quantidade'],
                    'preco_unitario' => $itemCalc['precoUnitario'],
                    'subtotal' => $itemCalc['subtotal'],
                ]);
                $itemId = $this->pedidos->salvarItem($itemPedido);
                foreach ($itemCalc['opcoes'] as $opcao) {
                    $this->pedidos->salvarOpcaoDoItem($itemId, $opcao);
                }
            }

            $pagamento = new Pagamento([
                'pedido_id' => $identificador,
                'forma_pagamento_id' => $formaPagamentoId,
                'valor' => $valorTotal,
                'status' => Pagamento::STATUS_PENDENTE,
            ]);
            $pagamento->processar(); // pagamento simulado do projeto
            $this->pagamentos->salvar($pagamento);

            $this->db->commit();
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }

        $criado = $this->pedidos->buscarPorId($identificador);
        return $criado->toArray();
    }

    public function buscar(string $identificador): array
    {
        $identificador = strtoupper(trim($identificador));
        $pedido = $this->pedidos->buscarPorId($identificador);
        if (!$pedido) {
            throw new RuntimeException('Pedido não encontrado.', 404);
        }
        return $pedido->toArray();
    }

    public function listarPorStatus(?string $status = null): array
    {
        if ($status === null || $status === '') {
            throw new RuntimeException('Informe o status.', 422);
        }
        $status = strtoupper(trim($status));
        if (!array_key_exists($status, Pedido::TRANSICOES_VALIDAS)) {
            throw new RuntimeException('Status inválido.', 422);
        }
        return array_map(
            fn($p) => $p->toArray(),
            $this->pedidos->listarPorStatus($status)
        );
    }

    public function aceitar(string $id, int $minutos): array
    {
        if ($minutos < 1 || $minutos > 1440) {
            throw new RuntimeException('Previsão deve estar entre 1 e 1440 minutos.', 422);
        }
        return $this->alterarComPrevisao($id, $minutos);
    }

    private function alterarComPrevisao(string $id, int $minutos): array
    {
        $pedido = $this->pedidos->buscarPorId($id);
        if (!$pedido) throw new RuntimeException('Pedido não encontrado.', 404);
        if ($pedido->statusAtual !== Pedido::STATUS_CONFIRMADO) {
            throw new RuntimeException('Só é possível aceitar pedidos confirmados.', 409);
        }

        $previsao = date('Y-m-d H:i:s', time() + ($minutos * 60));
        $this->pedidos->definirPrevisao($id, $previsao);
        return $this->buscar($id);
    }

    public function iniciarPreparo(string $id): array
    {
        return $this->transicionar($id, Pedido::STATUS_EM_PREPARACAO);
    }

    public function finalizarPreparo(string $id): array
    {
        $pedido = $this->pedidos->buscarPorId($id);
        if (!$pedido) throw new RuntimeException('Pedido não encontrado.', 404);

        $novo = $pedido->formaRecebimento === 'ENTREGA'
            ? Pedido::STATUS_SAIU_PARA_ENTREGA
            : Pedido::STATUS_PRONTO_PARA_RETIRADA;

        return $this->transicionar($id, $novo);
    }

    public function notificar(string $id): array
    {
        $pedido = $this->pedidos->buscarPorId($id);
        if (!$pedido) throw new RuntimeException('Pedido não encontrado.', 404);
        if (!in_array($pedido->statusAtual, [
            Pedido::STATUS_PRONTO_PARA_RETIRADA,
            Pedido::STATUS_SAIU_PARA_ENTREGA
        ], true)) {
            throw new RuntimeException('O cliente só pode ser notificado quando o pedido estiver pronto/a caminho.', 409);
        }
        $this->pedidos->marcarClienteNotificado($id);
        return $this->buscar($id);
    }

    public function finalizarAtendimento(string $id): array
    {
        $pedido = $this->pedidos->buscarPorId($id);
        if (!$pedido) throw new RuntimeException('Pedido não encontrado.', 404);

        $novo = $pedido->formaRecebimento === 'ENTREGA'
            ? Pedido::STATUS_ENTREGUE
            : Pedido::STATUS_RETIRADO;

        return $this->transicionar($id, $novo);
    }

    private function transicionar(string $id, string $novoStatus): array
    {
        $pedido = $this->pedidos->buscarPorId($id);
        if (!$pedido) throw new RuntimeException('Pedido não encontrado.', 404);

        if (!$pedido->podeTransicionarPara($novoStatus)) {
            throw new RuntimeException(
                "Transição inválida: {$pedido->statusAtual} → {$novoStatus}.", 409
            );
        }

        $this->pedidos->atualizarStatus($id, $novoStatus);
        return $this->buscar($id);
    }

    private function gerarIdentificadorUnico(): string
    {
        do {
            $id = 'FTZ' . random_int(100000, 999999);
        } while ($this->pedidos->identificadorExiste($id));
        return $id;
    }
}
