function rispostaFissa(tipo) {
  const box = document.getElementById("risposta-fissa");
  if (tipo === "prenotazione") {
    box.innerHTML = "📅 Puoi prenotare una visita chiamando il 0332 624820 o scrivendo a segreteria@csvcuvio.it.";
  } else if (tipo === "orari") {
    box.innerHTML = "🕒 Siamo aperti dal lunedì al venerdì dalle 8:30 alle 19:00.";
  } else if (tipo === "dove") {
    box.innerHTML = "📍 Ci trovi in Via Enrico Fermi, 6 – 21030 Cuvio (VA).";
  } else if (tipo === "servizi") {
    box.innerHTML = "🏥 Il centro offre prestazioni dentistiche e polispecialistiche: ginecologia, cardiologia, dietologia, fisioterapia...";
  }
}

function inviaDomanda() {
  const domanda = document.getElementById("domanda").value.trim();
  const container = document.getElementById("chat-container");

  if (domanda === "") return;

  const utente = document.createElement("div");
  utente.className = "user";
  utente.textContent = domanda;
  container.appendChild(utente);

  const bot = document.createElement("div");
  bot.className = "bot";
  bot.textContent = "Grazie per la domanda! Ti risponderemo al più presto 😊";
  container.appendChild(bot);

  document.getElementById("domanda").value = "";
  container.scrollTop = container.scrollHeight;
}
