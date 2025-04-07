
function handleClick(tipo) {
    let risposta = "";
    switch(tipo) {
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
            risposta = "Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
            break;
    }
    document.getElementById("risposta").innerText = risposta;
}

function handleInput() {
    const domanda = document.getElementById("domanda").value.toLowerCase();
    let risposta = "Grazie per la domanda! Ti risponderemo al più presto.";
    if (domanda.includes("convenzionat")) {
        risposta = "Il Centro Medico Cuvio non è convenzionato con il Servizio Sanitario Nazionale.";
    } else if (domanda.includes("fisioterapia")) {
        risposta = "Sì, offriamo servizi di fisioterapia.";
    } else if (domanda.includes("prenotare")) {
        risposta = "Puoi prenotare chiamando lo 0332 624820 o scrivendo a segreteria@csvcuvio.it.";
    }
    document.getElementById("risposta").innerText = risposta;
}
