document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const domandaInput = document.getElementById("domanda");
  const inviaBtn = document.getElementById("invia");

  const bottoniFissi = document.querySelectorAll(".button-group button");

  bottoniFissi.forEach((bottone) => {
    bottone.addEventListener("click", () => {
      const domanda = bottone.textContent;
      aggiungiMessaggioUtente(domanda);
      inviaDomanda(domanda);
    });
  });

  inviaBtn.addEventListener("click", () => {
    const domanda = domandaInput.value.trim();
    if (domanda) {
      aggiungiMessaggioUtente(domanda);
      inviaDomanda(domanda);
      domandaInput.value = "";
    }
  });

  function aggiungiMessaggioUtente(testo) {
    const div = document.createElement("div");
    div.className = "user-message";
    div.textContent = testo;
    chatContainer.appendChild(div);
  }

  function aggiungiRispostaAssistant(testo) {
    const div = document.createElement("div");
    div.className = "gpt-response";
    div.textContent = testo;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function inviaDomanda(domanda) {
    try {
      const response = await fetch("/.netlify/functions/chatgpt", {
        method: "POST",
        body: JSON.stringify({ domanda }),
      });

      const data = await response.json();

      if (data.risposta) {
        aggiungiRispostaAssistant(data.risposta);
      } else {
        aggiungiRispostaAssistant("Mi scuso, non sono in grado di rispondere ora.");
      }
    } catch (error) {
      aggiungiRispostaAssistant("Errore: non riesco a contattare il server.");
    }
  }
});
