const chatContainer = document.getElementById("chat-container");
const textarea = document.getElementById("domanda");
const csvButton = document.createElement("button");
csvButton.className = "download-button";
csvButton.innerHTML = "📄 SCARICA ELENCO PRESTAZIONI CSV";
csvButton.onclick = () => {
  window.open(
    "https://drive.google.com/uc?export=download&id=1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD",
    "_blank"
  );
};

let csvButtonShown = false;

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

  const response = await fetch("/.netlify/functions/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domanda })
  });

  const data = await response.json();
  aggiungiMessaggioTesto(data.risposta, "gpt-response");

  // Mostra bottone CSV una sola volta
  if (!csvButtonShown) {
    chatContainer.appendChild(csvButton);
    csvButtonShown = true;
  }
}
