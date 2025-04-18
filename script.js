
  // Aggiungi evento ai bottoni rapidi
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const domanda = btn.textContent.trim();
      inviaDomanda(domanda);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const domanda = domandaInput.value.trim();
    if (!domanda) return;
    inviaDomanda(domanda);
    domandaInput.value = "";
  });

  async function inviaDomanda(domanda) {
    aggiungiMessaggio(domanda, "user-message");

    try {
      const response = await fetch("/.netlify/functions/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domanda }),
      });

      const data = await response.json();
      const risposta = data.risposta || "Errore: risposta non disponibile.";
      aggiungiMessaggio(risposta, "gpt-response");
    } catch (error) {
      aggiungiMessaggio("Mi scuso, ma non sono in grado di rispondere ora.", "gpt-response");
    }
  }

  function aggiungiMessaggio(testo, classe) {
    const msg = document.createElement("div");
    msg.className = classe;
    msg.textContent = testo;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});
