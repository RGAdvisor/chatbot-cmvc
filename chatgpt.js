const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Prestazioni disponibili
const prestazioniDisponibili = [
  "Addominoplastica",
  "Agopuntura",
  "Bleforaplastica",
  "Carico immediato",
  "Chirurgia estetica del seno",
  "ECG",
  "ECG sotto sforzo",
  "Ecocardiocolordoppler",
  "Ecografie",
  "Holter cardiaco",
  "Holter pressorio",
  "Igiene dentale",
  "Lipoemulsione sottocutanea",
  "Liposcultura",
  "Liposuzione",
  "Mammografia",
  "Otoplastica",
  "Otturazioni",
  "Visita cardiologica",
  "Visita ginecologica"
];

// Utility per normalizzazione
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Riconoscimento domande generiche
function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene"];
  const testoNorm = normalizzaTesto(testo);
  return frasi.includes(testoNorm);
}

// Verifica prestazioni (singolari e plurali)
function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleI = base.replace(/a$/, "e"); // visita → visite
    const pluraleE = base.replace(/o$/, "i"); // ecocardiocolordoppler → ecocardiocolordoppleri
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleI) || testoDomanda.includes(pluraleE);
  });
}

// Verifica se contiene malesseri
function contieneMalessere(domanda) {
  const paroleChiave = ["mal di", "dolore", "mi fa male", "non sto bene", "mi sento male"];
  const testo = normalizzaTesto(domanda);
  return paroleChiave.some(p => testo.includes(p));
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    const brochureLink = "https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link";

    // Risposta a domande generiche
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    // Risposta per indirizzo
    const testoNorm = normalizzaTesto(domanda);
    if (testoNorm.includes("dove") && (testoNorm.includes("siete") || testoNorm.includes("vi trovo") || testoNorm.includes("indirizzo"))) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `Ci troviamo a Cuvio (VA), in via Enrico Fermi, 6 – 21030.\n\n📞 Per qualsiasi informazione o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`
        }),
      };
    }

    // Se la prestazione NON è disponibile
    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.\n📄 SCARICA ELENCO PRESTAZIONI CSV: ${brochureLink}\n\n📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Richiesta gestita da OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo gentile, corretto grammaticalmente e informativo.

✅ Se l’utente segnala un malessere, consiglia di contattare il centro e aggiungi un solo consiglio pratico (es. bere acqua, riposo, impacchi, ecc.).

❌ Non fornire consigli sanitari se non c’è un malessere dichiarato.

❌ Non usare mai "il tuo medico", "dentista di fiducia", "pronto soccorso". Rivolgi sempre al nostro centro.

📍 Indirizzo: Via Enrico Fermi, 6 – 21030 Cuvio (VA)
📞 0332 624820
📧 segreteria@csvcuvio.it

❗ Controlla grammatica e sintassi prima di rispondere.
          `
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    // Se non ci sono i contatti, aggiungili
    const contatti = `\n\n📞 Per informazioni o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
    if (!risposta.includes("0332 624820") && !risposta.includes("segreteria@csvcuvio.it")) {
      risposta += contatti;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };

  } catch (error) {
    console.error("Errore:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta." }),
    };
  }
};
