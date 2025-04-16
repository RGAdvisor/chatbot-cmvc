const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Elenco prestazioni disponibili
const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale",
  "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione", "Mammografia",
  "Otoplastica", "Otturazioni", "Visita cardiologica", "Visita ginecologica"
];

// Funzioni di supporto
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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
    const pluraleI = base.replace(/a$/, "e");
    const pluraleE = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleI) || testoDomanda.includes(pluraleE);
  });
}

// Main handler
exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // Risposta generica
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    // Verifica prestazione
    if (!contienePrestazione(domanda)) {
      const risposta = `
Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.<br><br>
📄 <a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank">SCARICA ELENCO PRESTAZIONI CSV</a><br><br>
📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Chiamata a OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo gentile, corretto grammaticalmente e informativo.

✅ Se l’utente segnala un malessere (es: "ho mal di pancia", "ho mal di denti", ecc.), dopo aver consigliato di contattare il centro, puoi aggiungere solo un breve consiglio utile (riposo, impacchi, bere acqua, ecc.).

❌ Non fornire mai consigli sanitari generici se non c'è un malessere esplicito.

❌ Evita frasi come “contatta il tuo medico”, “dentista di fiducia” o “pronto soccorso”. Indirizza sempre al nostro centro.

✅ I contatti devono essere sempre presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

📍 L'indirizzo corretto è: Via Enrico Fermi, 6 – 21030 Cuvio (VA)

❗Controlla grammatica e sintassi prima di inviare la risposta.
          `
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia testo
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    const contatti = `<br><br>📞 Per informazioni o per fissare un appuntamento:<br>Chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.`;

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
