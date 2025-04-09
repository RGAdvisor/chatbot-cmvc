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
    // Mostra la risposta nel campo di testo (textarea)
    document.getElementById("domanda").value = risposta;
}

// Assegna gli eventi ai bottoni
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

// Funzione per gestire l'invio della domanda a GPT-3.5 e ricevere la risposta
async function handleInput() {
    const domanda = document.getElementById("domanda").value.trim();
    let risposta = "Grazie per la domanda! Ti risponderemo al più presto.";

    // Se la domanda non è vuota, invia una richiesta a GPT
    if (domanda !== "") {
        console.log("Invio domanda a GPT:", domanda); // Log della domanda inviata

        const apiKey = "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";  // Sostituisci con la tua chiave API reale
       const url = "https://api.openai.com/v1/chat/completions"; // Endpoint corretto per OpenAI GPT-3.5 o GPT-4


        const data = {
            model: "gpt-3.5-turbo",  // Usa il modello che desideri
            prompt: domanda,
            max_tokens: 150,  // Limita la lunghezza della risposta
            temperature: 0.7,  // Imposta la temperatura del modello
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,  // Aggiungi la tua chiave API qui
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const json = await response.json();
                console.log("Risposta ricevuta da GPT:", json.choices[0].text);
                // Mostra la risposta nel campo di testo
                document.getElementById("risposta").textContent = json.choices[0].text;
            } else {
                console.error("Errore nella richiesta a GPT:", response.status);
            }
        } catch (error) {
            console.error("Errore nella chiamata API:", error);
        }
    }
}

// Aggiungi l'evento di click al pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", handleInput);



