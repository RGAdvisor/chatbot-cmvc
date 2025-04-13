// Trova gli elementi del DOM una sola volta all'inizio
const chatContainer = document.getElementById("chat-container");
const fixedAnswerDiv = document.getElementById('fixed-answer-area');
const domandaTextarea = document.getElementById("domanda");
const submitButton = document.getElementById("submit-button");
const footer = document.querySelector("footer"); // Seleziona il footer

// --- Gestione Domande Fisse ---

// Funzione per mostrare la risposta fissa
function showFixedAnswer(tipo) {
    let risposta = "";
    switch (tipo) {
        case 'prenotazione':
            risposta = "Puoi prenotare chiamando lo 0332 624820 o scrivendo a segreteria@csvcuvio.it.";
            break;
        case 'orari':
            // Usiamo \n per le interruzioni di riga, il CSS (white-space: pre-wrap) le rispetterà
            risposta = "Lunedì, Mercoledì e Venerdì: 9–12 / 14–19.30\nMartedì: 14–19.30\nGiovedì: 9–12\nSabato: 9–13";
            break;
        case 'indirizzo':
            risposta = "Ci trovi in Via Enrico Fermi, 6 – 21030 Cuvio (VA)";
            break;
        case 'specialita':
            risposta = "Il centro ha una divisione dentale e una di polispecialistica:\nOdontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
            break;
        default:
             risposta = "Seleziona una delle domande predefinite."; // Caso di default
    }

    // Mostra la risposta nell'area dedicata
    fixedAnswerDiv.textContent = risposta;
    fixedAnswerDiv.style.display = 'block'; // Rendi visibile il div

    // Opzionale: Nascondi l'area dopo qualche secondo?
    // setTimeout(() => {
    //     fixedAnswerDiv.style.display = 'none';
    // }, 10000); // Nasconde dopo 10 secondi
}

// Aggiungi listener ai bottoni delle domande fisse
// Uso querySelectorAll per selezionare tutti i bottoni con classe 'button' nel button-group
document.querySelectorAll(".button-group .button").forEach(button => {
    button.addEventListener("click", function() {
        const tipo = this.getAttribute('data-tipo'); // Prende il tipo dal data attribute
        showFixedAnswer(tipo);
        // NON aggiungiamo nulla alla chat principale qui
    });
});


// --- Gestione Chat Libera ---

// Funzione per aggiungere un messaggio alla chat principale
function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    // Usa 'user-message' per l'utente e 'gpt-message' per il bot
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'gpt-message');
    messageElement.textContent = message; // Usa textContent per sicurezza (evita injection HTML)

    chatContainer.appendChild(messageElement);

    // Scrolla fino all'ultimo messaggio
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Funzione per inviare la domanda libera e gestire la risposta
async function handleFreeQuestion() {
    const domanda = domandaTextarea.value.trim();

    if (domanda === "") {
        return; // Non fare nulla se l'input è vuoto
    }

    // 1. Aggiungi la domanda dell'utente alla chat
    appendMessage('user', domanda);

    // 2. Pulisci l'area della risposta fissa (se visibile)
    fixedAnswerDiv.style.display = 'none';

    // 3. Pulisci la textarea
    domandaTextarea.value = "";

    // 4. Mostra un messaggio di attesa (opzionale)
    appendMessage('gpt', 'Sto cercando una risposta...');

    // 5. Invia la richiesta a GPT (ATTENZIONE ALLA API KEY!)
    // !!! ATTENZIONE: Non esporre MAI la tua API Key direttamente nel codice frontend!
    // !!! Questo è solo un esempio. In produzione, la chiamata API dovrebbe avvenire
    // !!! tramite un backend sicuro (serverless function, API gateway, ecc.).
    const apiKey = "sk-proj-INCOLLA_LA_TUA_CHIAVE_API_QUI_MA_NON_FARLO_IN_PRODUZIONE"; // NON FARE QUESTO IN PRODUZIONE!
    const url = "https://api.openai.com/v1/chat/completions";

    const data = {
        model: "gpt-3.5-turbo",
        messages: [
             // Puoi aggiungere qui un contesto o istruzioni per il bot
             // { role: "system", content: "Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo cortese e informativo." },
            { role: "user", content: domanda }
        ],
        max_tokens: 150,
        temperature: 0.7,
    };

    let rispostaGpt = "Grazie per la domanda! Al momento non posso elaborare la richiesta tramite AI, ma ti risponderemo al più presto."; // Messaggio di fallback generico

    try {
        // !!! TOGLIERE QUESTO BLOCCO TRY/CATCH SE NON SI USA L'API KEY REALE O UN BACKEND
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(data),
        });

        // Rimuovi il messaggio "Sto cercando..." (trovando l'ultimo elemento gpt-message)
        const thinkingMessage = chatContainer.querySelector('.gpt-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent.includes('Sto cercando')) {
            chatContainer.removeChild(thinkingMessage);
        }

        if (response.ok) {
            const json = await response.json();
            const gptChoice = json.choices && json.choices[0] && json.choices[0].message;
            if (gptChoice && gptChoice.content) {
                 rispostaGpt = gptChoice.content.trim();
            } else {
                 console.error("Risposta API non valida:", json);
                 rispostaGpt = "Ho ricevuto una risposta inaspettata. Riprova.";
            }
        } else {
            console.error("Errore nella richiesta a GPT:", response.status, response.statusText);
            const errorData = await response.text(); // Leggi come testo se JSON fallisce
            console.error("Dettagli errore:", errorData);
            rispostaGpt = `Mi scuso, ma non sono in grado di rispondere ora (Errore: ${response.status}).`;
        }
        // FINE BLOCCO DA TOGLIERE/SOSTITUIRE SE NON SI USA API KEY REALE

    } catch (error) {
        console.error("Errore nella chiamata API:", error);
        // Assicurati di rimuovere il messaggio "Sto cercando..." anche in caso di errore fetch
        const thinkingMessage = chatContainer.querySelector('.gpt-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent.includes('Sto cercando')) {
            chatContainer.removeChild(thinkingMessage);
        }
        rispostaGpt = "Mi scuso, si è verificato un problema tecnico. Riprova più tardi.";
    }

    // 6. Aggiungi la risposta del bot (GPT o fallback) alla chat
    appendMessage('gpt', rispostaGpt);

    // 7. Aggiorna il footer (opzionale)
    // footer.textContent = "Grazie per averci contattato!";
}

// Aggiungi listener al pulsante "Invia"
submitButton.addEventListener("click", handleFreeQuestion);

// Aggiungi listener per inviare con il tasto "Invio" nella textarea
domandaTextarea.addEventListener("keypress", function(event) {
    // Controlla se il tasto premuto è "Invio" (keyCode 13) e non è stato premuto Shift+Invio
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Impedisce di andare a capo nella textarea
        handleFreeQuestion(); // Chiama la stessa funzione del click
    }
});


// --- Inizializzazione ---

// Messaggio di benvenuto iniziale nella chat
window.addEventListener('DOMContentLoaded', (event) => {
    appendMessage('gpt', 'Ciao! Sono l\'assistente virtuale del Centro Sanitario Valcuvia. Come posso aiutarti? Puoi scegliere una domanda rapida o scrivere la tua.');
});
