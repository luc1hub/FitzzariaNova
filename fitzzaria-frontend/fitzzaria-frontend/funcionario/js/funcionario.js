let identificadorEmAceite = null;

function formatarHora(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function montarListaDeItens(pedido) {
  let html = "<ul>";
  for (let i = 0; i < pedido.itens.length; i++) {
    html += "<li>" + pedido.itens[i].quantidade + "× " + pedido.itens[i].nome + "</li>";
  }
  html += "</ul>";
  return html;
}

function textoRecebimento(pedido) {
  if (pedido.formaRecebimento === FITZZ.formaRecebimento.ENTREGA) {
    return "Entrega — " + pedido.regiaoEntrega;
  }
  return "Retirada na loja";
}

function montarCartaoConfirmado(pedido) {
  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">" + pedido.identificador + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + formatarHora(pedido.dataHora) + "</div>";
  html += montarListaDeItens(pedido);

  if (pedido.previsaoConclusao) {
    html += "<div class=\"prazo\">previsão " + formatarHora(pedido.previsaoConclusao) + "</div>";
    html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"iniciarPreparoClick('" + pedido.identificador + "')\">Iniciar preparo</button></div>";
  } else {
    html += "<div class=\"actions\"><button class=\"btn-fitz\" onclick=\"abrirPrevisao('" + pedido.identificador + "')\">Aceitar pedido</button></div>";
  }

  html += "</div>";
  return html;
}

function montarCartaoEmPreparo(pedido) {
  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">" + pedido.identificador + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + "</div>";
  html += montarListaDeItens(pedido);
  html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"finalizarPreparoClick('" + pedido.identificador + "')\">Finalizar preparo</button></div>";
  html += "</div>";
  return html;
}

function montarCartaoProntoOuSaiu(pedido) {
  let rotuloStatus = "Pronto para retirada";
  if (pedido.statusAtual === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
    rotuloStatus = "Saiu para entrega";
  }

  let rotuloFinalizar = "Marcar como retirado";
  if (pedido.statusAtual === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
    rotuloFinalizar = "Confirmar entrega";
  }

  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">" + pedido.identificador + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + rotuloStatus + "</div>";
  html += montarListaDeItens(pedido);

  if (pedido.clienteNotificado) {
    html += "<div class=\"prazo\">cliente notificado</div>";
    html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"finalizarAtendimentoClick('" + pedido.identificador + "')\">" + rotuloFinalizar + "</button></div>";
  } else {
    html += "<div class=\"actions\"><button class=\"btn-fitz\" onclick=\"notificarClienteClick('" + pedido.identificador + "')\">Notificar Cliente</button></div>";
  }

  html += "</div>";
  return html;
}

function montarCartaoConcluido(pedido) {
  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">" + pedido.identificador + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + FITZZ.statusLabel[pedido.statusAtual] + "</div>";
  html += "</div>";
  return html;
}

function montarColuna(titulo, pedidos, montarCartaoFuncao) {
  let corpo = "";
  if (pedidos.length === 0) {
    corpo = "<div class=\"board-empty\">Nenhum pedido aqui</div>";
  } else {
    for (let i = 0; i < pedidos.length; i++) {
      corpo += montarCartaoFuncao(pedidos[i]);
    }
  }

  let html = "<div class=\"board-col\">";
  html += "<div class=\"board-col-header\"><h3>" + titulo + "</h3><span class=\"board-col-count\">" + pedidos.length + "</span></div>";
  html += "<div class=\"board-col-body\">" + corpo + "</div>";
  html += "</div>";
  return html;
}

function renderizarBoard() {
  const todos = listarPedidos();

  const confirmados = [];
  const emPreparo = [];
  const prontosOuSaiu = [];
  const concluidos = [];

  for (let i = 0; i < todos.length; i++) {
    const pedido = todos[i];

    if (pedido.statusAtual === FITZZ.statusPedido.CONFIRMADO) {
      confirmados.push(pedido);
    } else if (pedido.statusAtual === FITZZ.statusPedido.EM_PREPARACAO) {
      emPreparo.push(pedido);
    } else if (pedido.statusAtual === FITZZ.statusPedido.PRONTO_PARA_RETIRADA || pedido.statusAtual === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
      prontosOuSaiu.push(pedido);
    } else {
      concluidos.push(pedido);
    }
  }

  let html = "";
  html += montarColuna("Confirmado", confirmados, montarCartaoConfirmado);
  html += montarColuna("Em preparo", emPreparo, montarCartaoEmPreparo);
  html += montarColuna("Pronto / a caminho", prontosOuSaiu, montarCartaoProntoOuSaiu);
  html += montarColuna("Concluído", concluidos, montarCartaoConcluido);

  document.getElementById("board").innerHTML = html;
}

function abrirPrevisao(identificador) {
  identificadorEmAceite = identificador;
  new bootstrap.Modal(document.getElementById("previsaoModal")).show();
}

function confirmarPrevisao() {
  const minutos = Number(document.getElementById("inputMinutos").value) || 30;
  aceitarPedido(identificadorEmAceite, minutos);
  bootstrap.Modal.getInstance(document.getElementById("previsaoModal")).hide();
  renderizarBoard();
}

function iniciarPreparoClick(identificador) {
  iniciarPreparoPedido(identificador);
  renderizarBoard();
}

function finalizarPreparoClick(identificador) {
  finalizarPreparoPedido(identificador);
  renderizarBoard();
}

function notificarClienteClick(identificador) {
  notificarClientePedido(identificador);
  renderizarBoard();
}

function finalizarAtendimentoClick(identificador) {
  finalizarAtendimentoPedido(identificador);
  renderizarBoard();
}

function gerarPedidoTeste() {
  const produto = FITZZ.produtos[Math.floor(Math.random() * 3)];
  const entrega = Math.random() > 0.5;
  const regiao = FITZZ.regioesEntrega[0];

  let taxaEntrega = 0;
  let idRegiaoEntrega = null;
  let cep = null;
  let formaRecebimento = FITZZ.formaRecebimento.RETIRADA;

  if (entrega) {
    taxaEntrega = regiao.taxaFixa;
    idRegiaoEntrega = regiao.idRegiao;
    cep = "01302907";
    formaRecebimento = FITZZ.formaRecebimento.ENTREGA;
  }

  criarPedido({
    itens: [{ idProduto: produto.idProduto, nome: produto.nome, tamanho: "Média", quantidade: 1, precoUnitario: produto.precoBase, opcoes: [] }],
    subtotal: produto.precoBase,
    taxaEntrega: taxaEntrega,
    valorTotal: produto.precoBase + taxaEntrega,
    formaRecebimento: formaRecebimento,
    idRegiaoEntrega: idRegiaoEntrega,
    cep: cep,
    idFormaPagamento: 1
  });

  renderizarBoard();
}

window.addEventListener("storage", renderizarBoard);
setInterval(renderizarBoard, 2500);
renderizarBoard();
