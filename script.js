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
    // Aggiungi la risposta al contenitore chat
    appendMessage('gpt', risposta); 
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

    // Se c'è già una risposta, sovrascrivi quella precedente
    if (sender === "gpt") {
        const lastMessage = chatContainer.querySelector('.gpt-response');
        if (lastMessage) {
            lastMessage.textContent = message; // Sovrascrivi l'ultima risposta
            return;
        }
    }

    // Creazione di un nuovo messaggio
    const messageElement = document.createElement("div");
    messageElement.classList.add(sender + "-message");
    messageElement.textContent = message;

    chatContainer.appendChild(messageElement);
}

// Aggiungi il listener per il pulsante "Invia"
document.querySelector(".submit-button").addEventListener("click", function() {
    const domanda = document.getElementById("domanda").value.trim();
    if (domanda !== "") {
        appendMessage('user', domanda); // Aggiungi la domanda dell'utente
        appendMessage('gpt', "Risposta automatica del chatbot"); // Risposta simulata per la domanda dell'utente
        document.getElementById("domanda").value = ""; // Pulisci la textarea dopo l'invio
    }
});
