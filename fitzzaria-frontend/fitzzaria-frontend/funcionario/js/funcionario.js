// URL base da sua API no InfinityFree
const API_BASE_URL = 'https://fitzzariabackend.infy.click/fitzzaria-backend/api';

// Verifica com o PHP se o funcionário está autenticado
async function verificarAutenticacao() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/auth.php`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // OBRIGATÓRIO: envia os cookies da sessão
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.autenticado) {
            window.location.href = 'login.html'; 
        }
    } catch (erro) {
        console.error('Erro ao verificar sessão com o servidor:', erro);
    }
}

// Executa a verificação ao carregar a página
verificarAutenticacao();


let identificadorEmAceite = null;

function formatarHora(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function montarListaDeItens(pedido) {
  let html = "<ul>";
  const itens = pedido.itens || [];
  for (let i = 0; i < itens.length; i++) {
    const qtd = itens[i].quantidade || 1;
    const nome = itens[i].nome || itens[i].titulo || "Item";
    html += "<li>" + qtd + "× " + nome + "</li>";
  }
  html += "</ul>";
  return html;
}

function textoRecebimento(pedido) {
  const forma = pedido.forma_recebimento || pedido.formaRecebimento;
  const regiao = pedido.regiao_entrega || pedido.regiaoEntrega || "";

  if (forma === FITZZ.formaRecebimento.ENTREGA || forma === "ENTREGA") {
    return "Entrega — " + regiao;
  }
  return "Retirada na loja";
}

function montarCartaoConfirmado(pedido) {
  const idExibicao = pedido.id || pedido.identificador;
  const previsao = pedido.previsao_conclusao || pedido.previsaoConclusao;
  const dataHora = pedido.created_at || pedido.dataHora;

  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">#" + idExibicao + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + formatarHora(dataHora) + "</div>";
  html += montarListaDeItens(pedido);

  if (previsao) {
    html += "<div class=\"prazo\">previsão " + formatarHora(previsao) + "</div>";
    html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"iniciarPreparoClick('" + idExibicao + "')\">Iniciar preparo</button></div>";
  } else {
    html += "<div class=\"actions\"><button class=\"btn-fitz\" onclick=\"abrirPrevisao('" + idExibicao + "')\">Aceitar pedido</button></div>";
  }

  html += "</div>";
  return html;
}

function montarCartaoEmPreparo(pedido) {
  const idExibicao = pedido.id || pedido.identificador;

  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">#" + idExibicao + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + "</div>";
  html += montarListaDeItens(pedido);
  html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"finalizarPreparoClick('" + idExibicao + "')\">Finalizar preparo</button></div>";
  html += "</div>";
  return html;
}

function montarCartaoProntoOuSaiu(pedido) {
  const idExibicao = pedido.id || pedido.identificador;
  const statusAtual = pedido.status_atual || pedido.statusAtual;
  const clienteNotificado = pedido.cliente_notificado ?? pedido.clienteNotificado;

  let rotuloStatus = "Pronto para retirada";
  if (statusAtual === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
    rotuloStatus = "Saiu para entrega";
  }

  let rotuloFinalizar = "Marcar como retirado";
  if (statusAtual === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
    rotuloFinalizar = "Confirmar entrega";
  }

  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">#" + idExibicao + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + rotuloStatus + "</div>";
  html += montarListaDeItens(pedido);

  if (clienteNotificado) {
    html += "<div class=\"prazo\">cliente notificado</div>";
    html += "<div class=\"actions\"><button class=\"btn-fitz-olive\" onclick=\"finalizarAtendimentoClick('" + idExibicao + "')\">" + rotuloFinalizar + "</button></div>";
  } else {
    html += "<div class=\"actions\"><button class=\"btn-fitz\" onclick=\"notificarClienteClick('" + idExibicao + "')\">Notificar Cliente</button></div>";
  }

  html += "</div>";
  return html;
}

function montarCartaoConcluido(pedido) {
  const idExibicao = pedido.id || pedido.identificador;
  const statusAtual = pedido.status_atual || pedido.statusAtual;

  let html = "<div class=\"order-card\">";
  html += "<div class=\"id\">#" + idExibicao + "</div>";
  html += "<div class=\"meta\">" + textoRecebimento(pedido) + " · " + (FITZZ.statusLabel[statusAtual] || statusAtual) + "</div>";
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


for (let i = 0; i < todos.length; i++) {
    const pedido = todos[i];
    
    // Lê o status, remove as aspas inseridas pelo Supabase e converte para maiúsculo
    const statusBruto = pedido.status_atual || pedido.statusAtual || "";
    const status = String(statusBruto).replace(/['"]/g, "").trim().toUpperCase();

    if (status === FITZZ.statusPedido.CONFIRMADO) {
      confirmados.push(pedido);
    } else if (status === FITZZ.statusPedido.EM_PREPARACAO) {
      emPreparo.push(pedido);
    } else if (status === FITZZ.statusPedido.PRONTO_PARA_RETIRADA || status === FITZZ.statusPedido.SAIU_PARA_ENTREGA) {
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

  const elBoard = document.getElementById("board");
  if (elBoard) {
    elBoard.innerHTML = html;
  }
}

function abrirPrevisao(identificador) {
  identificadorEmAceite = identificador;
  new bootstrap.Modal(document.getElementById("previsaoModal")).show();
}

async function confirmarPrevisao() {
  const minutos = Number(document.getElementById("inputMinutos").value) || 30;
  await aceitarPedido(identificadorEmAceite, minutos);
  bootstrap.Modal.getInstance(document.getElementById("previsaoModal")).hide();
  await renderizarBoard();
}

async function iniciarPreparoClick(identificador) {
  await iniciarPreparoPedido(identificador);
  await renderizarBoard();
}

async function finalizarPreparoClick(identificador) {
  await finalizarPreparoPedido(identificador);
  await renderizarBoard();
}

async function notificarClienteClick(identificador) {
  await notificarClientePedido(identificador);
  await renderizarBoard();
}

async function finalizarAtendimentoClick(identificador) {
  await finalizarAtendimentoPedido(identificador);
  await renderizarBoard();
}

// Atualização automática a cada 5 segundos
setInterval(renderizarBoard, 5000);

// Primeira renderização ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  renderizarBoard();
});