/* Generale */
body {
    font-family: Arial, sans-serif;
    background-color: #f1f1f1;
    margin: 0;
    padding: 0;
    display: flex; /* Aggiunto per centrare meglio il container */
    justify-content: center; /* Aggiunto per centrare */
    min-height: 100vh; /* Aggiunto per centrare verticalmente */
    align-items: center; /* Aggiunto per centrare verticalmente */
}

/* Contenitore principale */
.container {
    width: 100%;
    max-width: 600px;
    /* Rimosso margin: 20px auto; perché gestito dal body flex */
    margin: 20px; /* Aggiunto un margine per non attaccare ai bordi su schermi piccoli */
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: flex; /* Usiamo flexbox per organizzare gli elementi interni */
    flex-direction: column; /* Elementi in colonna */
}

/* Titoli */
h1 {
    text-align: center;
    color: #2a7f63; /* Verde */
    margin-top: 0; /* Rimuove margine superiore predefinito */
}

/* Paragrafo introduttivo */
.container > p { /* Seleziona solo il primo <p> figlio diretto */
    text-align: center;
    color: #555;
    margin-bottom: 20px;
}


/* Gruppo di bottoni */
.button-group {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Ridotto leggermente lo spazio */
    margin-top: 10px;
    margin-bottom: 15px; /* Spazio prima dell'area risposta fissa */
}

.button-group button {
    background-color: #2a7f63; /* Verde */
    color: white;
    font-size: 15px; /* Leggermente più piccolo */
    padding: 10px 15px; /* Padding aggiustato */
    border: none;
    border-radius: 20px; /* Arrotondamento leggermente ridotto */
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    text-align: center; /* Assicura testo centrato */
}

.button-group button:hover {
    background-color: #1e5e45; /* Verde più scuro */
}

/* Area per la risposta fissa (MODIFICATA) */
#fixed-answer-area.response-box { /* Stile specifico per l'area dedicata */
    background-color: white;
    border: 1px solid #2a7f63; /* Bordo verde coordinato */
    border-radius: 10px;
    padding: 12px;
    margin-top: 0; /* Rimosso margine sopra, gestito dal gap del container */
    margin-bottom: 15px; /* Spazio prima della chat */
    width: auto; /* Adatta larghezza al contenuto, ma rispetta padding */
    align-self: center; /* Centra il box se il contenuto è corto */
    max-width: 95%; /* Limita larghezza massima */
    box-sizing: border-box; /* Include padding e border nella larghezza */
    color: #333; /* Colore testo */
    font-size: 14px; /* Dimensione testo risposta */
    line-height: 1.5; /* Interlinea per leggibilità */
    white-space: pre-wrap; /* Mantiene le interruzioni di riga dalla stringa JS */
}


/* Contenitore della chat dinamica */
#chat-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px; /* Spazio prima dell'input */
    overflow-y: auto; /* Aggiunge scroll se la chat diventa lunga */
    max-height: 300px; /* Limita altezza massima della chat */
    padding: 5px; /* Piccolo padding interno */
}

/* Messaggio dell'utente (MODIFICATO) */
.user-message {
    background-color: #2a7f63; /* Verde */
    color: white;
    border-radius: 15px 15px 0 15px; /* Arrotondamento stile chat */
    padding: 10px 15px;
    margin-left: auto; /* Allineamento a destra */
    max-width: 70%; /* Limita larghezza massima */
    word-wrap: break-word; /* Va a capo se parole lunghe */
    align-self: flex-end; /* Allinea il box a destra nel flex container */
}

/* Messaggio del Chatbot (GPT o iniziale) (MODIFICATO) */
.gpt-message { /* Rinominato per chiarezza */
    background-color: #e9e9eb; /* Grigio chiaro per il bot */
    color: #333;
    border: 1px solid #dcdcdc; /* Bordo leggero */
    border-radius: 15px 15px 15px 0; /* Arrotondamento stile chat */
    padding: 10px 15px;
    margin-right: auto; /* Allineamento a sinistra */
    max-width: 70%; /* Limita larghezza massima */
    word-wrap: break-word; /* Va a capo se parole lunghe */
    align-self: flex-start; /* Allinea il box a sinistra nel flex container */
}

/* Rimosso .initial-question e .question-input perché non più usati */
/* Rimosso .response-box generico se non serve altrove, usato #fixed-answer-area */


/* Area di input (MODIFICATA) */
.input-area {
    display: flex; /* Allinea textarea e bottone sulla stessa riga */
    gap: 10px; /* Spazio tra textarea e bottone */
    margin-top: 15px;
    align-items: flex-end; /* Allinea bottone e textarea in basso */
}

/* Textarea per input utente (MODIFICATA) */
#domanda {
    flex-grow: 1; /* Occupa lo spazio rimanente */
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 15px; /* Angoli arrotondati */
    font-size: 14px;
    resize: none; /* Impedisce ridimensionamento manuale */
    min-height: 40px; /* Altezza minima */
    box-sizing: border-box; /* Include padding/border nel calcolo altezza/larghezza */
}

/* Pulsante di invio (MODIFICATO) */
#submit-button.submit-button { /* Aumenta specificità se necessario */
    background-color: #2a7f63;
    color: white;
    font-size: 15px;
    padding: 10px 15px; /* Padding coerente */
    border: none;
    border-radius: 15px; /* Angoli arrotondati */
    cursor: pointer;
    transition: background-color 0.3s;
    height: 40px; /* Altezza fissa uguale a min-height textarea */
    /* Rimosso width: 100% perché è in flex ora */
    white-space: nowrap; /* Evita che "Invia" vada a capo */
}

#submit-button.submit-button:hover {
    background-color: #1e5e45;
}

/* Footer (MODIFICATO) */
footer {
    text-align: center;
    margin-top: 20px;
    font-size: 12px; /* Più piccolo */
    color: #888; /* Grigio più chiaro */
    padding-top: 10px;
    border-top: 1px solid #eee; /* Separatore leggero */
}
