function confirmarLocalizacao() {
  const cepDigitado = document.getElementById("inputCep").value.replace(/\D/g, "");

  if (cepDigitado.length !== 8) {
    document.getElementById("msgCepInvalido").classList.remove("d-none");
    return;
  }

  definirCepEntrega(cepDigitado);
  window.location.href = "index.html";
}
