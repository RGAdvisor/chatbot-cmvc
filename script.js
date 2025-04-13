// Funzione per gestire il clic sui bottoni verdi con domande fisse
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

    // Mostra la risposta fissa nel box bianco
    document.getElementById("risposta-fissa").textContent = risposta;

    // Mostra anche nella chat
    appendMessage('user', document.querySelector(`#button${getButtonNumber(tipo)}`).textContent);
    appendMessage('gpt', risposta);
}

// Restituisce il numero del bottone (1-4) in base al tipo
function getButtonNumber(tipo) {
    const map = {
        prenotazione: 1,
        orari: 2,
        indirizzo: 3,
        specialita: 4
    };
    return map[tipo];
}

// Listener bottoni verdi
document.getElementById("button1").addEventListener("click", () => handleClick('prenotazione'));
document.getElementById("button2").addEventListener("click", () => handleClick('orari'));
document.getElementById("button3").addEventListener("click", () => handleClick('indirizzo'));
document.getElementById("button4").addEventListener("click", () => handleClick('specialita'));

// Listener per bottone "Scrivi la tua domanda"
document.querySelector(".submit-button").addEventListener("click", async () => {
    const domanda = document.getElementById("domanda").value.trim();
    if (domanda === "") return;

    appendMessage('user', domanda);

    // Inserisci chiamata API a OpenAI o risposta fittizia
    const risposta = await getGPTResponse(domanda);

    appendMessage('gpt', risposta);
    document.getElementById("domanda").value = "";
});

// Funzione per inserire i messaggi nella chat
function appendMessage(sender, message) {
    const container = document.getElementById("chat-container");
    const msg = document.createElement("div");

    msg.classList.add(sender === 'user' ? 'user-message' : 'gpt-response');
    msg.textContent = message;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// Simula una risposta API (puoi integrarla con la tua chiave GPT)
async function getGPTResponse(domanda) {
    // QUI puoi collegarti con la tua chiave GPT oppure rispondere localmente
    return "Grazie per la domanda! Ti risponderemo al più presto.";
}
