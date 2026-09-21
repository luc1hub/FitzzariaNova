const FITZZ = {

  estabelecimento: {
    nome: "Fitzzaria",
    abertoParaPedidos: true,
    telefone: "11999998888"
  },

  produtos: [
    { idProduto: 1, categoria: "Fit", nome: "Frango Integral", descricao: "Massa integral, peito de frango desfiado, ricota temperada, tomate cereja e orégano", precoBase: 42.9, disponivel: true, personalizavel: true, imagem: "img/pizza-2.jpg" },
    { idProduto: 2, categoria: "Low Carb", nome: "Low Carb Abobrinha", descricao: "Base de abobrinha grelhada no lugar da massa tradicional, recheio de queijos e ervas", precoBase: 44.9, disponivel: true, personalizavel: true, imagem: "img/pizza-3.jpg" },
    { idProduto: 3, categoria: "Fit", nome: "Quatro Queijos Light", descricao: "Blend de queijos com menor teor de gordura sobre massa integral", precoBase: 47.9, disponivel: true, personalizavel: true, imagem: "img/pizza-1.jpg" },
    { idProduto: 4, categoria: "Fit", nome: "Salmão Defumado", descricao: "Salmão defumado, cream cheese light e alcaparras", precoBase: 49.9, disponivel: true, personalizavel: true, imagem: "img/pizza-3.jpg" },
    { idProduto: 5, categoria: "Vegana", nome: "Vegana Grão de Bico", descricao: "Massa de grão-de-bico, queijo vegano e vegetais grelhados", precoBase: 46.9, disponivel: true, personalizavel: true, imagem: "img/pizza-1.jpg" },
    { idProduto: 6, categoria: "Fit", nome: "Rúcula com Parma", descricao: "Presunto parma, rúcula fresca e lascas de parmesão light, finalizada crua", precoBase: 49.9, disponivel: true, personalizavel: true, imagem: "img/pizza-2.jpg" }
  ],

  opcoesPersonalizacao: [
    { idOpcao: 1, nome: "Extra Queijo", valorAdicional: 6.0 },
    { idOpcao: 2, nome: "Sem cebola", valorAdicional: 0 },
    { idOpcao: 3, nome: "Borda Recheada", valorAdicional: 8.0 }
  ],

  tamanhos: ["Média", "Grande"],

  regioesEntrega: [
    { idRegiao: 1, nome: "Centro", taxaFixa: 5.0 },
    { idRegiao: 2, nome: "Zona Sul", taxaFixa: 8.0 },
    { idRegiao: 3, nome: "Zona Norte", taxaFixa: 8.0 },
    { idRegiao: 4, nome: "Zona Leste", taxaFixa: 10.0 }
  ],

  formasPagamento: [
    { idFormaPagamento: 1, descricao: "Cartão de crédito" },
    { idFormaPagamento: 2, descricao: "Pix" },
    { idFormaPagamento: 3, descricao: "Dinheiro" }
  ],

  statusPedido: {
    CONFIRMADO: "CONFIRMADO",
    EM_PREPARACAO: "EM_PREPARACAO",
    PRONTO_PARA_RETIRADA: "PRONTO_PARA_RETIRADA",
    SAIU_PARA_ENTREGA: "SAIU_PARA_ENTREGA",
    RETIRADO: "RETIRADO",
    ENTREGUE: "ENTREGUE"
  },

  statusLabel: {
    CONFIRMADO: "Confirmado",
    EM_PREPARACAO: "Em preparação",
    PRONTO_PARA_RETIRADA: "Pronto para retirada",
    SAIU_PARA_ENTREGA: "Saiu para entrega",
    RETIRADO: "Retirado",
    ENTREGUE: "Entregue"
  },

  formaRecebimento: {
    RETIRADA: "RETIRADA",
    ENTREGA: "ENTREGA"
  }
};

function buscarProduto(idProduto) {
  for (let i = 0; i < FITZZ.produtos.length; i++) {
    if (FITZZ.produtos[i].idProduto === Number(idProduto)) {
      return FITZZ.produtos[i];
    }
  }
  return null;
}

function buscarOpcoesDoProduto(idProduto) {
  const produto = buscarProduto(idProduto);
  if (produto === null || produto.personalizavel === false) {
    return [];
  }
  return FITZZ.opcoesPersonalizacao;
}

function buscarOpcaoPersonalizacao(idOpcao) {
  for (let i = 0; i < FITZZ.opcoesPersonalizacao.length; i++) {
    if (FITZZ.opcoesPersonalizacao[i].idOpcao === Number(idOpcao)) {
      return FITZZ.opcoesPersonalizacao[i];
    }
  }
  return null;
}

function buscarRegiaoEntrega(idRegiao) {
  for (let i = 0; i < FITZZ.regioesEntrega.length; i++) {
    if (FITZZ.regioesEntrega[i].idRegiao === Number(idRegiao)) {
      return FITZZ.regioesEntrega[i];
    }
  }
  return null;
}

function buscarFormaPagamento(idFormaPagamento) {
  for (let i = 0; i < FITZZ.formasPagamento.length; i++) {
    if (FITZZ.formasPagamento[i].idFormaPagamento === Number(idFormaPagamento)) {
      return FITZZ.formasPagamento[i];
    }
  }
  return null;
}

function calcularRegiaoPorCep(cep) {
  let soma = 0;
  for (let i = 0; i < cep.length; i++) {
    const digito = Number(cep[i]);
    if (!isNaN(digito)) {
      soma = soma + digito;
    }
  }
  const posicao = soma % FITZZ.regioesEntrega.length;
  return FITZZ.regioesEntrega[posicao];
}

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
