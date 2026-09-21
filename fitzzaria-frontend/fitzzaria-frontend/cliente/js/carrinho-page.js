let idFormaPagamentoEscolhida = null;

function atualizarContadorCarrinho() {
  const contador = document.getElementById("cart-count");
  if (contador && typeof contarItensCarrinho === 'function') {
    contador.textContent = contarItensCarrinho();
  }
}

function descreverOpcoesItem(opcoes) {
  if (!opcoes || opcoes.length === 0) {
    return "";
  }
  let nomes = "";
  for (let i = 0; i < opcoes.length; i++) {
    if (i > 0) {
      nomes += ", ";
    }
    nomes += opcoes[i].nome;
  }
  return nomes;
}

function renderizarItensCarrinho() {
  const carrinho = typeof obterCarrinho === 'function' ? obterCarrinho() : { itens: [] };

  if (!carrinho.itens || carrinho.itens.length === 0) {
    const listaItens = document.getElementById("lista-itens");
    if (listaItens) listaItens.innerHTML = "";
    
    const carrinhoVazio = document.getElementById("carrinho-vazio");
    if (carrinhoVazio) carrinhoVazio.classList.remove("d-none");
    
    const blocoPagamento = document.getElementById("bloco-pagamento");
    if (blocoPagamento) blocoPagamento.classList.add("d-none");

    const btnFin = document.getElementById("btnFinalizar");
    if (btnFin) btnFin.disabled = true;

    atualizarResumo();
    return;
  }

  const carrinhoVazio = document.getElementById("carrinho-vazio");
  if (carrinhoVazio) carrinhoVazio.classList.add("d-none");

  const blocoPagamento = document.getElementById("bloco-pagamento");
  if (blocoPagamento) blocoPagamento.classList.remove("d-none");

  let html = "";
  for (let i = 0; i < carrinho.itens.length; i++) {
    const item = carrinho.itens[i];

    let detalhes = "Tamanho: " + (item.tamanho || "Padrão");
    if (item.opcoes && item.opcoes.length > 0) {
      detalhes += " · " + descreverOpcoesItem(item.opcoes);
    }

    const precoUnitarioTexto = typeof formatarPreco === 'function' ? formatarPreco(item.precoUnitario) : 'R$ ' + item.precoUnitario;
    const subtotalTexto = typeof formatarPreco === 'function' ? formatarPreco(typeof calcularSubtotalItem === 'function' ? calcularSubtotalItem(item) : (item.precoUnitario * item.quantidade)) : 'R$ ' + (item.precoUnitario * item.quantidade);

    html += "<div class=\"cart-line\">";
    html += "<div>";
    html += "<div class=\"cart-line-name\">" + item.nome + "</div>";
    html += "<div class=\"cart-line-opts\">" + detalhes + "</div>";
    html += "<div class=\"cart-line-opts\">" + precoUnitarioTexto + " cada</div>";
    html += "</div>";

    html += "<div class=\"qty-stepper\">";
    html += "<button type=\"button\" onclick=\"diminuirQuantidadeCarrinho(" + item.idItem + ")\">−</button>";
    html += "<span>" + item.quantidade + "</span>";
    html += "<button type=\"button\" onclick=\"aumentarQuantidadeCarrinho(" + item.idItem + ")\">+</button>";
    html += "</div>";

    html += "<div class=\"text-end\">";
    html += "<div class=\"fw-semibold\">" + subtotalTexto + "</div>";
    html += "<button type=\"button\" class=\"btn btn-link btn-sm text-danger p-0\" onclick=\"removerItemDoCarrinho(" + item.idItem + ")\">remover</button>";
    html += "</div>";

    html += "</div>";
  }

  const listaItens = document.getElementById("lista-itens");
  if (listaItens) listaItens.innerHTML = html;

  atualizarResumo();
}

function aumentarQuantidadeCarrinho(idItem) {
  if (typeof alterarQuantidadeItemCarrinho === 'function') {
    alterarQuantidadeItemCarrinho(idItem, 1);
  }
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function diminuirQuantidadeCarrinho(idItem) {
  if (typeof alterarQuantidadeItemCarrinho === 'function') {
    alterarQuantidadeItemCarrinho(idItem, -1);
  }
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function removerItemDoCarrinho(idItem) {
  if (typeof removerItemCarrinho === 'function') {
    removerItemCarrinho(idItem);
  }
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function renderizarFormasPagamento() {
  // Tenta obter as formas de pagamento do FITZZ ou usa uma lista padrão de contingência
  const formas = (typeof FITZZ !== 'undefined' && FITZZ.formasPagamento) 
    ? FITZZ.formasPagamento 
    : [
        { idFormaPagamento: 1, descricao: "Cartão de Crédito/Débito" },
        { idFormaPagamento: 2, descricao: "PIX" },
        { idFormaPagamento: 3, descricao: "Dinheiro" }
      ];

  let html = "";
  for (let i = 0; i < formas.length; i++) {
    const forma = formas[i];
    html += "<div class=\"choice-card\" id=\"forma-" + forma.idFormaPagamento + "\" onclick=\"escolherFormaPagamento(" + forma.idFormaPagamento + ")\">";
    html += "<div class=\"choice-title\">" + forma.descricao + "</div>";
    html += "</div>";
  }

  const listaFormas = document.getElementById("lista-formas");
  if (listaFormas) listaFormas.innerHTML = html;
}

function escolherFormaPagamento(idFormaPagamento) {
  const formas = (typeof FITZZ !== 'undefined' && FITZZ.formasPagamento) 
    ? FITZZ.formasPagamento 
    : [
        { idFormaPagamento: 1 },
        { idFormaPagamento: 2 },
        { idFormaPagamento: 3 }
      ];

  for (let i = 0; i < formas.length; i++) {
    const el = document.getElementById("forma-" + formas[i].idFormaPagamento);
    if (el) el.classList.remove("selected");
  }

  const itemSelecionado = document.getElementById("forma-" + idFormaPagamento);
  if (itemSelecionado) itemSelecionado.classList.add("selected");

  idFormaPagamentoEscolhida = idFormaPagamento;
  atualizarResumo();
}

function atualizarResumo() {
  const subtotal = typeof calcularSubtotalCarrinho === 'function' ? calcularSubtotalCarrinho() : 0;
  const taxa = typeof calcularTaxaEntregaCarrinho === 'function' ? calcularTaxaEntregaCarrinho() : 0;

  const resSubtotal = document.getElementById("res-subtotal");
  if (resSubtotal) resSubtotal.textContent = typeof formatarPreco === 'function' ? formatarPreco(subtotal) : 'R$ ' + subtotal;

  const resTaxa = document.getElementById("res-taxa");
  if (resTaxa) resTaxa.textContent = typeof formatarPreco === 'function' ? formatarPreco(taxa) : 'R$ ' + taxa;

  const resTotal = document.getElementById("res-total");
  if (resTotal) resTotal.textContent = typeof formatarPreco === 'function' ? formatarPreco(subtotal + taxa) : 'R$ ' + (subtotal + taxa);

  const carrinho = typeof obterCarrinho === 'function' ? obterCarrinho() : { itens: [] };

  let podeFinalizar = true;
  if (!carrinho.itens || carrinho.itens.length === 0) {
    podeFinalizar = false;
  }
  if (idFormaPagamentoEscolhida === null) {
    podeFinalizar = false;
  }

  const btnFin = document.getElementById("btnFinalizar");
  if (btnFin) btnFin.disabled = !podeFinalizar;

  const msg = document.getElementById("msgAjuda");
  if (msg) {
    if (carrinho.itens && carrinho.itens.length > 0 && idFormaPagamentoEscolhida === null) {
      msg.textContent = "Escolha a forma de pagamento para finalizar.";
    } else {
      msg.textContent = "";
    }
  }
}

function finalizarPedido() {
  const carrinho = typeof obterCarrinho === 'function' ? obterCarrinho() : { itens: [] };
  const subtotal = typeof calcularSubtotalCarrinho === 'function' ? calcularSubtotalCarrinho() : 0;
  const taxaEntrega = typeof calcularTaxaEntregaCarrinho === 'function' ? calcularTaxaEntregaCarrinho() : 0;

  if (typeof criarPedido === 'function') {
    const pedido = criarPedido({
      itens: carrinho.itens,
      subtotal: subtotal,
      taxaEntrega: taxaEntrega,
      valorTotal: subtotal + taxaEntrega,
      formaRecebimento: carrinho.formaRecebimento,
      idRegiaoEntrega: carrinho.idRegiaoEntrega,
      cep: carrinho.cep,
      idFormaPagamento: idFormaPagamentoEscolhida
    });

    if (typeof limparCarrinho === 'function') {
      limparCarrinho();
    }

    if (pedido && pedido.identificador) {
      window.location.href = "confirmacao.html?pedido=" + pedido.identificador;
    }
  } else {
    alert("Erro ao processar o pedido. Tente novamente.");
  }
}

renderizarItensCarrinho();
renderizarFormasPagamento();
atualizarContadorCarrinho();