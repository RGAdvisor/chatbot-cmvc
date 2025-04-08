// Funzione per gestire il clic sui bottoni
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
      risposta = "Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
      break;
  }
  document.getElementById("risposta").innerText = risposta;
}

// Funzione per gestire l'invio della domanda a GPT-3.5 e ricevere la risposta
async function handleInput() {
    const domanda = document.getElementById("domanda").value.trim();
    let risposta = "Grazie per la domanda! Ti risponderemo al più presto.";

    // Se la domanda non è vuota, invia una richiesta a GPT
    if (domanda !== "") {
        // Imposta la chiave API di OpenAI (assicurati di non rivelarla mai pubblicamente)
        const apiKey = "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";  // Sostituisci con la tua chiave API segreta
        
        // Definisci l'endpoint per la richiesta GPT
        const url = "https://api.openai.com/v1/chat/completions";

        // Crea il corpo della richiesta per GPT
        const data = {
            model: "gpt-3.5-turbo",  // Puoi usare "gpt-4" se preferisci
            messages: [
                { role: "user", content: domanda }
            ],
            max_tokens: 150,
            temperature: 0.7,
        };

        // Effettua la chiamata API
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify(data),
            });

            // Controlla se la risposta è ok
            if (response.ok) {
                const json = await response.json();
                const gptResponse = json.choices[0].message.content.trim();
                risposta = gptResponse;
            } else {
                console.error("Errore nella richiesta a GPT:", response.status);
                risposta = "Mi scuso, ma non sono in grado di rispondere ora";
            }
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            risposta = "Mi scuso, ma c'è stato un errore nella chiamata al server.";
        }
    }

    // Visualizza la risposta di GPT nella chat
    document.getElementById("risposta").innerText = risposta;
}

// Invia la domanda premendo "Invio" dalla tastiera
document.getElementById("domanda").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();  // Prevenire il comportamento di default del tasto "Enter"
    handleInput();
  }
});
