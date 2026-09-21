let formaEscolhidaNaEntrada = null;

function escolherEntrega() {
  formaEscolhidaNaEntrada = FITZZ.formaRecebimento.ENTREGA;
  document.getElementById("cardEntrega").classList.add("selected");
  document.getElementById("cardRetirada").classList.remove("selected");
  document.getElementById("btnContinuar").disabled = false;
}

function escolherRetirada() {
  formaEscolhidaNaEntrada = FITZZ.formaRecebimento.RETIRADA;
  document.getElementById("cardRetirada").classList.add("selected");
  document.getElementById("cardEntrega").classList.remove("selected");
  document.getElementById("btnContinuar").disabled = false;
}

function continuar() {
  definirFormaRecebimento(formaEscolhidaNaEntrada);

  if (formaEscolhidaNaEntrada === FITZZ.formaRecebimento.ENTREGA) {
    window.location.href = "localizacao.html";
  } else {
    window.location.href = "index.html";
  }
}
