// File: functions/chatbot.js

const fetch = require('node-fetch');  // Importa fetch, necessario per fare le richieste HTTP

exports.handler = async function(event, context) {
    const body = JSON.parse(event.body);  // Analizza il corpo della richiesta
    const { messages, model, max_tokens } = body;  // Estrai i dati necessari

    const apiKey = process.env.OPENAI_API_KEY;  // Recupera la chiave API da Netlify environment variables
    const url = 'https://api.openai.com/v1/chat/completions';  // URL per la richiesta a OpenAI

    const data = {
        model: model || 'gpt-3.5-turbo',  // Usa il modello GPT-3.5, o quello specificato
        messages: messages,  // I messaggi della conversazione
        max_tokens: max_tokens || 150,  // Numero massimo di token
        temperature: 0.7,  // Imposta la temperatura per la generazione del testo
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,  // Aggiungi la chiave API nell'header
            },
            body: JSON.stringify(data),  // Invia i dati nel corpo della richiesta
        });

        if (response.ok) {
            const json = await response.json();  // Estrai la risposta
            const gptResponse = json.choices[0].message.content.trim();  // Ottieni il contenuto della risposta

            return {
                statusCode: 200,
                body: JSON.stringify({ message: gptResponse }),  // Invia la risposta al client
            };
        } else {
            console.error('Errore nella richiesta a GPT:', response.status);  // Log dell'errore
            const errorData = await response.json();
            console.error('Dettagli errore:', errorData);

            return {
                statusCode: response.status,
                body: JSON.stringify({ message: 'Errore nel ricevere la risposta. Riprovare più tardi.' }),
            };
        }
    } catch (error) {
        console.error('Errore nella chiamata API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Errore nel server. Riprovare più tardi.' }),
        };
    }
};
