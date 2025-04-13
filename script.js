// Funzione per gestire il clic sui bottoni
function handleClick(tipo) {
    let risposta = "";

    // Risposte predefinite
    const risposte = {
        'prenotazione': "Puoi prenotare chiamando lo 0332 624820 o scrivendo a segreteria@csvcuvio.it.",
        'orari': "Lunedì, Mercoledì e Venerdì: 9–12 / 14–19.30\nMartedì: 14–19.30\nGiovedì: 9–12\nSabato: 9–13",
        'indirizzo': "Ci trovi in Via Enrico Fermi, 6 – 21030 Cuvio (VA)",
        'specialita': "Il centro ha una divisione dentale e una di polispecialistica: Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia."
    };

    // Assegna la risposta in base al tipo
    risposta = risposte[tipo];
    
    // Aggiungi la domanda e la risposta nella chat
    appendMessage('user', document.getElementById("domanda").value); // Aggiungi la domanda dell'utente
    appendMessage('gpt', risposta); // Aggiungi la risposta del chatbot
    document.getElementById("domanda").value = ""; // Pulisci la textarea
}

// Funzione per aggiungere dinamicamente il messaggio al contenitore della chat
function appendMessage(sender, message) {
    const chatContainer = document.getElementById("chat-container");

    const messageElement = document.createElement("div");
    messageElement.classList.add(sender + "-message");
    messageElement.textContent = message;

    chatContainer.appendChild(messageElement);
}

// Aggiungi il listener per i bottoni
["button1", "button2", "button3", "button4"].forEach((id, idx) => {
    document.getElementById(id).addEventListener("click", () => handleClick(id.replace("button", ["prenotazione", "orari", "indirizzo", "specialita"][idx])));
});

// Gestisce l'invio della domanda a GPT-3.5 e riceve la risposta
async function handleInput() {
    const domanda = document.getElementById("domanda").value.trim();
    let risposta = "Grazie per la domanda! Ti risponderemo al più presto.";

    if (domanda !== "") {
        const apiKey = process.env.OPENAI_API_KEY; // La chiave API viene presa direttamente dalle variabili d'ambiente di Netlify
        const url = "https://api.openai.com/v1/chat/completions";

        const data = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: domanda }],
            max_tokens: 150,
            temperature: 0.7,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const json = await response.json();
                const gptResponse = json.choices[0].message.content.trim();
                risposta = gptResponse || "Non sono riuscito a ricevere una risposta, riprova più tardi.";
            } else {
                console.error("Errore nella richiesta a GPT:", response.status);
                risposta = "Errore: " + response.status;
            }
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            risposta = "C'è stato un errore nella chiamata al server.";
        }
    }

    // Visualizza la risposta di GPT nel campo di testo (textarea)
    document.getElementById("domanda").value = risposta;
}

// Aggiungi il listener per il pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", handleInput);
