// Retorna todos os pedidos da base do Supabase
async function listarPedidos() {
  try {
    const { data, error } = await supabaseClient
      .from('pedidos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Erro de conexão:", err);
    return [];
  }
}

// Procura o pedido pelo ID/identificador
async function buscarPedidoPorId(identificador) {
  const pedidos = await listarPedidos();
  for (let i = 0; i < pedidos.length; i++) {
    const idAtual = pedidos[i].id || pedidos[i].identificador;
    if (String(idAtual) === String(identificador)) {
      return pedidos[i];
    }
  }
  return null;
}

// Atualiza o pedido diretamente no Supabase
async function atualizarPedido(pedidoAtualizado) {
  try {
    const id = pedidoAtualizado.id || pedidoAtualizado.identificador;

    const { error } = await supabaseClient
      .from('pedidos')
      .update({
        status_atual: pedidoAtualizado.statusAtual || pedidoAtualizado.status_atual,
        previsao_conclusao: pedidoAtualizado.previsaoConclusao || pedidoAtualizado.previsao_conclusao,
        cliente_notificado: pedidoAtualizado.clienteNotificado || pedidoAtualizado.cliente_notificado
      })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar no Supabase:", error.message);
    }
  } catch (err) {
    console.error("Erro de conexão ao atualizar:", err);
  }
}

// --- SUAS FUNÇÕES ORIGINAIS (Agora com suporte ao Supabase) ---

async function listarPedidosConfirmados() {
  const pedidos = await listarPedidos();
  const confirmados = [];
  for (let i = 0; i < pedidos.length; i++) {
    const status = pedidos[i].status_atual || pedidos[i].statusAtual;
    if (status === FITZZ.statusPedido.CONFIRMADO) {
      confirmados.push(pedidos[i]);
    }
  }
  return confirmados;
}

async function aceitarPedido(identificador, minutosPrevisao) {
  const pedido = await buscarPedidoPorId(identificador);
  if (pedido === null) return;

  const previsao = new Date(Date.now() + minutosPrevisao * 60000);
  pedido.previsaoConclusao = previsao.toISOString();
  await atualizarPedido(pedido);
}

async function iniciarPreparoPedido(identificador) {
  const pedido = await buscarPedidoPorId(identificador);
  if (pedido === null) return;

  pedido.statusAtual = FITZZ.statusPedido.EM_PREPARACAO;
  await atualizarPedido(pedido);
}

async function finalizarPreparoPedido(identificador) {
  const pedido = await buscarPedidoPorId(identificador);
  if (pedido === null) return;

  const forma = pedido.forma_recebimento || pedido.formaRecebimento;
  if (forma === FITZZ.formaRecebimento.ENTREGA) {
    pedido.statusAtual = FITZZ.statusPedido.SAIU_PARA_ENTREGA;
  } else {
    pedido.statusAtual = FITZZ.statusPedido.PRONTO_PARA_RETIRADA;
  }
  await atualizarPedido(pedido);
}

async function notificarClientePedido(identificador) {
  const pedido = await buscarPedidoPorId(identificador);
  if (pedido === null) return;

  pedido.clienteNotificado = true;
  await atualizarPedido(pedido);
}

async function finalizarAtendimentoPedido(identificador) {
  const pedido = await buscarPedidoPorId(identificador);
  if (pedido === null) return;

  const forma = pedido.forma_recebimento || pedido.formaRecebimento;
  if (forma === FITZZ.formaRecebimento.ENTREGA) {
    pedido.statusAtual = FITZZ.statusPedido.ENTREGUE;
  } else {
    pedido.statusAtual = FITZZ.statusPedido.RETIRADO;
  }
  await atualizarPedido(pedido);
}