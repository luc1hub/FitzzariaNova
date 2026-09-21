let produtoSelecionado = null;
let opcoesEscolhidas = [];
let tamanhoEscolhido = null;
let quantidadeEscolhida = 1;

function redirecionarSeFormaNaoEscolhida() {
  const carrinho = typeof obterCarrinho === 'function' ? obterCarrinho() : null;
  if (carrinho && !carrinho.formaRecebimento) {
    window.location.href = "boas-vindas.html";
  }
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById("cart-count");
  if (contador && typeof contarItensCarrinho === 'function') {
    contador.textContent = contarItensCarrinho();
  }
}

function categoriaEstaSelecionada(categoriasSelecionadas, categoriaProduto) {
  if (categoriasSelecionadas.length === 0) {
    return true;
  }
  for (let i = 0; i < categoriasSelecionadas.length; i++) {
    if (categoriasSelecionadas[i] === categoriaProduto) {
      return true;
    }
  }
  return false;
}

function precoEstaNaFaixaSelecionada(faixasSelecionadas, preco) {
  if (faixasSelecionadas.length === 0) {
    return true;
  }
  for (let i = 0; i < faixasSelecionadas.length; i++) {
    const faixa = faixasSelecionadas[i];
    if (faixa === "ate45" && preco <= 45) {
      return true;
    }
    if (faixa === "45a50" && preco > 45 && preco <= 50) {
      return true;
    }
    if (faixa === "acima50" && preco > 50) {
      return true;
    }
  }
  return false;
}

function obterValoresMarcados(seletor) {
  const valores = [];
  const elementos = document.querySelectorAll(seletor + ":checked");
  for (let i = 0; i < elementos.length; i++) {
    valores.push(elementos[i].value);
  }
  return valores;
}

function alternarFiltroTodas() {
  const marcarTodas = document.getElementById("filtro-todas").checked;
  if (marcarTodas) {
    const categorias = document.querySelectorAll(".filtro-categoria");
    for (let i = 0; i < categorias.length; i++) {
      categorias[i].checked = false;
    }
  }
  aplicarFiltros();
}

function aplicarFiltros() {
  const categoriasSelecionadas = obterValoresMarcados(".filtro-categoria");
  const faixasSelecionadas = obterValoresMarcados(".filtro-preco");

  const filtroTodas = document.getElementById("filtro-todas");
  if (filtroTodas) {
    filtroTodas.checked = categoriasSelecionadas.length === 0;
  }

  renderizarCardapio(categoriasSelecionadas, faixasSelecionadas);
}

function renderizarCardapio(categoriasSelecionadas, faixasSelecionadas) {
  let html = "";
  const produtos = (typeof FITZZ !== 'undefined' && FITZZ.produtos) ? FITZZ.produtos : [];

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];

    if (!categoriaEstaSelecionada(categoriasSelecionadas, produto.categoria)) {
      continue;
    }
    if (!precoEstaNaFaixaSelecionada(faixasSelecionadas, produto.precoBase)) {
      continue;
    }

    if (produto.disponivel) {
      html += "<button type=\"button\" class=\"produto-card\" onclick=\"abrirModalProduto(" + produto.idProduto + ")\">";
    } else {
      html += "<button type=\"button\" class=\"produto-card is-unavailable\" disabled>";
    }

    html += "<div class=\"foto\"><img src=\"" + produto.imagem + "\" alt=\"" + produto.nome + "\"></div>";
    html += "<div class=\"info\">";
    html += "<div class=\"nome\">" + produto.nome + "</div>";
    html += "<div class=\"preco\">" + (typeof formatarPreco === 'function' ? formatarPreco(produto.precoBase) : 'R$ ' + produto.precoBase) + "</div>";
    html += "</div>";
    html += "</button>";
  }

  const container = document.getElementById("cardapio-container");
  if (container) {
    container.innerHTML = html;
  }
}

function abrirModalProduto(idProduto) {
  produtoSelecionado = typeof buscarProduto === 'function' ? buscarProduto(idProduto) : null;
  if (!produtoSelecionado) return;

  opcoesEscolhidas = [];
  tamanhoEscolhido = null;
  quantidadeEscolhida = 1;

  document.getElementById("produtoModalNome").textContent = produtoSelecionado.nome;
  document.getElementById("produtoModalFoto").src = produtoSelecionado.imagem;
  document.getElementById("produtoModalFoto").alt = produtoSelecionado.nome;
  document.getElementById("produtoModalDescricao").textContent = produtoSelecionado.descricao;
  document.getElementById("qtyValor").textContent = "1";

  const opcoes = typeof buscarOpcoesDoProduto === 'function' ? buscarOpcoesDoProduto(produtoSelecionado.idProduto) : [];
  const opcoesContainer = document.getElementById("produtoModalOpcoes");

  if (opcoes.length === 0) {
    opcoesContainer.innerHTML = "";
  } else {
    let html = "<p class=\"fw-semibold mb-2 mt-3\">Personalização (opcional)</p>";
    for (let i = 0; i < opcoes.length; i++) {
      const opcao = opcoes[i];
      let precoTexto = "sem custo";
      if (opcao.valorAdicional > 0) {
        precoTexto = "+ " + (typeof formatarPreco === 'function' ? formatarPreco(opcao.valorAdicional) : 'R$ ' + opcao.valorAdicional);
      }
      html += "<label class=\"opcao-row\">";
      html += "<span><input class=\"form-check-input me-2\" type=\"checkbox\" onchange=\"alternarOpcao(" + opcao.idOpcao + ", this.checked)\"> " + opcao.nome + "</span>";
      html += "<span>" + precoTexto + "</span>";
      html += "</label>";
    }
    opcoesContainer.innerHTML = html;
  }

  const tamanhos = (typeof FITZZ !== 'undefined' && FITZZ.tamanhos) ? FITZZ.tamanhos : ["Média", "Grande"];
  let htmlTamanho = "";
  for (let i = 0; i < tamanhos.length; i++) {
    const tamanho = tamanhos[i];
    const checado = i === 0 ? "checked" : "";
    if (i === 0) tamanhoEscolhido = tamanho;

    htmlTamanho += "<div class=\"form-check\">";
    htmlTamanho += "<input class=\"form-check-input\" type=\"radio\" name=\"tamanho\" id=\"tamanho-" + i + "\" value=\"" + tamanho + "\" " + checado + " onchange=\"escolherTamanho('" + tamanho + "')\">";
    htmlTamanho += "<label class=\"form-check-label\" for=\"tamanho-" + i + "\">" + tamanho + "</label>";
    htmlTamanho += "</div>";
  }
  document.getElementById("produtoModalTamanho").innerHTML = htmlTamanho;

  // Libera o botão de adicionar ao carrinho imediatamente
  const btnAdd = document.getElementById("btnAdicionarCarrinho");
  if (btnAdd) {
    btnAdd.disabled = false;
  }

  atualizarPrecoModal();
  new bootstrap.Modal(document.getElementById("produtoModal")).show();
}

function escolherTamanho(tamanho) {
  tamanhoEscolhido = tamanho;
  const btnAdd = document.getElementById("btnAdicionarCarrinho");
  if (btnAdd) {
    btnAdd.disabled = false;
  }
  atualizarPrecoModal();
}

function alternarOpcao(idOpcao, marcado) {
  const opcao = typeof buscarOpcaoPersonalizacao === 'function' ? buscarOpcaoPersonalizacao(idOpcao) : null;

  if (marcado && opcao) {
    opcoesEscolhidas.push(opcao);
  } else {
    const novaLista = [];
    for (let i = 0; i < opcoesEscolhidas.length; i++) {
      if (opcoesEscolhidas[i].idOpcao !== idOpcao) {
        novaLista.push(opcoesEscolhidas[i]);
      }
    }
    opcoesEscolhidas = novaLista;
  }

  atualizarPrecoModal();
}

function aumentarQuantidadeModal() {
  quantidadeEscolhida = quantidadeEscolhida + 1;
  document.getElementById("qtyValor").textContent = quantidadeEscolhida;
  atualizarPrecoModal();
}

function diminuirQuantidadeModal() {
  if (quantidadeEscolhida > 1) {
    quantidadeEscolhida = quantidadeEscolhida - 1;
  }
  document.getElementById("qtyValor").textContent = quantidadeEscolhida;
  atualizarPrecoModal();
}

function atualizarPrecoModal() {
  if (!produtoSelecionado) return;
  let precoUnitario = produtoSelecionado.precoBase;
  for (let i = 0; i < opcoesEscolhidas.length; i++) {
    precoUnitario = precoUnitario + opcoesEscolhidas[i].valorAdicional;
  }
  const precoTotalElem = document.getElementById("produtoModalPrecoTotal");
  if (precoTotalElem) {
    precoTotalElem.textContent = typeof formatarPreco === 'function' 
      ? formatarPreco(precoUnitario * quantidadeEscolhida) 
      : "R$ " + (precoUnitario * quantidadeEscolhida).toFixed(2);
  }
}

function confirmarAdicionarAoCarrinho() {
  if (typeof adicionarItemCarrinho === 'function') {
    adicionarItemCarrinho(produtoSelecionado.idProduto, quantidadeEscolhida, tamanhoEscolhido, opcoesEscolhidas);
  }
  atualizarContadorCarrinho();
  
  const modalElem = document.getElementById("produtoModal");
  if (modalElem) {
    const instance = bootstrap.Modal.getInstance(modalElem);
    if (instance) instance.hide();
  }
  
  const toastElem = document.getElementById("toastAdicionado");
  if (toastElem) {
    new bootstrap.Toast(toastElem).show();
  }
}

redirecionarSeFormaNaoEscolhida();
aplicarFiltros();
atualizarContadorCarrinho();