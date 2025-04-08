// Funzione per inviare la domanda a OpenAI e ottenere una risposta
async function handleInput() {
    const domanda = document.getElementById("domanda").value.trim(); // Ottieni la domanda dall'input

    if (domanda === "") return; // Se la domanda è vuota, non fare nulla

    let risposta = "Mi dispiace, qualcosa è andato storto."; // Risposta di default

    // Aggiungi la domanda alla chat come messaggio dell'utente
    appendMessage("Tu: " + domanda);

    try {
        // La tua chiave API di OpenAI (sostituisci con la tua chiave)
        const apiKey = "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"; // Inserisci la tua chiave API OpenAI

        // URL dell'endpoint di OpenAI per GPT-3
        const url = "https://api.openai.com/v1/completions";

        // Dati per la richiesta a OpenAI
        const data = {
            model: "gpt-3.5-turbo", // Puoi usare "gpt-4" se disponibile
            prompt: domanda, // La domanda inviata dall'utente
            max_tokens: 150, // Numero massimo di token per la risposta
            temperature: 0.7 // Controlla la "creatività" della risposta
        };

        // Invia la richiesta HTTP POST a OpenAI
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });

        // Ottieni la risposta da OpenAI
        const responseData = await response.json();
        risposta = responseData.choices[0].text.trim(); // Preleva la risposta
    } catch (error) {
        console.error("Errore:", error); // Se c'è un errore, lo stampiamo nel log
    }

    // Aggiungi la risposta di OpenAI alla chat
    appendMessage("Assistente: " + risposta);
}

// Funzione per aggiungere il messaggio nella chat
function appendMessage(message) {
    const chatBox = document.getElementById("risposta"); // Ottieni il div della chat

    // Crea un nuovo div per il messaggio
    const messageElement = document.createElement("div");
    messageElement.classList.add("message"); // Aggiungi la classe per lo stile
    messageElement.innerText = message; // Imposta il testo del messaggio

    // Aggiungi il messaggio al box della chat
    chatBox.appendChild(messageElement);

    // Scrolla la chat verso il basso per vedere l'ultimo messaggio
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Funzione per gestire i clic sui bottoni delle opzioni predefinite
function handleClick(tipo) {
    let risposta = "";
    switch(tipo) {
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

    // Aggiungi la risposta del tipo di domanda
    appendMessage("Assistente: " + risposta);
}
