let produtoSelecionado = null;
let opcoesEscolhidas = [];
let tamanhoEscolhido = null;
let quantidadeEscolhida = 1;

function redirecionarSeFormaNaoEscolhida() {
  const carrinho = obterCarrinho();
  if (!carrinho.formaRecebimento) {
    window.location.href = "boas-vindas.html";
  }
}

function atualizarContadorCarrinho() {
  document.getElementById("cart-count").textContent = contarItensCarrinho();
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

  document.getElementById("filtro-todas").checked = categoriasSelecionadas.length === 0;

  renderizarCardapio(categoriasSelecionadas, faixasSelecionadas);
}

function renderizarCardapio(categoriasSelecionadas, faixasSelecionadas) {
  let html = "";

  for (let i = 0; i < FITZZ.produtos.length; i++) {
    const produto = FITZZ.produtos[i];

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
    html += "<div class=\"preco\">" + formatarPreco(produto.precoBase) + "</div>";
    html += "</div>";
    html += "</button>";
  }

  document.getElementById("cardapio-container").innerHTML = html;
}

function abrirModalProduto(idProduto) {
  produtoSelecionado = buscarProduto(idProduto);
  opcoesEscolhidas = [];
  tamanhoEscolhido = null;
  quantidadeEscolhida = 1;

  document.getElementById("produtoModalNome").textContent = produtoSelecionado.nome;
  document.getElementById("produtoModalFoto").src = produtoSelecionado.imagem;
  document.getElementById("produtoModalFoto").alt = produtoSelecionado.nome;
  document.getElementById("produtoModalDescricao").textContent = produtoSelecionado.descricao;
  document.getElementById("qtyValor").textContent = "1";
  document.getElementById("btnAdicionarCarrinho").disabled = true;

  const opcoes = buscarOpcoesDoProduto(produtoSelecionado.idProduto);
  const opcoesContainer = document.getElementById("produtoModalOpcoes");

  if (opcoes.length === 0) {
    opcoesContainer.innerHTML = "";
  } else {
    let html = "<p class=\"fw-semibold mb-2 mt-3\">Personalização (opcional)</p>";
    for (let i = 0; i < opcoes.length; i++) {
      const opcao = opcoes[i];
      let precoTexto = "sem custo";
      if (opcao.valorAdicional > 0) {
        precoTexto = "+ " + formatarPreco(opcao.valorAdicional);
      }
      html += "<label class=\"opcao-row\">";
      html += "<span><input class=\"form-check-input me-2\" type=\"checkbox\" onchange=\"alternarOpcao(" + opcao.idOpcao + ", this.checked)\"> " + opcao.nome + "</span>";
      html += "<span>" + precoTexto + "</span>";
      html += "</label>";
    }
    opcoesContainer.innerHTML = html;
  }

  let htmlTamanho = "";
  for (let i = 0; i < FITZZ.tamanhos.length; i++) {
    const tamanho = FITZZ.tamanhos[i];
    htmlTamanho += "<div class=\"form-check\">";
    htmlTamanho += "<input class=\"form-check-input\" type=\"radio\" name=\"tamanho\" id=\"tamanho-" + i + "\" onchange=\"escolherTamanho('" + tamanho + "')\">";
    htmlTamanho += "<label class=\"form-check-label\" for=\"tamanho-" + i + "\">" + tamanho + "</label>";
    htmlTamanho += "</div>";
  }
  document.getElementById("produtoModalTamanho").innerHTML = htmlTamanho;

  atualizarPrecoModal();
  new bootstrap.Modal(document.getElementById("produtoModal")).show();
}

function escolherTamanho(tamanho) {
  tamanhoEscolhido = tamanho;
  document.getElementById("btnAdicionarCarrinho").disabled = false;
}

function alternarOpcao(idOpcao, marcado) {
  const opcao = buscarOpcaoPersonalizacao(idOpcao);

  if (marcado) {
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
  let precoUnitario = produtoSelecionado.precoBase;
  for (let i = 0; i < opcoesEscolhidas.length; i++) {
    precoUnitario = precoUnitario + opcoesEscolhidas[i].valorAdicional;
  }
  document.getElementById("produtoModalPrecoTotal").textContent = formatarPreco(precoUnitario * quantidadeEscolhida);
}

function confirmarAdicionarAoCarrinho() {
  adicionarItemCarrinho(produtoSelecionado.idProduto, quantidadeEscolhida, tamanhoEscolhido, opcoesEscolhidas);
  atualizarContadorCarrinho();
  bootstrap.Modal.getInstance(document.getElementById("produtoModal")).hide();
  new bootstrap.Toast(document.getElementById("toastAdicionado")).show();
}

redirecionarSeFormaNaoEscolhida();
aplicarFiltros();
atualizarContadorCarrinho();
