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
            risposta = "Il centro ha una divisione dentale e una di polispecialistica: Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
            break;
    }
    // Mostra la risposta nel campo di testo (textarea)
    document.getElementById("domanda").value = risposta;
}

// Gestire il clic sui bottoni
document.getElementById("button1").addEventListener("click", function() {
    handleClick('prenotazione');
});

document.getElementById("button2").addEventListener("click", function() {
    handleClick('orari');
});

document.getElementById("button3").addEventListener("click", function() {
    handleClick('indirizzo');
});

document.getElementById("button4").addEventListener("click", function() {
    handleClick('specialita');
});

// Aggiungi il listener per il pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", handleInput);

// Funzione per gestire l'invio della domanda a GPT-3.5 e ricevere la risposta
async function handleInput() {
    const domanda = document.getElementById("domanda").value.trim();
    let risposta = "Grazie per la domanda! Ti risponderemo al più presto.";

    // Se la domanda non è vuota, invia una richiesta a GPT
    if (domanda !== "") {
        // Usa una chiave API dal backend, non in client-side per motivi di sicurezza
        const apiKey = "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"; // Usa un sistema di gestione variabili d'ambiente come Netlify o un server backend
        const url = "https://api.openai.com/v1/chat/completions";

        const data = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: domanda }
            ],
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

                // Controlla se la risposta di GPT è vuota o errata
                if (!gptResponse) {
                    risposta = "Non sono riuscito a ricevere una risposta, riprova più tardi.";
                } else {
                    risposta = gptResponse;
                }
            } else {
                console.error("Errore nella richiesta a GPT:", response.status);
                const errorData = await response.json();
                console.error("Dettagli errore:", errorData);
                risposta = "Mi scuso, ma non sono in grado di rispondere ora. Errore: " + response.status;
            }
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
            risposta = "Mi scuso, ma c'è stato un errore nella chiamata al server.";
        }
    }

    // Visualizza la risposta di GPT nel campo di testo (textarea)
    document.getElementById("domanda").value = risposta;
}
