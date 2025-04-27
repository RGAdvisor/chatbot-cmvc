const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato", "Protesi mobile", "Chirurgia carico immediato" , "Endodonzia", "Devitalizzazione bicanalare", "Devitalizzazione canalare", "Otturazione" , "Ricostruzione del dente con perni edocanalari",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler", "Conservativa", "Ortodonzia", "Contenzione fissa o mobile", "Controllo ortodontico", " Disinclusione chirurgica", "MAC", "Splintaggio", "Studio del caso", "Bite", "Terapia intervettiva",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale", "Trattamento linguale con e senza attacchi" , "Trattamento ortodontico fisso", "Trattamento prechirurgico", 
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

function contieneParoleChiaveSanitarie(testo) {
  const paroleChiave = ["risonanza", "rmn", "radiografia ginocchio", "TAC testa"];
  const testoNorm = normalizzaTesto(testo);
  return paroleChiave.some(parola => testoNorm.includes(parola));
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
          risposta: "La situazione descritta richiede un intervento rapido. Ti consigliamo di contattare immediatamente il nostro centro: \ud83d\udcde 0332 624820 \ud83d\udce7 segreteria@csvcuvio.it. Faremo il possibile per fissare un appuntamento in giornata."
        })
      };
    }

    if (domandaNorm.includes("dietro")) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "Ti consigliamo di contattare il nostro centro per un consulto personalizzato. \ud83d\udcde Chiama lo 0332 624820 oppure scrivi a \ud83d\udce7 segreteria@csvcuvio.it. Nel frattempo, puoi evitare cibi duri o caldi, risciacquare con acqua tiepida e riposare la zona."
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
          risposta: "La situazione descritta richiede un intervento rapido. Ti consigliamo di contattare immediatamente il nostro centro: \ud83d\udcde 0332 624820 \ud83d\udce7 segreteria@csvcuvio.it. Faremo il possibile per fissare un appuntamento in giornata."
        })
      };
    }

    const malessereRiconosciuto = riconosciMalessere(domanda);
    if (malessereRiconosciuto) {
      let rispostaSintomo = `Mi dispiace che tu non ti senta bene. Ti consigliamo di contattare il nostro centro per un consulto personalizzato.\n\n\ud83d\udcde Chiama lo 0332 624820 oppure scrivi a \ud83d\udce7 segreteria@csvcuvio.it.`;
      const consiglio = consigliPerMalessere[malessereRiconosciuto];
      if (consiglio) {
        rispostaSintomo += ` Nel frattempo, se il disturbo è lieve, potresti provare a: ${consiglio}`;
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: rispostaSintomo })
      };
    }

// Cerca la prestazione richiesta
const prestazioneRiconosciuta = prestazioniDisponibili.find(prestazione =>
  domandaNorm.includes(normalizzaTesto(prestazione))
);

// Se NON è riconosciuta, ma contiene parole di esami NON disponibili ➡️ blocca
if (!prestazioneRiconosciuta && contieneParoleChiaveSanitarie(domanda)) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      risposta: `Mi dispiace, ma questa prestazione non è attualmente disponibile presso il nostro centro. Per ulteriori informazioni, puoi contattarci: 📞 0332 624820 📧 segreteria@csvcuvio.it.`
    })
  };
}

// Se è riconosciuta, rispondi "Sì" o costo
if (prestazioneRiconosciuta) {
  if (/(costo|prezzo|quanto)/.test(domandaNorm)) {
    const costo = costiPrestazioni[normalizzaTesto(prestazioneRiconosciuta)];
    if (costo) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `Il costo per la ${prestazioneRiconosciuta} presso il nostro centro è di ${costo}. Per ulteriori informazioni o per prenotare un appuntamento: 📞 0332 624820 📧 segreteria@csvcuvio.it.`
        })
      };

  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({
        risposta: `Sì. Per prenotare una ${prestazioneRiconosciuta.toLowerCase()} presso il nostro centro, puoi contattarci al 📞 0332 624820 o via email 📧 segreteria@csvcuvio.it. È utile sottoporsi regolarmente a controlli di prevenzione.`
      })
    };
  }
}

// GPT fallback - DA METTERE ALLA FINE DEL TRY
const response = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: `Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo breve, pratico e senza ripetizioni.

✅ Le risposte devono essere dirette e concise.
✅ Evita frasi come "ti consiglio di", "è importante", "parlare con il medico".
✅ Per le prestazioni di prevenzione (come mammografie), puoi dire solo: "È utile sottoporsi regolarmente a controlli di prevenzione".
✅ Non inserire mai l'indirizzo fisico (c'è un bottone dedicato in chat).
✅ Includi sempre solo questi contatti: 📞 0332 624820 📧 segreteria@csvcuvio.it.

❌ Non dare diagnosi o consigli medici.
❌ Non nominare il pronto soccorso o il medico di fiducia.`
    },
    { role: "user", content: domanda }
  ],
  temperature: 0.5
});

let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

// Post-processamento delle risposte GPT
risposta = risposta
  .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
  .replace(/pronto soccorso/gi, "il nostro centro sanitario")
  .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
  .replace(/(contatta(ci)?|rivolgi(ti)? a) (un|il) (professionista|specialista)/gi, "contatta il nostro centro");

// Assicurati che ci siano sempre i contatti
const contatti = "📞 0332 624820 📧 segreteria@csvcuvio.it";
if (!risposta.includes("0332 624820") || !risposta.includes("segreteria@csvcuvio.it")) {
  risposta += `\n\nPer contattarci: ${contatti}`;
}

// Chiudi con il return finale
return {
  statusCode: 200,
  body: JSON.stringify({ risposta })
};
