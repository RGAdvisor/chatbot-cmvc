// File: chatbot.js (Netlify Function)
const fetch = require('node-fetch'); // Importa fetch per fare richieste HTTP

exports.handler = async function(event, context) {
    const body = JSON.parse(event.body);  // Analizza il corpo della richiesta
    const { messages, model, max_tokens } = body;  // Estrai i dati

    // Chiave API da variabili d'ambiente di Netlify (nel backend)
    const apiKey = process.env.OPENAI_API_KEY;  // La chiave API verrà gestita dal backend

    const url = "https://api.openai.com/v1/chat/completions";

    const data = {
        model: model || "gpt-3.5-turbo",  // Usa il modello GPT-3.5
        messages: messages,  // Messaggi della conversazione
        max_tokens: max_tokens || 150,  // Numero massimo di token
        temperature: 0.7,  // Imposta la temperatura per la generazione del testo
    };

    try {
        // Invia la richiesta a OpenAI
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,  // Usa la chiave API nel backend
            },
            body: JSON.stringify(data),
        });

        // Gestisci la risposta da OpenAI
        if (response.ok) {
            const json = await response.json();
            const gptResponse = json.choices[0].message.content.trim();
            if (!gptResponse) {
                return { statusCode: 500, body: "Non sono riuscito a ricevere una risposta." };
            } else {
                return { statusCode: 200, body: JSON.stringify({ message: gptResponse }) };
            }
        } else {
            const errorData = await response.json();
            return { statusCode: response.status, body: `Errore: ${response.status}` };
        }
    } catch (error) {
        return { statusCode: 500, body: "Errore nella chiamata API" };
    }
};
