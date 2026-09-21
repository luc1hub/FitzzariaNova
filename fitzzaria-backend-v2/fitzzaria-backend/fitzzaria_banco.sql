-- ============================================================
--  FITZZARIA — Script de criação do banco de dados
--  MySQL / MariaDB
--  ALINHADO ao contrato de nomes do front-end (tag V0.1)
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '-03:00';

CREATE DATABASE IF NOT EXISTS fitzzaria
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fitzzaria;

-- ============================================================
-- 1. ESTABELECIMENTO
--    front usa: nome, abertoParaPedidos, telefone
-- ============================================================
CREATE TABLE estabelecimento (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome                VARCHAR(100)  NOT NULL,
  telefone            VARCHAR(20)   NOT NULL,
  endereco            VARCHAR(255)  NOT NULL,
  aberto_para_pedidos TINYINT(1)    NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO estabelecimento (nome, telefone, endereco, aberto_para_pedidos)
VALUES ('Fitzzaria', '11999998888', 'Rua das Pizzas Fit, 42 - Santos/SP', 1);

-- ============================================================
-- 2. FUNCIONÁRIOS (para o login da área do funcionário)
-- ============================================================
CREATE TABLE funcionarios (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(100)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255)  NOT NULL,
  criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Funcionário de exemplo. IMPORTANTE: gere o hash real rodando no PHP:
--   echo password_hash('fitzzaria123', PASSWORD_DEFAULT);
-- e substitua o valor abaixo. O placeholder NÃO vai validar como está.
INSERT INTO funcionarios (nome, email, senha_hash) VALUES
  ('Atendente Fitzzaria', 'funcionario@fitzzaria.com', 'SUBSTITUA_PELO_HASH_REAL');

-- ============================================================
-- 3. REGIÕES DE ENTREGA (faixas de CEP)
--    front usa: idRegiao, nome, taxaFixa
-- ============================================================
CREATE TABLE regioes_entrega (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(80)   NOT NULL,
  cep_inicio      CHAR(8)       NOT NULL,
  cep_fim         CHAR(8)       NOT NULL,
  taxa_fixa       DECIMAL(8,2)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO regioes_entrega (id, nome, cep_inicio, cep_fim, taxa_fixa) VALUES
  (1, 'Centro',     '11010000', '11029999',  5.00),
  (2, 'Zona Sul',   '11030000', '11049999',  8.00),
  (3, 'Zona Norte', '11050000', '11069999',  8.00),
  (4, 'Zona Leste', '11070000', '11099999', 10.00);

-- ============================================================
-- 4. FORMAS DE PAGAMENTO
--    front usa: idFormaPagamento, descricao
-- ============================================================
CREATE TABLE formas_pagamento (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  descricao       VARCHAR(60)   NOT NULL,
  ativo           TINYINT(1)    NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO formas_pagamento (id, descricao) VALUES
  (1, 'Cartão de crédito'),
  (2, 'Pix'),
  (3, 'Dinheiro');

-- ============================================================
-- 5. PRODUTOS
--    front usa: idProduto, categoria, nome, descricao,
--               precoBase, disponivel, personalizavel, imagem
-- ============================================================
CREATE TABLE produtos (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(120)  NOT NULL,
  descricao       TEXT,
  categoria       ENUM('Fit','Vegana','Low Carb') NOT NULL,
  preco_base      DECIMAL(8,2)  NOT NULL,
  imagem          VARCHAR(500),
  disponivel      TINYINT(1)    NOT NULL DEFAULT 1,
  personalizavel  TINYINT(1)    NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO produtos (id, nome, descricao, categoria, preco_base, imagem, disponivel, personalizavel) VALUES
  (1, 'Frango Integral',      'Massa integral, peito de frango desfiado, ricota temperada, tomate cereja e orégano', 'Fit',      42.90, 'img/pizza-2.jpg', 1, 1),
  (2, 'Low Carb Abobrinha',   'Base de abobrinha grelhada no lugar da massa tradicional, recheio de queijos e ervas', 'Low Carb', 44.90, 'img/pizza-3.jpg', 1, 1),
  (3, 'Quatro Queijos Light', 'Blend de queijos com menor teor de gordura sobre massa integral',                     'Fit',      47.90, 'img/pizza-1.jpg', 1, 1),
  (4, 'Salmão Defumado',      'Salmão defumado, cream cheese light e alcaparras',                                    'Fit',      49.90, 'img/pizza-3.jpg', 1, 1),
  (5, 'Vegana Grão de Bico',  'Massa de grão-de-bico, queijo vegano e vegetais grelhados',                           'Vegana',   46.90, 'img/pizza-1.jpg', 1, 1),
  (6, 'Rúcula com Parma',     'Presunto parma, rúcula fresca e lascas de parmesão light, finalizada crua',           'Fit',      49.90, 'img/pizza-2.jpg', 1, 1);

-- ============================================================
-- 6. TAMANHOS DE PRODUTO (Média / Grande, com adicional de preço)
-- ============================================================
CREATE TABLE tamanhos_produto (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produto_id      INT UNSIGNED  NOT NULL,
  nome            ENUM('Média','Grande') NOT NULL,
  adicional_preco DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tamanhos_produto (produto_id, nome, adicional_preco)
SELECT id, 'Média',  0.00  FROM produtos
UNION ALL
SELECT id, 'Grande', 10.00 FROM produtos;

-- ============================================================
-- 7. OPÇÕES DE PERSONALIZAÇÃO
--    front usa: idOpcao, nome, valorAdicional
-- ============================================================
CREATE TABLE opcoes_personalizacao (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(100)  NOT NULL,
  valor_adicional DECIMAL(8,2)  NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO opcoes_personalizacao (id, nome, valor_adicional) VALUES
  (1, 'Extra Queijo',   6.00),
  (2, 'Sem cebola',     0.00),
  (3, 'Borda Recheada', 8.00);

-- ============================================================
-- 8. PRODUTO ↔ OPÇÕES (N:N)
--    todo produto personalizável mostra todas as opções.
-- ============================================================
CREATE TABLE produto_opcoes (
  produto_id      INT UNSIGNED  NOT NULL,
  opcao_id        INT UNSIGNED  NOT NULL,
  PRIMARY KEY (produto_id, opcao_id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (opcao_id)   REFERENCES opcoes_personalizacao(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO produto_opcoes (produto_id, opcao_id)
SELECT p.id, o.id
FROM produtos p
CROSS JOIN opcoes_personalizacao o
WHERE p.personalizavel = 1;

-- ============================================================
-- 9. PEDIDOS
--    front usa: identificador (FTZxxxxxx), dataHora, subtotal,
--               taxaEntrega, valorTotal, formaRecebimento,
--               regiaoEntrega (nome), cep, formaPagamento (texto),
--               statusAtual, previsaoConclusao (ISO), clienteNotificado
-- ============================================================
CREATE TABLE pedidos (
  identificador       VARCHAR(20)   PRIMARY KEY,
  data_hora           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forma_recebimento   ENUM('ENTREGA','RETIRADA') NOT NULL,
  cep                 CHAR(8),
  regiao_entrega_id   INT UNSIGNED,
  taxa_entrega        DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  endereco_entrega    VARCHAR(255),
  forma_pagamento_id  INT UNSIGNED,
  cliente_nome        VARCHAR(100),
  cliente_telefone    VARCHAR(20),
  status_atual        ENUM(
                        'CONFIRMADO',
                        'EM_PREPARACAO',
                        'PRONTO_PARA_RETIRADA',
                        'SAIU_PARA_ENTREGA',
                        'RETIRADO',
                        'ENTREGUE',
                        'CANCELADO'
                      ) NOT NULL DEFAULT 'CONFIRMADO',
  previsao_conclusao  DATETIME,
  cliente_notificado  TINYINT(1)    NOT NULL DEFAULT 0,
  subtotal            DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  valor_total         DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  FOREIGN KEY (regiao_entrega_id)  REFERENCES regioes_entrega(id),
  FOREIGN KEY (forma_pagamento_id) REFERENCES formas_pagamento(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. ITENS DO PEDIDO
--     front (item) usa: idProduto, nome, tamanho,
--            quantidade, precoUnitario, opcoes[]
-- ============================================================
CREATE TABLE itens_pedido (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id       VARCHAR(20)   NOT NULL,
  produto_id      INT UNSIGNED  NOT NULL,
  produto_nome    VARCHAR(120)  NOT NULL,
  tamanho         ENUM('Média','Grande'),
  quantidade      TINYINT UNSIGNED NOT NULL DEFAULT 1,
  preco_unitario  DECIMAL(8,2)  NOT NULL,
  subtotal        DECIMAL(8,2)  NOT NULL,
  FOREIGN KEY (pedido_id)  REFERENCES pedidos(identificador) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. OPÇÕES ESCOLHIDAS POR ITEM DO PEDIDO
--     front: item.opcoes = [{ idOpcao, nome, valorAdicional }]
-- ============================================================
CREATE TABLE item_pedido_opcoes (
  item_pedido_id  INT UNSIGNED  NOT NULL,
  opcao_id        INT UNSIGNED  NOT NULL,
  opcao_nome      VARCHAR(100)  NOT NULL,
  valor_adicional DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  PRIMARY KEY (item_pedido_id, opcao_id),
  FOREIGN KEY (item_pedido_id) REFERENCES itens_pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (opcao_id)       REFERENCES opcoes_personalizacao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. PAGAMENTOS
-- ============================================================
CREATE TABLE pagamentos (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id           VARCHAR(20)   NOT NULL UNIQUE,
  forma_pagamento_id  INT UNSIGNED  NOT NULL,
  valor               DECIMAL(8,2)  NOT NULL,
  status              ENUM('PENDENTE','APROVADO','RECUSADO') NOT NULL DEFAULT 'PENDENTE',
  processado_em       DATETIME,
  FOREIGN KEY (pedido_id)          REFERENCES pedidos(identificador) ON DELETE CASCADE,
  FOREIGN KEY (forma_pagamento_id) REFERENCES formas_pagamento(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
