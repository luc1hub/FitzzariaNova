const parametrosConfirmacao = new URLSearchParams(window.location.search);
const codigoPedidoConfirmado = parametrosConfirmacao.get("pedido");

if (codigoPedidoConfirmado) {
  const pedido = buscarPedidoPorId(codigoPedidoConfirmado);
  if (pedido) {
    document.getElementById("pedido-numero").textContent = "#" + pedido.identificador;
    document.getElementById("pedido-status").textContent = FITZZ.statusLabel[pedido.statusAtual];
  }
}

document.getElementById("btnAcompanhar").addEventListener("click", function () {
  window.location.href = "acompanhamento.html?pedido=" + codigoPedidoConfirmado;
});
