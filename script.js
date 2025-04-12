/const fetch = require('node-fetch'); // Importa fetch per fare le richieste HTTP

exports.handler = async function(event, context) {
    const body = JSON.parse(event.body); // Analizza il corpo della richiesta
    const { messages, model, max_tokens } = body;  // Estrai i dati dal corpo

    // Recupera la chiave API da Netlify environment variables
    const apiKey = process.env.OPENAI_API_KEY;  // Chiave API gestita nel backend (Netlify)

    const url = "https://api.openai.com/v1/chat/completions";  // URL per la richiesta a OpenAI

    const data = {
        model: model || "gpt-3.5-turbo",  // Usa il modello GPT-3.5
        messages: messages,  // Messaggi della conversazione
        max_tokens: max_tokens || 150,  // Numero massimo di token
        temperature: 0.7,  // Imposta la temperatura per la generazione del testo
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,  // Usa la chiave API
            },
            body: JSON.stringify(data),  // Invia i dati nel corpo della richiesta
        });

        // Controlla se la risposta è OK
        if (response.ok) {
            const json = await response.json(); // Parsing della risposta
            const gptResponse = json.choices[0].message.content.trim(); // Estrai il contenuto della risposta

            // Verifica se la risposta è vuota o errata
            if (!gptResponse) {
                return { 
                    statusCode: 500, 
                    body: JSON.stringify({ message: "Non sono riuscito a ricevere una risposta." }) 
                };
            }

            // Risposta corretta, invia il messaggio
            return { 
                statusCode: 200, 
                body: JSON.stringify({ message: gptResponse }) 
            };

        } else {
            // Se la risposta non è OK (errore HTTP)
            console.error('Errore nella risposta:', response.status);
            return { 
                statusCode: response.status, 
                body: JSON.stringify({ message: 'Errore nel recupero della risposta dal server.' }) 
            };
        }

    } catch (error) {
        // Gestione degli errori nella chiamata API
        console.error('Errore nella chiamata API:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Errore nella chiamata API" }) 
        };
    }
};
