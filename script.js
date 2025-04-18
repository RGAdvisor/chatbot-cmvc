// script.js

const chatContainer = document.getElementById("chat-container");
const domandaInput = document.getElementById("domanda");
const inviaBtn = document.getElementById("invia-btn");

// Funzione per creare e aggiungere messaggi con alternanza (utente / GPT)
function aggiungiMessaggio(testo, classe) {
  const messaggioWrapper = document.createElement("div");
  messaggioWrapper.className = classe;

  const messaggio = document.createElement("div");
  messaggio.className = "messaggio-bolla";
  messaggio.innerText = testo;

  messaggioWrapper.appendChild(messaggio);
  chatContainer.appendChild(messaggioWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function inviaDomanda(testoDomanda) {
  aggiungiMessaggio(testoDomanda, "user-message");

  try {
    const risposta = await fetch("/.netlify/functions/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domanda: testoDomanda }),
    });

    const dati = await risposta.json();
    if (dati.risposta) {
      aggiungiMessaggio(dati.risposta, "gpt-response");
    } else {
      aggiungiMessaggio("Errore nella risposta.", "gpt-response");
    }
  } catch (errore) {
    aggiungiMessaggio("Errore durante la richiesta.", "gpt-response");
  }
}

// Event listener per il bottone Invia
inviaBtn.addEventListener("click", () => {
  const testoDomanda = domandaInput.value.trim();
  if (testoDomanda !== "") {
    inviaDomanda(testoDomanda);
    domandaInput.value = "";
  }
});

// Event listener per il tasto Invio
domandaInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    inviaBtn.click();
  }
});

// Bottoni rapidi
const bottoniRapidi = document.querySelectorAll(".quick-question");
bottoniRapidi.forEach((bottone) => {
  bottone.addEventListener("click", () => {
    inviaDomanda(bottone.innerText);
  });
});
