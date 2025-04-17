const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Lista prestazioni offerte
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

// Normalizza il testo per il confronto
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Frasi generiche (ciao, grazie, ecc.)
function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok"];
  return frasi.includes(normalizzaTesto(testo));
}

// Malesseri comuni
function segnalaMalessere(testo) {
  const paroleChiave = ["mal di", "dolore", "non sto bene", "mi sento male", "mi fa male", "sintomi"];
  const testoNorm = normalizzaTesto(testo);
  return paroleChiave.some(parola => testoNorm.includes(parola));
}

// Prestazione presente?
function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleE = base.replace(/a$/, "e");
    const pluraleI = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleE) || testoDomanda.includes(pluraleI);
  });
}

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // DOMANDE GENERICHE
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `👋 Ciao! Come posso aiutarti oggi?`,
        }),
      };
    }

    // MALESSERE
    if (segnalaMalessere(domanda)) {
      const risposta = `
Siamo spiacenti che tu non ti senta bene. Ti consigliamo di <strong>contattare subito il nostro centro</strong> per una valutazione accurata. 
Nel frattempo, puoi provare a <strong>bere acqua</strong>, <strong>riposare</strong> ed eventualmente <strong>applicare un impacco freddo o caldo</strong> sulla zona interessata.

📞 <strong>0332 624820</strong><br>
📧 <strong>segreteria@csvcuvio.it</strong>
`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // SE NON È UNA PRESTAZIONE DISPONIBILE
    if (!contienePrestazione(domanda)) {
      const risposta = `
Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.<br><br>📄 
<a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank">SCARICA ELENCO PRESTAZIONI CSV</a><br><br>📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.
`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Altrimenti... GPT risponde per prestazione esistente
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `
Sei l'assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in italiano corretto, educato e professionale. Non dire mai "rivolgiti al tuo medico" ma sempre "contatta il nostro centro".

📞 0332 624820
📧 segreteria@csvcuvio.it

Non dare consigli sanitari se non richiesti da un malessere. Controlla grammatica e sintassi prima di rispondere.
          `
        },
        { role: "user", content: domanda }
      ],
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    // Aggiungi contatti se non presenti
    if (!risposta.includes("0332 624820") && !risposta.includes("segreteria@csvcuvio.it")) {
      risposta += `<br><br>📞 <strong>0332 624820</strong><br>📧 <strong>segreteria@csvcuvio.it</strong>`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        risposta: "⚠️ Errore durante la richiesta. Riprova più tardi.",
      }),
    };
  }
};
