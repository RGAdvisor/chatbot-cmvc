function handleClick(tipo) {
  let risposta = "";

  switch (tipo) {
    case 'prenotazione':
      risposta = "Puoi prenotare chiamando lo 0332 624820 o scrivendo a segreteria@csvcuvio.it.";
      break;
    case 'orari':
      risposta = "Lunedì, Mercoledì e Venerdì: 9–12 / 14–19.30\nMartedì: 14–19.30\nGiovedì: 9–12\nSabato: 9–13";
      break;
    case 'indirizzo':
      risposta = "Ci trovi in Via Enrico Fermi, 6 – 21030 Cuvio (VA)";
      break;
    case 'specialita':
      risposta = "Il centro ha una divisione dentale e una di polispecialistica: Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
      break;
  }

  document.getElementById("risposta-fissa").textContent = risposta;
}

// Listener bottoni fissi
document.getElementById("button1").addEventListener("click", () => handleClick('prenotazione'));
document.getElementById("button2").addEventListener("click", () => handleClick('orari'));
document.getElementById("button3").addEventListener("click", () => handleClick('indirizzo'));
document.getElementById("button4").addEventListener("click", () => handleClick('specialita'));

// Gestione invio domanda
document.getElementById("domanda").addEventListener("keydown", async function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const domanda = this.value.trim();
    if (!domanda) return;

    appendMessage("user", domanda);
    this.value = "";

    try {
      const risposta = await getGPTResponse(domanda);
      appendMessage("gpt", risposta);
    } catch (err) {
      appendMessage("gpt", "Errore durante la richiesta. Riprova più tardi.");
    }
  }
});

function appendMessage(sender, message) {
  const container = document.getElementById("chat-container");
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "gpt-response");
  msg.textContent = message;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

async function getGPTResponse(domanda) {
  const response = await fetch("/.netlify/functions/chatgpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ domanda })
  });

  if (!response.ok) throw new Error("Errore risposta GPT");

  const data = await response.json();
  return data.risposta || "Nessuna risposta ricevuta.";
}
