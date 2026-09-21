let idFormaPagamentoEscolhida = null;

function atualizarContadorCarrinho() {
  const contador = document.getElementById("cart-count");
  if (contador) {
    contador.textContent = contarItensCarrinho();
  }
}

function descreverOpcoesItem(opcoes) {
  if (opcoes.length === 0) {
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
  const carrinho = obterCarrinho();

  if (carrinho.itens.length === 0) {
    document.getElementById("lista-itens").innerHTML = "";
    document.getElementById("carrinho-vazio").classList.remove("d-none");
    document.getElementById("bloco-pagamento").classList.add("d-none");
    document.getElementById("btnFinalizar").disabled = true;
    atualizarResumo();
    return;
  }

  document.getElementById("carrinho-vazio").classList.add("d-none");
  document.getElementById("bloco-pagamento").classList.remove("d-none");

  let html = "";
  for (let i = 0; i < carrinho.itens.length; i++) {
    const item = carrinho.itens[i];

    let detalhes = "Tamanho: " + item.tamanho;
    if (item.opcoes.length > 0) {
      detalhes += " · " + descreverOpcoesItem(item.opcoes);
    }

    html += "<div class=\"cart-line\">";
    html += "<div>";
    html += "<div class=\"cart-line-name\">" + item.nome + "</div>";
    html += "<div class=\"cart-line-opts\">" + detalhes + "</div>";
    html += "<div class=\"cart-line-opts\">" + formatarPreco(item.precoUnitario) + " cada</div>";
    html += "</div>";

    html += "<div class=\"qty-stepper\">";
    html += "<button type=\"button\" onclick=\"diminuirQuantidadeCarrinho(" + item.idItem + ")\">−</button>";
    html += "<span>" + item.quantidade + "</span>";
    html += "<button type=\"button\" onclick=\"aumentarQuantidadeCarrinho(" + item.idItem + ")\">+</button>";
    html += "</div>";

    html += "<div class=\"text-end\">";
    html += "<div class=\"fw-semibold\">" + formatarPreco(calcularSubtotalItem(item)) + "</div>";
    html += "<button type=\"button\" class=\"btn btn-link btn-sm text-danger p-0\" onclick=\"removerItemDoCarrinho(" + item.idItem + ")\">remover</button>";
    html += "</div>";

    html += "</div>";
  }

  document.getElementById("lista-itens").innerHTML = html;
  atualizarResumo();
}

function aumentarQuantidadeCarrinho(idItem) {
  alterarQuantidadeItemCarrinho(idItem, 1);
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function diminuirQuantidadeCarrinho(idItem) {
  alterarQuantidadeItemCarrinho(idItem, -1);
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function removerItemDoCarrinho(idItem) {
  removerItemCarrinho(idItem);
  renderizarItensCarrinho();
  atualizarContadorCarrinho();
}

function renderizarFormasPagamento() {
  let html = "";
  for (let i = 0; i < FITZZ.formasPagamento.length; i++) {
    const forma = FITZZ.formasPagamento[i];
    html += "<div class=\"choice-card\" id=\"forma-" + forma.idFormaPagamento + "\" onclick=\"escolherFormaPagamento(" + forma.idFormaPagamento + ")\">";
    html += "<div class=\"choice-title\">" + forma.descricao + "</div>";
    html += "</div>";
  }
  document.getElementById("lista-formas").innerHTML = html;
}

function escolherFormaPagamento(idFormaPagamento) {
  for (let i = 0; i < FITZZ.formasPagamento.length; i++) {
    document.getElementById("forma-" + FITZZ.formasPagamento[i].idFormaPagamento).classList.remove("selected");
  }
  document.getElementById("forma-" + idFormaPagamento).classList.add("selected");
  idFormaPagamentoEscolhida = idFormaPagamento;
  atualizarResumo();
}

function atualizarResumo() {
  const subtotal = calcularSubtotalCarrinho();
  const taxa = calcularTaxaEntregaCarrinho();

  document.getElementById("res-subtotal").textContent = formatarPreco(subtotal);
  document.getElementById("res-taxa").textContent = formatarPreco(taxa);
  document.getElementById("res-total").textContent = formatarPreco(subtotal + taxa);

  const carrinho = obterCarrinho();

  let podeFinalizar = true;
  if (carrinho.itens.length === 0) {
    podeFinalizar = false;
  }
  if (idFormaPagamentoEscolhida === null) {
    podeFinalizar = false;
  }

  document.getElementById("btnFinalizar").disabled = !podeFinalizar;

  const msg = document.getElementById("msgAjuda");
  if (carrinho.itens.length > 0 && idFormaPagamentoEscolhida === null) {
    msg.textContent = "Escolha a forma de pagamento para finalizar.";
  } else {
    msg.textContent = "";
  }
}

function finalizarPedido() {
  const carrinho = obterCarrinho();
  const subtotal = calcularSubtotalCarrinho();
  const taxaEntrega = calcularTaxaEntregaCarrinho();

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

  limparCarrinho();
  window.location.href = "confirmacao.html?pedido=" + pedido.identificador;
}

renderizarItensCarrinho();
renderizarFormasPagamento();
atualizarContadorCarrinho();
