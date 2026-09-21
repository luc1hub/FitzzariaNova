const API_BASE_URL = 'https://fitzzariabackend.infy.click/fitzzaria-backend/api';

// Função assíncrona que envia o pedido para o MySQL no InfinityFree
async function salvarPedidoNoBanco(pedido) {
  try {
    const resposta = await fetch(`${API_BASE_URL}/pedidos.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });

    if (resposta.ok) {
      const resultado = await resposta.json();
      console.log('Pedido gravado no banco de dados com sucesso:', resultado);
    } else {
      console.warn('Servidor respondeu com status:', resposta.status);
    }
  } catch (erro) {
    console.error('Erro ao enviar pedido para o banco:', erro);
  }
}

function listarPedidos() {
  const texto = localStorage.getItem("pedidos");
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

function salvarListaPedidos(pedidos) {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function buscarPedidoPorId(identificador) {
  const pedidos = listarPedidos();
  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].identificador === identificador) {
      return pedidos[i];
    }
  }
  return null;
}

function atualizarPedido(pedidoAtualizado) {
  const pedidos = listarPedidos();
  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].identificador === pedidoAtualizado.identificador) {
      pedidos[i] = pedidoAtualizado;
    }
  }
  salvarListaPedidos(pedidos);
}

function gerarIdentificadorPedido() {
  const numero = Math.floor(100000 + Math.random() * 899999);
  return "FTZ" + numero;
}

function criarPedido(dadosPedido) {
  let nomeRegiao = null;
  if (dadosPedido.idRegiaoEntrega) {
    const regiao = buscarRegiaoEntrega(dadosPedido.idRegiaoEntrega);
    if (regiao !== null) {
      nomeRegiao = regiao.nome;
    }
  }

  const formaPagamento = buscarFormaPagamento(dadosPedido.idFormaPagamento);

  const pedido = {
    identificador: gerarIdentificadorPedido(),
    dataHora: new Date().toISOString(),
    itens: dadosPedido.itens,
    subtotal: dadosPedido.subtotal,
    taxaEntrega: dadosPedido.taxaEntrega,
    valorTotal: dadosPedido.valorTotal,
    formaRecebimento: dadosPedido.formaRecebimento,
    regiaoEntrega: nomeRegiao,
    cep: dadosPedido.cep,
    formaPagamento: formaPagamento ? formaPagamento.descricao : null,
    statusAtual: FITZZ.statusPedido.CONFIRMADO,
    previsaoConclusao: null,
    clienteNotificado: false
  };

  const pedidos = listarPedidos();
  pedidos.push(pedido);
  salvarListaPedidos(pedidos);

  // Envia o pedido criado em segundo plano para o banco MySQL do InfinityFree
  salvarPedidoNoBanco(pedido);

  return pedido;
}

function listarPedidosConfirmados() {
  const pedidos = listarPedidos();
  const confirmados = [];
  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].statusAtual === FITZZ.statusPedido.CONFIRMADO) {
      confirmados.push(pedidos[i]);
    }
  }
  return confirmados;
}

function aceitarPedido(identificador, minutosPrevisao) {
  const pedido = buscarPedidoPorId(identificador);
  if (pedido === null) {
    return;
  }
  const previsao = new Date(Date.now() + minutosPrevisao * 60000);
  pedido.previsaoConclusao = previsao.toISOString();
  atualizarPedido(pedido);
}

function iniciarPreparoPedido(identificador) {
  const pedido = buscarPedidoPorId(identificador);
  if (pedido === null) {
    return;
  }
  pedido.statusAtual = FITZZ.statusPedido.EM_PREPARACAO;
  atualizarPedido(pedido);
}

function finalizarPreparoPedido(identificador) {
  const pedido = buscarPedidoPorId(identificador);
  if (pedido === null) {
    return;
  }
  if (pedido.formaRecebimento === FITZZ.formaRecebimento.ENTREGA) {
    pedido.statusAtual = FITZZ.statusPedido.SAIU_PARA_ENTREGA;
  } else {
    pedido.statusAtual = FITZZ.statusPedido.PRONTO_PARA_RETIRADA;
  }
  atualizarPedido(pedido);
}

function notificarClientePedido(identificador) {
  const pedido = buscarPedidoPorId(identificador);
  if (pedido === null) {
    return;
  }
  pedido.clienteNotificado = true;
  atualizarPedido(pedido);
}

function finalizarAtendimentoPedido(identificador) {
  const pedido = buscarPedidoPorId(identificador);
  if (pedido === null) {
    return;
  }
  if (pedido.formaRecebimento === FITZZ.formaRecebimento.ENTREGA) {
    pedido.statusAtual = FITZZ.statusPedido.ENTREGUE;
  } else {
    pedido.statusAtual = FITZZ.statusPedido.RETIRADO;
  }
  atualizarPedido(pedido);
}