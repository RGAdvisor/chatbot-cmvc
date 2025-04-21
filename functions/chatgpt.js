const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale",
  "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione", "Mammografia",
  "Otoplastica", "Otturazioni", "Visita cardiologica", "Visita ginecologica"
];

const costiPrestazioni = {
  "mammografia": "120,00€",
  "visita ginecologica": "150,00€"
};

const segnaliMalessere = [
  "mal di schiena", "mal di denti", "mal di pancia", "male al ginocchio", "mal di testa",
  "mal di gola", "mi fa male", "non sto bene", "sto male", "dolore", 
  "bruciore", "nausea", "sento male", "male a", "malessere",
  "gonfia", "gonfiore", "slogata", "caviglia gonfia", "guancia gonfia", "dente rotto",
  "ponte sceso", "ribasatura", "faccetta staccata"
];

const consigliPerMalessere = {
  "mal di schiena": "stare sdraiato su una superficie rigida, evitare movimenti bruschi e applicare un impacco caldo.",
  "mal di denti": "evitare cibi troppo caldi o freddi, risciacquare con acqua tiepida e mantenere la zona a riposo.",
  "mal di pancia": "restare a riposo, assumere piccoli sorsi d'acqua e seguire un'alimentazione leggera.",
  "male al ginocchio": "tenere la gamba sollevata, applicare un impacco freddo e non sforzare l'articolazione.",
  "mal di testa": "riposa in un ambiente silenzioso e buio, bevi acqua e cerca di rilassarti.",
  "mal di gola": "bere bevande calde, evitare cibi irritanti e riposare la voce.",
  "mi sono slogata una caviglia": "applica subito del ghiaccio, tieni la gamba sollevata e non camminare."
};

const urgenzeDentarie = [
  "guancia gonfia", "dente rotto davanti", "ponte dentale che è sceso davanti", "ribasatura che fa male", "mi è caduto un dente davanti"
];

function normalizzaTesto(testo) {
  return testo.toLowerCase().replace(/[^a-zà-ú\s]/gi, "").replace(/\s+/g, " ").trim();
}

function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene"];
  const testoNorm = normalizzaTesto(testo);
  return frasi.includes(testoNorm);
}

function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleE = base.replace(/a$/, "e");
    const pluraleI = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleE) || testoDomanda.includes(pluraleI);
  });
}

function riconosciMalessere(testo) {
  const testoNorm = normalizzaTesto(testo);
  return Object.keys(consigliPerMalessere).find(chiave => testoNorm.includes(normalizzaTesto(chiave)));
}

function èUrgenzaDentale(testo) {
  const testoNorm = normalizzaTesto(testo);
  return urgenzeDentarie.some(frase => testoNorm.includes(normalizzaTesto(frase)));
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda || "";
    const domandaNorm = normalizzaTesto(domanda);

    if (domandaNorm.includes("mi è caduto un dente")) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "È caduto un dente davanti o dietro?" })
      };
    }

    if (domandaNorm.includes("davanti")) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "La situazione descritta richiede un intervento rapido. Ti consigliamo di contattare immediatamente il nostro centro: 📞 0332 624820 📧 segreteria@csvcuvio.it. Faremo il possibile per fissare un appuntamento in giornata."
        })
      };
    }

    if (domandaNorm.includes("dietro")) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "Ti consigliamo di contattare il nostro centro per un consulto personalizzato. 📞 Chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it. Nel frattempo, puoi evitare cibi duri o caldi, risciacquare con acqua tiepida e riposare la zona."
        })
      };
    }

    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" })
      };
    }

    if (èUrgenzaDentale(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "La situazione descritta richiede un intervento rapido. Ti consigliamo di contattare immediatamente il nostro centro: 📞 0332 624820 📧 segreteria@csvcuvio.it. Faremo il possibile per fissare un appuntamento in giornata."
        })
      };
    }

    const malessereRiconosciuto = riconosciMalessere(domanda);
    if (malessereRiconosciuto) {
      let rispostaSintomo = `Mi dispiace che tu non ti senta bene. Ti consigliamo di contattare il nostro centro per un consulto personalizzato.\n\n📞 Chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
      const consiglio = consigliPerMalessere[malessereRiconosciuto];
      if (consiglio) {
        rispostaSintomo += ` Nel frattempo, se il disturbo è lieve, potresti provare a: ${consiglio}`;
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: rispostaSintomo })
      };
    }

    const prestazioneCosto = Object.keys(costiPrestazioni).find(key =>
      domandaNorm.includes(normalizzaTesto(key))
    );

    if (prestazioneCosto) {
      const costo = costiPrestazioni[prestazioneCosto];
      const rispostaCosto = `Il costo per la ${prestazioneCosto} presso il nostro centro è di ${costo}. Per ulteriori informazioni o per prenotare un appuntamento, puoi contattarci al numero 📞 0332 624820 o via email 📧 segreteria@csvcuvio.it.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: rispostaCosto })
      };
    }

    if (/dove.*(siete|vi trovo|trovate)/i.test(domanda)) {
      const risposta = "📍 Ci troviamo a Cuvio (VA), in Via Enrico Fermi, 6 – 21030. 📞 Per qualsiasi informazione o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.";
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta })
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, corretto grammaticalmente e informativo.

✅ Se l’utente segnala un malessere (es: \"ho mal di pancia\", \"mi sento male\", \"mi fa male il ginocchio\"), puoi aggiungere un consiglio utile di buon senso specifico per quel malessere.
❌ Non fornire mai consigli medici specifici o diagnosi.
❌ Non dire mai \"contatta il medico\", \"vai al pronto soccorso\" o simili.
❌ Se non è presente un sintomo, NON fornire alcun consiglio sanitario.
✅ I contatti devono essere sempre presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it
📍 L'indirizzo del centro è: Via Enrico Fermi, 6 – 21030 Cuvio (VA).`
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5
    });

    const risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta })
    };
  } catch (error) {
    console.error("Errore nella funzione chatbot:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta." })
    };
  }
};
