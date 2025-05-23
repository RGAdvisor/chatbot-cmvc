const chatContainer = document.getElementById("chat-container");
const textarea = document.getElementById("domanda");

const domandeFisse = {
  button1: "Come posso prenotare una visita?",
  button2: "Quali sono i vostri orari?",
  button3: "Dove si trova il Centro?",
  button4: "Quali servizi fornite?"
};

// Bottoni domande fisse
Object.keys(domandeFisse).forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    inviaDomanda(domandeFisse[id], true);
  });
});

// Gestione invio textarea
textarea.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const domanda = textarea.value.trim();
    if (domanda) {
      inviaDomanda(domanda, false);
      textarea.value = "";
    }
  }
});

// Aggiunge messaggi in chat
function aggiungiMessaggioTesto(testo, classe) {
  const div = document.createElement("div");
  div.className = classe;
  div.innerHTML = testo;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Invia la domanda
async function inviaDomanda(domanda, èFissa) {
  if (!èFissa) {
    aggiungiMessaggioTesto(domanda, "user-message");
  }

  const domandaLower = domanda.toLowerCase();

  // Risposte fisse
  if (domandaLower.includes("quali servizi fornite")) {
    const rispostaServizi = "Il nostro centro è organizzato in due divisioni: <strong>dentale</strong> e <strong>polispecialistica</strong>. <br>Puoi consultare l’elenco completo dei servizi scaricando le brochure disponibili in fondo alla chat.";
    aggiungiMessaggioTesto(rispostaServizi, "gpt-response");
    return;
  }

  if (domandaLower.includes("come posso prenotare una visita")) {
    const rispostaPrenotazione = "Per prenotare una visita presso il nostro centro, puoi contattare la nostra segreteria al numero 📞 0332 624820 o inviare una email a 📧 segreteria@csvcuvio.it. In alternativa, puoi recarti di persona presso la nostra sede in Via Enrico Fermi, 6 a Cuvio (VA). Siamo a tua disposizione per qualsiasi ulteriore informazione!";
    aggiungiMessaggioTesto(rispostaPrenotazione, "gpt-response");
    return;
  }

  if (domandaLower.includes("quali sono i vostri orari")) {
    const rispostaOrari = "I nostri orari di apertura sono: <br>- Lunedì: 9:00-13:00 / 14:00-19:00<br>- Martedì: 14:00-19:00<br>- Mercoledì: 9:00-13:00 / 14:00-19:00<br>- Giovedì: 9:00-13:00<br>- Venerdì: 9:00-13:00 / 14:00-19:00<br>- Sabato: 10:00-14:00<br>- Domenica: chiuso";
    aggiungiMessaggioTesto(rispostaOrari, "gpt-response");
    return;
  }

  if (domandaLower.includes("dove si trova il centro")) {
    const rispostaIndirizzo = "Il nostro centro si trova in Via Enrico Fermi, 6 a Cuvio, in provincia di Varese.";
    aggiungiMessaggioTesto(rispostaIndirizzo, "gpt-response");
    return;
  }

  // Chiamata API
  try {
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domanda })
    });

    if (!response.ok) {
      throw new Error("Errore nella richiesta al server.");
    }

    const data = await response.json();
    aggiungiMessaggioTesto(data.risposta, "gpt-response");

  } catch (err) {
    aggiungiMessaggioTesto("Si è verificato un errore. Riprova più tardi.", "gpt-response");
    console.error("Errore nella chiamata GPT:", err);
  }
}
