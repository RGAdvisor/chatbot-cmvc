// Funzione per gestire il clic sui bottoni delle domande fisse
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

    // Aggiungi la domanda dell'utente e la risposta fissa, sovrascrivendo la risposta nel rettangolo
    appendMessage('user', document.getElementById("domanda").value); // Aggiungi la domanda dell'utente
    updateFixedResponse(risposta); // Sovrascrivi la risposta fissa
    document.getElementById("domanda").value = ""; // Pulisci la textarea
}

// Funzione per sovrascrivere la risposta fissa nel rettangolo bianco
function updateFixedResponse(risposta) {
    const fixedResponseContainer = document.getElementById("fixed-response-container");
    
    // Se il contenitore non esiste, crealo
    if (!fixedResponseContainer) {
        const newFixedResponse = document.createElement("div");
        newFixedResponse.id = "fixed-response-container";
        newFixedResponse.classList.add("response-box");
        document.querySelector(".chat-container").appendChild(newFixedResponse);
    }
    
    // Sovrascrivi il contenuto del rettangolo bianco con la risposta
    const fixedResponseElement = document.getElementById("fixed-response-container");
    fixedResponseElement.textContent = risposta;
}

// Aggiungi il listener per i bottoni
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

// Funzione per aggiungere dinamicamente il messaggio al contenitore della chat
function appendMessage(sender, message) {
    const chatContainer = document.getElementById("chat-container");

    const messageElement = document.createElement("div");
    messageElement.classList.add(sender + "-message");
    messageElement.textContent = message;

    chatContainer.appendChild(messageElement);
}

// Aggiungi il listener per il pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", function() {
    const domanda = document.getElementById("domanda").value.trim();
    if (domanda !== "") {
        appendMessage('user', domanda);
        appendMessage('gpt', "Risposta automatica del chatbot");
    }
});
