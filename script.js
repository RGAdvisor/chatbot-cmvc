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
    appendMessage('user', document.getElementById("domanda").value); // Aggiungi la domanda dell'utente
    updateResponseMessage('gpt', risposta); // Aggiorna la risposta di GPT
    document.getElementById("domanda").value = ""; // Pulisci la textarea
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

// Funzione per aggiungere o aggiornare un messaggio nel contenitore della chat
function appendMessage(sender, message) {
    const chatContainer = document.getElementById("chat-container");

    const messageElement = document.createElement("div");
    messageElement.classList.add(sender + "-message");
    messageElement.textContent = message;

    chatContainer.appendChild(messageElement);
}

// Funzione per aggiornare la risposta nel contenitore esistente
function updateResponseMessage(sender, message) {
    const chatContainer = document.getElementById("chat-container");

    // Trova l'ultimo messaggio GPT esistente
    const lastGptMessage = chatContainer.querySelector('.gpt-message');

    if (lastGptMessage) {
        // Se esiste, aggiorna il messaggio
        lastGptMessage.textContent = message;
    } else {
        // Altrimenti crea un nuovo messaggio GPT
        const messageElement = document.createElement("div");
        messageElement.classList.add('gpt-message');
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
    }
}

// Aggiungi il listener per il pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", function() {
    const domanda = document.getElementById("domanda").value.trim();
    if (domanda !== "") {
        appendMessage('user', domanda);
        updateResponseMessage('gpt', "Risposta automatica del chatbot");
    }
});
