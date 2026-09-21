# Guia de integração — Back-end Fitzzaria

Este documento explica a base do back-end (banco + entidades + repositories)
que já está pronta e testada, para quem vai construir a camada de cima
(Services, Controllers, Endpoints e Autenticação).

---

## 1. Como rodar o ambiente

- **Stack:** PHP 8 + MariaDB, tudo via **XAMPP**
- **Banco:** importar o `fitzzaria_banco.sql` no phpMyAdmin (cria o banco `fitzzaria` com 12 tabelas já populadas)
- **Pasta do projeto:** colocar `fitzzaria-backend/` dentro de `htdocs`
- **Conexão:** usuário `root`, sem senha (padrão do XAMPP). Configurável em `config/Database.php`.
- **Teste rápido:** abrir `http://localhost/fitzzaria-backend/teste.php` — se der tudo verde, está funcionando.

---

## 2. Estrutura de pastas

```
fitzzaria-backend/
├── fitzzaria_banco.sql       Script do banco (MariaDB)
├── teste.php                 Teste da base (pode apagar na entrega final)
├── config/
│   └── Database.php          Conexão PDO (singleton) → Database::getConnection()
├── entities/                 Classes de domínio
└── repositories/             Acesso a dados (PDO)
```

> **Importante:** os `require_once` usam caminho relativo. Mantenha as pastas.

---

## 3. Conexão com o banco

Sempre pegue a conexão assim (nunca crie um `new PDO` novo):

```php
require_once __DIR__ . '/config/Database.php';
$db = Database::getConnection();  // devolve sempre a MESMA conexão PDO
```

---

## 4. Repositories prontos para usar

### ProdutoRepository
```php
$repo = new ProdutoRepository();
$repo->listarDisponiveis();                    // todos os produtos (Produto[])
$repo->listarDisponiveis('Fit');               // filtra por categoria
$repo->listarDisponiveis('Fit', 45.00);        // categoria + preço máximo
$repo->buscarPorId(1);                          // Produto (com tamanhos e opções) ou null
$repo->buscarTamanhoPorNome(1, 'Grande');       // TamanhoProduto ou null
$repo->buscarOpcaoPorId(1);                     // OpcaoPersonalizacao ou null
```

### PedidoRepository
```php
$repo = new PedidoRepository();
$repo->buscarPorId('FTZ428193');                // Pedido (com itens) ou null
$repo->listarPorStatus('CONFIRMADO');           // Pedido[]
$repo->identificadorExiste('FTZ428193');        // bool (para gerar id único)
$repo->salvar($pedido);                          // grava o cabeçalho do pedido
$repo->salvarItem($itemPedido);                  // grava um item, retorna id
$repo->salvarOpcaoDoItem($itemId, $opcao);       // grava opção de um item
$repo->atualizarStatus('FTZ428193', 'EM_PREPARACAO');
$repo->definirPrevisao('FTZ428193', '2026-09-17 20:30:00');
$repo->marcarClienteNotificado('FTZ428193');
```

### PagamentoRepository
```php
$repo = new PagamentoRepository();
$repo->salvar($pagamento);                       // grava, retorna id
$repo->buscarPorPedidoId('FTZ428193');           // Pagamento ou null
$repo->atualizarStatus($pagId, 'APROVADO', date('Y-m-d H:i:s'));
```

---

## 5. Regras de negócio já implementadas nas entidades

- **Cálculo de preço** (validar no servidor, NÃO confiar no front):
  ```php
  $produto = $repo->buscarPorId(1);
  $grande  = $repo->buscarTamanhoPorNome(1, 'Grande');
  $opcoes  = [$repo->buscarOpcaoPorId(1)];
  $preco   = $produto->calcularPrecoPersonalizado($grande, $opcoes); // base + tamanho + opções
  ```

- **Transição de status** (bloqueia pulos de etapa):
  ```php
  $pedido = $repo->buscarPorId('FTZ428193');
  if ($pedido->podeTransicionarPara('EM_PREPARACAO')) {
      $repo->atualizarStatus($pedido->identificador, 'EM_PREPARACAO');
  }
  ```
  Fluxo permitido: CONFIRMADO → EM_PREPARACAO → (PRONTO_PARA_RETIRADA ou SAIU_PARA_ENTREGA) → (RETIRADO ou ENTREGUE)

- **Pagamento simulado** (aprova sempre — decisão do grupo):
  ```php
  $pagamento->processar(); // marca como APROVADO
  ```

---

## 6. Contrato de campos (o que o front espera no JSON)

Todas as entidades têm `->toArray()` que já devolve os nomes EXATOS do front.
Use sempre esse método ao montar a resposta dos endpoints.

| Entidade      | Campos no JSON                                                                 |
|---------------|-------------------------------------------------------------------------------|
| Produto       | idProduto, categoria, nome, descricao, precoBase, disponivel, personalizavel, imagem, tamanhos[], opcoesPersonalizacao[] |
| Opção         | idOpcao, nome, valorAdicional                                                  |
| Região        | idRegiao, nome, taxaFixa                                                       |
| Forma pagto   | idFormaPagamento, descricao                                                    |
| Estabelecimento | nome, abertoParaPedidos, telefone                                           |
| Pedido        | identificador, dataHora, itens[], subtotal, taxaEntrega, valorTotal, formaRecebimento, regiaoEntrega, cep, formaPagamento, statusAtual, previsaoConclusao, clienteNotificado |
| Item          | idProduto, nome, tamanho, quantidade, precoUnitario, opcoes[]                  |

**Exemplo de endpoint:**
```php
header('Content-Type: application/json');
$repo = new ProdutoRepository();
$produtos = $repo->listarDisponiveis($_GET['categoria'] ?? null);
echo json_encode(array_map(fn($p) => $p->toArray(), $produtos));
```

---

## 7. O que falta construir (a sua parte)

Endpoints a criar em `/api/` (ver escopo para a lista completa):

| Endpoint                                   | O que faz                         |
|--------------------------------------------|-----------------------------------|
| GET  /api/produtos.php                      | lista/filtra produtos             |
| GET  /api/produtos.php?id=X                 | um produto com opções/tamanhos    |
| GET  /api/regioes-entrega.php?cep=X         | calcula região/taxa pelo CEP      |
| GET  /api/estabelecimento.php               | dados da loja                     |
| GET  /api/formas-pagamento.php              | formas de pagamento               |
| POST /api/pedidos.php                        | cria pedido (recalcular preço!)   |
| GET  /api/pedidos.php?id=X                   | busca pedido                      |
| GET  /api/pedidos.php?status=CONFIRMADO      | lista pedidos por status          |
| POST /api/pedidos.php/{id}/aceitar           | aceitar + previsão                |
| POST /api/pedidos.php/{id}/iniciar-preparo   | muda status                       |
| POST /api/pedidos.php/{id}/finalizar-preparo | muda status                       |
| POST /api/pedidos.php/{id}/notificar         | marca cliente notificado          |
| POST /api/pedidos.php/{id}/finalizar-atendimento | muda status                   |

**Autenticação:** login do funcionário usando a tabela `funcionarios`.
⚠️ O campo `senha_hash` no SQL está com um PLACEHOLDER. Gere o hash real:
```php
echo password_hash('fitzzaria123', PASSWORD_DEFAULT);
```
e faça UPDATE na tabela funcionarios.

---

Qualquer dúvida sobre a base, o `teste.php` mostra exemplos de uso de tudo.
