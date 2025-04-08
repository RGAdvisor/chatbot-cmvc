async function handleInput() {
    // Prendi il valore della domanda dall'input
    const domanda = document.getElementById("domanda").value.trim();

    // Se la domanda è vuota, non fare nulla
    if (domanda === "") return;

    // Imposta una risposta predefinita
    let risposta = "Mi dispiace, qualcosa è andato storto.";

    try {
        // La tua chiave API di OpenAI (sostituisci con la tua chiave)
        const apiKey = "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";  // Inserisci qui la tua chiave API

        // URL dell'endpoint di OpenAI
        const url = "https://api.openai.com/v1/completions";

        // Dati per la richiesta
        const data = {
            model: "gpt-3.5-turbo", // Puoi anche usare "gpt-4" se disponibile
            prompt: domanda,  // La domanda che l'utente ha scritto
            max_tokens: 150,  // Numero massimo di token per la risposta
            temperature: 0.7   // Controlla la "creatività" della risposta
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
        console.error("Errore:", error);
    }

    // Mostra la risposta nel div della chat
    appendMessage(risposta);
}


