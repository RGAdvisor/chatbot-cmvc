document.getElementById("button1").addEventListener("click", function () {
  handleClick('prenotazione');
});
document.getElementById("button2").addEventListener("click", function () {
  handleClick('orari');
});
document.getElementById("button3").addEventListener("click", function () {
  handleClick('indirizzo');
});
document.getElementById("button4").addEventListener("click", function () {
  handleClick('specialita');
});

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

  appendMessage("user", document.getElementById("domanda").value || tipo);
  appendMessage("gpt", risposta);
  document.getElementById("domanda").value = "";
}

document.querySelector(".submit-button").addEventListener("click", function () {
  handleInput();
});

async function handleInput() {
  const domanda = document.getElementById("domanda").value.trim();
  if (!domanda) return;

  appendMessage("user", domanda);

  let risposta = "Mi scuso, ma non sono in grado di rispondere ora.";

  try {
    const response = await fetch("/.netlify/functions/chatgpt", {
      method: "POST",
      body: JSON.stringify({ domanda }),
    });

    const data = await response.json();
    risposta = data.risposta;
  } catch (err) {
    console.error("Errore:", err);
  }

  appendMessage("gpt", risposta);
  document.getElementById("domanda").value = "";
}

function appendMessage(sender, text) {
  const chatContainer = document.getElementById("chat-container");
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "user" ? "user-message" : "gpt-response";
  messageDiv.innerText = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
