// ==========================================
// FUNÇÕES DE GERENCIAMENTO DO CARRINHO (LOCALSTORAGE)
// ==========================================

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
  if (typeof FITZZ !== 'undefined' && formaRecebimento === FITZZ.formaRecebimento.RETIRADA) {
    carrinho.idRegiaoEntrega = null;
    carrinho.cep = null;
  }
  salvarCarrinho(carrinho);
}

function definirCepEntrega(cep) {
  const carrinho = obterCarrinho();
  if (typeof calcularRegiaoPorCep === 'function') {
    const regiao = calcularRegiaoPorCep(cep);
    carrinho.cep = cep;
    carrinho.idRegiaoEntrega = regiao ? regiao.idRegiao : null;
  } else {
    carrinho.cep = cep;
  }
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
  if (typeof FITZZ !== 'undefined' && carrinho.formaRecebimento !== FITZZ.formaRecebimento.ENTREGA) {
    return 0;
  }
  if (typeof buscarRegiaoEntrega === 'function') {
    const regiao = buscarRegiaoEntrega(carrinho.idRegiaoEntrega);
    if (regiao === null) {
      return 0;
    }
    return regiao.taxaFixa;
  }
  return 0;
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

// ==========================================
// APENAS A GRAVAÇÃO NO SUPABASE
// ==========================================

async function finalizarPedido() {
  const carrinho = obterCarrinho();

  if (!carrinho.itens || carrinho.itens.length === 0) {
    alert("O seu carrinho está vazio!");
    return;
  }

  const novoPedido = {
    forma_recebimento: carrinho.formaRecebimento,
    cep: carrinho.cep,
    id_regiao_entrega: carrinho.idRegiaoEntrega,
    subtotal: calcularSubtotalCarrinho(),
    taxa_entrega: calcularTaxaEntregaCarrinho(),
    total: calcularTotalCarrinho(),
    itens: carrinho.itens
  };

  try {
    // Usa o cliente global do Supabase instanciado no supabaseClient.js
    // O .select() instrui o Supabase a devolver os dados do registo inserido
    const { data, error } = await window.supabaseClient
      .from('pedidos')
      .insert([novoPedido])
      .select();

    if (error) {
      console.error('❌ Erro ao guardar o pedido:', error.message);
      alert('Erro ao enviar pedido: ' + error.message);
    } else {
      console.log('✅ Pedido enviado com sucesso ao Supabase!', data);
      
      const pedidoCriado = data[0];
      limparCarrinho();
      
      // Redireciona diretamente para a tela de acompanhamento com o ID real
      window.location.href = `acompanhamento.html?pedido=${pedidoCriado.id}`;
    }
  } catch (err) {
    console.error('❌ Erro inesperado ao conectar ao Supabase:', err);
    alert('Erro de conexão ao processar o pedido.');
  }
}