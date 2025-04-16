const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Elenco delle prestazioni disponibili
const prestazioniDisponibili = [
  "liposcultura",
  "addominoplastice",
  "mammografia",
  "otoplastica",
  "otturazioni",
  "carico immediati",
  "mammografie",
  "ecg sotto sforzo",
  "lipoemulsione sottocutanee",
  "visite cardiologica",
  "addominoplastica",
  "ecografiei",
  "ecocardiocolordoppleri",
  "liposculture",
  "ecgi",
  "lipoemulsione sottocutanea",
  "chirurgia estetica del seno",
  "holter pressorii",
  "ecocardiocolordoppler",
  "carico immediato",
  "visite ginecologica",
  "ecografie",
  "igiene dentalei",
  "liposuzionei",
  "visita ginecologica",
  "holter cardiaco",
  "blefaroplastica",
  "ecg sotto sforzi",
  "holter pressorio",
  "chirurgia estetica del seni",
  "igiene dentale",
  "agopuntura",
  "holter cardiaci",
  "liposuzione",
  "visita cardiologica",
  "blefaroplastice",
  "otoplastice",
  "otturazionii",
  "agopunture",
  "ecg"
];

// Utility per confronto singolare/plurale
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    return testoDomanda.includes(base) || testoDomanda.includes(base + "s");
  });
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // Se la prestazione non è disponibile
    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro. 
Puoi consultare l’elenco completo delle nostre prestazioni nella brochure disponibile in formato PDF. 
📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
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
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, corretto grammaticalmente e informativo.

✅ Se l’utente segnala un malessere (es: "ho mal di pancia", "mi sento male"), dopo aver consigliato di contattare il centro, aggiungi solo un consiglio utile (riposo, impacchi, bere acqua, ecc.).

❌ Non fornire mai consigli sanitari generici se non c'è un malessere esplicito.

❌ Evita frasi come “contatta il tuo medico”, “dentista di fiducia” o “pronto soccorso”. Devi sempre indirizzare al nostro centro.

✅ I contatti devono sempre essere presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

❗Controlla sempre grammatica e sintassi prima di restituire la risposta.
        `
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia finale
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    const contatti = `\n\n📞 Per informazioni o per fissare un appuntamento:\nChiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;

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
