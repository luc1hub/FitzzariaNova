function obterCarrinho() {
  const texto = localStorage.getItem("carrinho");
  if (texto === null) {
    return { itens: [], formaRecebimento: null, idRegiaoEntrega: null, cep: null };
  }
  return JSON.parse(texto);
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function adicionarItemCarrinho(idProduto, quantidade, tamanho, opcoesEscolhidas) {
  const produto = buscarProduto(idProduto);
  if (produto === null) {
    return;
  }

  let precoUnitario = produto.precoBase;
  for (let i = 0; i < opcoesEscolhidas.length; i++) {
    precoUnitario = precoUnitario + opcoesEscolhidas[i].valorAdicional;
  }

  const carrinho = obterCarrinho();
  carrinho.itens.push({
    idItem: Date.now(),
    idProduto: produto.idProduto,
    nome: produto.nome,
    tamanho: tamanho,
    quantidade: quantidade,
    precoUnitario: precoUnitario,
    opcoes: opcoesEscolhidas
  });

  salvarCarrinho(carrinho);
}

function removerItemCarrinho(idItem) {
  const carrinho = obterCarrinho();
  const novosItens = [];
  for (let i = 0; i < carrinho.itens.length; i++) {
    if (carrinho.itens[i].idItem !== idItem) {
      novosItens.push(carrinho.itens[i]);
    }
  }
  carrinho.itens = novosItens;
  salvarCarrinho(carrinho);
}

function alterarQuantidadeItemCarrinho(idItem, diferenca) {
  const carrinho = obterCarrinho();
  for (let i = 0; i < carrinho.itens.length; i++) {
    if (carrinho.itens[i].idItem === idItem) {
      let novaQuantidade = carrinho.itens[i].quantidade + diferenca;
      if (novaQuantidade < 1) {
        novaQuantidade = 1;
      }
      carrinho.itens[i].quantidade = novaQuantidade;
    }
  }
  salvarCarrinho(carrinho);
}

function definirFormaRecebimento(formaRecebimento) {
  const carrinho = obterCarrinho();
  carrinho.formaRecebimento = formaRecebimento;
  if (formaRecebimento === FITZZ.formaRecebimento.RETIRADA) {
    carrinho.idRegiaoEntrega = null;
    carrinho.cep = null;
  }
  salvarCarrinho(carrinho);
}

function definirCepEntrega(cep) {
  const carrinho = obterCarrinho();
  const regiao = calcularRegiaoPorCep(cep);
  carrinho.cep = cep;
  carrinho.idRegiaoEntrega = regiao.idRegiao;
  salvarCarrinho(carrinho);
}

function calcularSubtotalItem(item) {
  return item.precoUnitario * item.quantidade;
}

function calcularSubtotalCarrinho() {
  const carrinho = obterCarrinho();
  let subtotal = 0;
  for (let i = 0; i < carrinho.itens.length; i++) {
    subtotal = subtotal + calcularSubtotalItem(carrinho.itens[i]);
  }
  return subtotal;
}

function calcularTaxaEntregaCarrinho() {
  const carrinho = obterCarrinho();
  if (carrinho.formaRecebimento !== FITZZ.formaRecebimento.ENTREGA) {
    return 0;
  }
  const regiao = buscarRegiaoEntrega(carrinho.idRegiaoEntrega);
  if (regiao === null) {
    return 0;
  }
  return regiao.taxaFixa;
}

function calcularTotalCarrinho() {
  return calcularSubtotalCarrinho() + calcularTaxaEntregaCarrinho();
}

function contarItensCarrinho() {
  const carrinho = obterCarrinho();
  let total = 0;
  for (let i = 0; i < carrinho.itens.length; i++) {
    total = total + carrinho.itens[i].quantidade;
  }
  return total;
}

function limparCarrinho() {
  localStorage.removeItem("carrinho");
}

<TesteSupabase/>

import { useEffect } from 'react'
import { supabase } from './supabaseClient'

export function TesteSupabase() {
  useEffect(() => {
    async function testarConexao() {
      const { data, error } = await supabase
        .from('teste_fitzzaria')
        .select('*')

      if (error) {
        console.error('❌ Erro ao conectar ao Supabase:', error.message)
      } else {
        console.log('✅ Sucesso! Dados recebidos do Supabase:', data)
      }
    }

    testarConexao()
  }, [])

  return null // Não altera nada no layout visual da página
}