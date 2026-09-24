let intervaloAcompanhamento = null;

function formatarHora(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function montarPassosDoPedido(pedido) {
  const ehEntrega = pedido.formaRecebimento === FITZZ.formaRecebimento.ENTREGA || pedido.forma_recebimento === "ENTREGA";

  const passos = [];
  passos.push({ status: FITZZ.statusPedido.CONFIRMADO, titulo: "Confirmado" });
  passos.push({ status: FITZZ.statusPedido.EM_PREPARACAO, titulo: "Em preparo" });

  if (ehEntrega) {
    passos.push({ status: FITZZ.statusPedido.SAIU_PARA_ENTREGA, titulo: "Saiu" });
    passos.push({ status: FITZZ.statusPedido.ENTREGUE, titulo: "Entregue" });
  } else {
    passos.push({ status: FITZZ.statusPedido.PRONTO_PARA_RETIRADA, titulo: "Pronto" });
    passos.push({ status: FITZZ.statusPedido.RETIRADO, titulo: "Retirado" });
  }

  return passos;
}

function encontrarIndiceDoStatusAtual(passos, statusAtual) {
  for (let i = 0; i < passos.length; i++) {
    if (passos[i].status === statusAtual) {
      return i;
    }
  }
  return -1;
}

function renderizarPedido(pedido) {
  document.getElementById("busca-pedido").classList.add("d-none");
  document.getElementById("detalhe-pedido").classList.remove("d-none");

  // Adapta para o nome do campo vindo do Supabase (id ou identificador)
  const idExibicao = pedido.id || pedido.identificador;
  document.getElementById("pedido-id").textContent = "Pedido #" + idExibicao;

  const statusAtual = pedido.status_atual || pedido.statusAtual;
  const passos = montarPassosDoPedido(pedido);
  const indiceAtual = encontrarIndiceDoStatusAtual(passos, statusAtual);

  let html = "";
  for (let i = 0; i < passos.length; i++) {
    let classe = "pending";
    if (i < indiceAtual) {
      classe = "done";
    } else if (i === indiceAtual) {
      classe = "current";
    }

    html += "<li class=\"" + classe + "\">";
    html += "<span class=\"marker\"></span>";
    html += "<div class=\"step-title\">" + passos[i].titulo + "</div>";
    html += "</li>";
  }
  document.getElementById("timeline").innerHTML = html;

  let htmlItens = "";
  const listaItens = pedido.itens || [];
  for (let i = 0; i < listaItens.length; i++) {
    const item = listaItens[i];
    const qtd = item.quantidade || 1;
    const nome = item.nome || item.titulo;
    const tam = item.tamanho ? " (" + item.tamanho + ")" : "";
    const preco = item.precoUnitario || item.preco || 0;

    htmlItens += "<div class=\"d-flex justify-content-between small mb-1\">";
    htmlItens += "<span>" + qtd + "× " + nome + tam + "</span>";
    htmlItens += "<span>" + formatarPreco(preco * qtd) + "</span>";
    htmlItens += "</div>";
  }
  document.getElementById("pedido-itens").innerHTML = htmlItens;

  const taxa = pedido.taxa_entrega ?? pedido.taxaEntrega ?? 0;
  const total = pedido.valor_total ?? pedido.valorTotal ?? 0;

  document.getElementById("pedido-taxa").textContent = formatarPreco(taxa);
  document.getElementById("pedido-total").textContent = formatarPreco(total);

  const previsao = pedido.previsao_conclusao || pedido.previsaoConclusao;
  if (previsao) {
    document.getElementById("pedido-previsao").textContent = formatarHora(previsao);
  } else {
    document.getElementById("pedido-previsao").textContent = "Aguardando confirmação da loja";
  }

  const forma = pedido.forma_recebimento || pedido.formaRecebimento;
  if (forma === FITZZ.formaRecebimento.ENTREGA || forma === "ENTREGA") {
    document.getElementById("titulo-endereco").textContent = "Endereço de entrega";
    const regiao = pedido.regiao_entrega || pedido.regiaoEntrega || "";
    document.getElementById("pedido-endereco").textContent = (pedido.cep ? "CEP " + pedido.cep + " — " : "") + regiao;
  } else {
    document.getElementById("titulo-endereco").textContent = "Retirada";
    document.getElementById("pedido-endereco").textContent = "Retirada no balcão da Fitzzaria";
  }

  document.getElementById("btnFalarLoja").href = "tel:" + FITZZ.estabelecimento.telefone;

  const finalizado =
    statusAtual === FITZZ.statusPedido.RETIRADO || statusAtual === FITZZ.statusPedido.ENTREGUE;

  if (finalizado && intervaloAcompanhamento !== null) {
    clearInterval(intervaloAcompanhamento);
    intervaloAcompanhamento = null;
  }
}

function buscarPedidoDigitado() {
  const codigo = document.getElementById("inputCodigo").value.trim().toUpperCase();
  if (codigo === "") {
    return;
  }
  buscarEExibirPedido(codigo);
}

// Consulta o pedido no Supabase pelo ID
async function consultarPedidoSupabase(codigo) {
  try {
    const { data, error } = await supabaseClient
      .from('pedidos') // Garanta que o nome da tabela no Supabase seja 'pedidos'
      .select('*')
      .eq('id', codigo)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  } catch (err) {
    console.error("Erro ao buscar pedido no Supabase:", err);
    return null;
  }
}

async function buscarEExibirPedido(codigo) {
  // 1. Tenta buscar no Supabase
  let pedido = await consultarPedidoSupabase(codigo);

  // 2. Se não encontrar no Supabase, tenta a busca local (fallback)
  if (!pedido && typeof buscarPedidoPorId === 'function') {
    pedido = buscarPedidoPorId(codigo);
  }

  if (pedido === null) {
    document.getElementById("msgNaoEncontrado").classList.remove("d-none");
    return;
  }

  document.getElementById("msgNaoEncontrado").classList.add("d-none");
  renderizarPedido(pedido);

  // Limpa intervalo anterior se houver
  if (intervaloAcompanhamento) clearInterval(intervaloAcompanhamento);

  // Atualiza o status automaticamente a cada 5 segundos
  intervaloAcompanhamento = setInterval(async function () {
    let pedidoAtualizado = await consultarPedidoSupabase(codigo);
    if (!pedidoAtualizado && typeof buscarPedidoPorId === 'function') {
      pedidoAtualizado = buscarPedidoPorId(codigo);
    }
    if (pedidoAtualizado !== null) {
      renderizarPedido(pedidoAtualizado);
    }
  }, 5000);
}

// Inicialização automática ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const parametros = new URLSearchParams(window.location.search);
  const codigoNaUrl = parametros.get("pedido");
  if (codigoNaUrl) {
    document.getElementById("inputCodigo").value = codigoNaUrl;
    buscarEExibirPedido(codigoNaUrl);
  }
});