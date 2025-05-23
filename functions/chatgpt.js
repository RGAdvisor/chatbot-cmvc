const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato", "Protesi mobile",
  "Chirurgia carico immediato", "Endodonzia", "Devitalizzazione bicanalare", "Devitalizzazione canalare",
  "Otturazione", "Ricostruzione del dente con perni edocanalari", "Chirurgia estetica del seno",
  "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler", "Conservativa", "Ortodonzia",
  "Contenzione fissa o mobile", "Controllo ortodontico", "Disinclusione chirurgica",
  "MAC", "Splintaggio", "Studio del caso", "Bite", "Terapia intervettiva",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale",
  "Trattamento linguale con e senza attacchi", "Trattamento ortodontico fisso", "Trattamento prechirurgico",
  "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione", "Mammografia",
  "Otoplastica", "Otturazioni", "Visita cardiologica", "Visita ginecologica"
];

const costiPrestazioni = {
  "mammografia": "120,00€",
  "visita ginecologica": "150,00€"
};

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
  "guancia gonfia", "dente rotto davanti", "ponte dentale che è sceso davanti",
  "ribasatura che fa male", "mi è caduto un dente davanti"
];

function normalizzaTesto(testo) {
  return testo.toLowerCase().replace(/[^a-zà-ú\s]/gi, "").replace(/\s+/g, " ").trim();
}

function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene"];
  return frasi.includes(normalizzaTesto(testo));
}

function contieneParoleChiaveSanitarie(testo) {
  const testoNorm = normalizzaTesto(testo);
  const paroleChiave = [
    "risonanza", "rmn", "tac", "radiografia", "moc", "doppler",
    "rx", "rx torace", "scintigrafia", "tomografia", "angiografia",
    "neurologia", "nefrologia", "reumatologia", "epatologia"
  ];
  return paroleChiave.some(parola => testoNorm.includes(normalizzaTesto(parola)));
}

function riconosciMalessere(testo) {
  const testoNorm = normalizzaTesto(testo);
  return Object.keys(consigliPerMalessere).find(chiave => testoNorm.includes(normalizzaTesto(chiave)));
}

function èUrgenzaDentale(testo) {
  const testoNorm = normalizzaTesto(testo);
  return urgenzeDentarie.some(frase => testoNorm.includes(normalizzaTesto(frase)));
}

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda || "";
    const domandaNorm = normalizzaTesto(domanda); // 👈 QUESTA RIGA È FONDAMENTALE

    const paroleRadiografieNonDentali = [
      "torace", "polmoni", "spalla", "gamba", "piede", "braccio", "schiena", "colonna", "addome", "cranio"
    ];

    const paroleRadiografieDentali = [
      "dente", "denti", "dentale", "arcata", "ortopanoramica", "panoramica dentale", "mascella", "mandibola"
    ];

    if (domandaNorm.includes("radiografia") || domandaNorm.includes("rx")) {
  if (paroleRadiografieNonDentali.some(parola => domandaNorm.includes(normalizzaTesto(parola)))) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        risposta: "Eseguiamo radiografie esclusivamente in ambito odontoiatrico. Per esami radiologici su altre parti del corpo, è necessario rivolgersi a strutture con attrezzature dedicate. Per info: 📞 0332 624820 📧 segreteria@csvcuvio.it."
      })
    };
  }

  if (paroleRadiografieDentali.some(parola => domandaNorm.includes(normalizzaTesto(parola)))) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        risposta: "Sì, effettuiamo radiografie dentali presso il nostro centro. Contattaci per prenotare: 📞 0332 624820 📧 segreteria@csvcuvio.it."
      })
    };
  }

  // caso generico: "fate radiografie?" senza specificare
  return {
    statusCode: 200,
    body: JSON.stringify({
      risposta: "Eseguiamo radiografie esclusivamente in ambito odontoiatrico. Per esami radiologici su altre parti del corpo, è necessario rivolgersi a strutture con attrezzature dedicate. Per info: 📞 0332 624820 📧 segreteria@csvcuvio.it."
    })
  };
}

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
          risposta: "La situazione descritta richiede un intervento rapido. Contatta il nostro centro: 📞 0332 624820 📧 segreteria@csvcuvio.it."
        })
      };
    }

    if (domandaNorm.includes("dietro")) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "Contatta il nostro centro per un consulto personalizzato: 📞 0332 624820 📧 segreteria@csvcuvio.it. Nel frattempo, evita cibi duri o caldi, risciacqua con acqua tiepida e riposa la zona."
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
          risposta: "La situazione descritta richiede un intervento rapido. Contatta il nostro centro: 📞 0332 624820 📧 segreteria@csvcuvio.it."
        })
      };
    }

    const malessereRiconosciuto = riconosciMalessere(domanda);
    if (malessereRiconosciuto) {
      let rispostaSintomo = `Mi dispiace che tu non ti senta bene. Contatta il nostro centro per un consulto personalizzato.

📞 0332 624820 📧 segreteria@csvcuvio.it.`;
      const consiglio = consigliPerMalessere[malessereRiconosciuto];
      if (consiglio) {
        rispostaSintomo += ` Nel frattempo, se il disturbo è lieve, potresti provare a: ${consiglio}`;
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: rispostaSintomo })
      };
    }

   if (/analisi|esami del sangue|prelievi/.test(domandaNorm)) {

      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: "Presso la nostra struttura è presente il punto prelievi della società di analisi Beccaria, che opera in modo indipendente. Per informazioni o prenotazioni potete contattarli direttamente allo 0332 234395."
        })
      };
    }

    const prestazioneRiconosciuta = prestazioniDisponibili.find(prestazione =>
      domandaNorm.includes(normalizzaTesto(prestazione))
    );

    if (prestazioneRiconosciuta) {
      if (/(costo|prezzo|quanto)/.test(domandaNorm)) {
        const costo = costiPrestazioni[normalizzaTesto(prestazioneRiconosciuta)];
        if (costo) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              risposta: `Il costo per la ${prestazioneRiconosciuta} presso il nostro centro è di ${costo}. Contattaci per prenotare: 📞 0332 624820 📧 segreteria@csvcuvio.it.`
            })
          };
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `Sì. Per prenotare una ${prestazioneRiconosciuta.toLowerCase()} presso il nostro centro, contattaci: 📞 0332 624820 📧 segreteria@csvcuvio.it. È utile sottoporsi regolarmente a controlli di prevenzione.`
        })
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo breve, pratico e senza ripetizioni. Includi sempre questi contatti: 📞 0332 624820 📧 segreteria@csvcuvio.it. Non dare diagnosi o consigli medici.`
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";
    if (!risposta.includes("0332 624820") || !risposta.includes("segreteria@csvcuvio.it")) {
      risposta += `

Per contattarci: 📞 0332 624820 📧 segreteria@csvcuvio.it`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta })
    };

  } catch (error) {
    console.error("Errore nella funzione chatbot:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta." })
    };
  }
};
