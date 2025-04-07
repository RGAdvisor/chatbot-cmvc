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
            risposta = "Odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia, fisioterapia.";
            break;
    }
    document.getElementById("risposta").innerText = risposta;
}

function handleInput() {
    const domanda = document.getElementById("domanda").value.toLowerCase();
    let risposta = "";

    if (domanda.includes("ciao") || domanda.includes("buongiorno") || domanda.includes("salve")) {
        risposta = "Ciao! Come posso aiutarti oggi?";
    } else if (domanda.includes("ginecolog")) {
        risposta = "Sì, effettuiamo visite ginecologiche. Vuoi sapere come prenotare?";
    } else if (domanda.includes("fisioterapia")) {
        risposta = "Sì, offriamo servizi di fisioterapia. Posso aiutarti con la prenotazione?";
    } else if (domanda.includes("prenotare")) {
        risposta = "Puoi prenotare chiamando lo 0332 624820 o scrivendo a segreteria@csvcuvio.it.";
    } else if (domanda.includes("orari")) {
        risposta = "Lunedì, Mercoledì e Venerdì: 9–12 / 14–19.30\nMartedì: 14–19.30\nGiovedì: 9–12\nSabato: 9–13";
    } else if (domanda.includes("dove") || domanda.includes("indirizzo")) {
        risposta = "Ci trovi in Via Enrico Fermi, 6 – 21030 Cuvio (VA)";
    } else if (domanda.includes("specialità") || domanda.includes("medico") || domanda.includes("visite")) {
        risposta = "Le nostre specialità includono odontoiatria, ginecologia, cardiologia, chirurgia vascolare, pneumologia, dietologia e fisioterapia.";
    } else if (domanda.includes("convenzionat")) {
        risposta = "Il Centro Medico Cuvio non è convenzionato con il Servizio Sanitario Nazionale.";
    } else {
        risposta = "Grazie per la domanda! Ti risponderemo al più presto oppure scrivici a segreteria@csvcuvio.it.";
    }

    document.getElementById("risposta").innerText = risposta;
}
