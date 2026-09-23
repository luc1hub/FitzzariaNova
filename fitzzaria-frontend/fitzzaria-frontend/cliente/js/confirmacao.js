const parametrosConfirmacao = new URLSearchParams(window.location.search);
const codigoPedidoConfirmado = parametrosConfirmacao.get("pedido");

if (codigoPedidoConfirmado) {
  // Preenche o número do pedido imediatamente na tela
  document.getElementById("pedido-numero").textContent = "#" + codigoPedidoConfirmado;

  // Busca os dados do pedido no Supabase
  window.supabaseClient
    .from('pedidos')
    .select('*')
    .eq('id', codigoPedidoConfirmado)
    .single()
    .then(({ data: pedido, error }) => {
      if (pedido && !error) {
        // Se encontrar o status no FITZZ, exibe. Se não, exibe CONFIRMADO
        const statusTexto = (typeof FITZZ !== 'undefined' && FITZZ.statusLabel && FITZZ.statusLabel[pedido.status])
          ? FITZZ.statusLabel[pedido.status]
          : "CONFIRMADO";

        document.getElementById("pedido-status").textContent = statusTexto;
      }
    });
}

const btnAcompanhar = document.getElementById("btnAcompanhar");
if (btnAcompanhar) {
  btnAcompanhar.addEventListener("click", function () {
    window.location.href = "acompanhamento.html?pedido=" + codigoPedidoConfirmado;
  });
}