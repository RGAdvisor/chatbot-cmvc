// script.js
const chatContainer = document.getElementById("chat-container");
const textarea = document.getElementById("domanda");

// DOMANDE FISSE
const domandeFisse = {
  button1: "Come posso prenotare una visita?",
  button2: "Quali sono i vostri orari?",
  button3: "Dove si trova il Centro?",
  button4: "Quali servizi fornite?"
};

Object.keys(domandeFisse).forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    inviaDomanda(domandeFisse[id]);
  });
});

textarea.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const domanda = textarea.value.trim();
    if (domanda) {
      inviaDomanda(domanda);
      textarea.value = "";
    }
  }
});

function aggiungiMessaggioTesto(testo, classe) {
  const div = document.createElement("div");
  div.className = classe;
  div.innerHTML = testo;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function inviaDomanda(domanda) {
  aggiungiMessaggioTesto(domanda, "user-message");

  const response = await fetch("/.netlify/functions/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domanda })
  });

  const data = await response.json();
  aggiungiMessaggioTesto(data.risposta, "gpt-response");
}
