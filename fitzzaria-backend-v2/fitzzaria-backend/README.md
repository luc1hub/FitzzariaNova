# Fitzzaria — Back-end (PHP + PDO)

Parte do back-end: **banco de dados + entidades + repositories**.
Alinhado ao contrato de nomes do front-end (tag V0.1).

## Estrutura

```
fitzzaria-backend/
├── fitzzaria_banco.sql       Script de criação do banco (MySQL/MariaDB)
├── config/
│   └── Database.php          Conexão PDO (singleton)
├── entities/                 Classes de domínio (1:1 com o diagrama)
│   ├── Produto.php
│   ├── TamanhoProduto.php
│   ├── OpcaoPersonalizacao.php
│   ├── RegiaoEntrega.php
│   ├── FormaPagamento.php
│   ├── Estabelecimento.php
│   ├── Carrinho.php
│   ├── ItemCarrinho.php
│   ├── Pedido.php
│   ├── ItemPedido.php
│   └── Pagamento.php
└── repositories/             Acesso a dados via PDO
    ├── ProdutoRepository.php
    ├── PedidoRepository.php
    └── PagamentoRepository.php
```

> **Importante:** mantenha esta estrutura de pastas. Os `require_once`
> usam caminhos relativos (ex: `__DIR__ . '/../config/Database.php'`).
> Se mover os arquivos, os caminhos quebram.

## Como rodar o banco

```sql
DROP DATABASE IF EXISTS fitzzaria;   -- se já existir uma versão antiga
SOURCE fitzzaria_banco.sql;          -- ou importe pelo phpMyAdmin
```

## Configurar a conexão

Edite `config/Database.php` e ajuste usuário/senha do seu MySQL:

```php
private static string $user = 'root';
private static string $pass = '';
```

## Pendências para o restante do grupo

- **Senha do funcionário:** em `fitzzaria_banco.sql`, o campo `senha_hash`
  está com um placeholder. Gere o hash real no PHP e substitua:
  ```php
  echo password_hash('fitzzaria123', PASSWORD_DEFAULT);
  ```
- **Falta construir (parte do colega):** Services, Controllers, Endpoints (`/api/`) e Autenticação.
