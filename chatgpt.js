const { Configuration, OpenAIApi } = require("openai");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Carica l'elenco delle prestazioni dal file Excel
const workbook = xlsx.readFile(path.join(__dirname, "elenco prestazioni.xlsx"));
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Crea un Set di prestazioni offerte (includendo singolare/plurale)
const prestazioniOfferte = new Set();
data.forEach((row) => {
  const voce = row["Prestazione"]?.toLowerCase().trim();
  if (voce) {
    prestazioniOfferte.add(voce);
    if (voce.endsWith("e") || voce.endsWith("i")) {
      prestazioniOfferte.add(voce.slice(0, -1)); // versione singolare
    }
  }
});

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domandaOriginale = body.domanda || "";
    const domanda = domandaOriginale.toLowerCase();

    // Rileva se si parla di prestazione
    const richiestaPrestazione = Array.from(prestazioniOfferte).some((p) =>
      domanda.includes(p)
    );

    // Rileva se l'utente riferisce un malessere
    const segnaliMalessere = [
      "mal di", "non sto bene", "dolore", "mi fa male", "nausea", "bruciore", "sento male", "male a", "malessere"
    ];
    const contieneSintomi = segnaliMalessere.some((s) => domanda.includes(s));

    // Se la prestazione NON è offerta
    if (!richiestaPrestazione) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta:
            "Ci dispiace, ma al momento questa prestazione non è disponibile presso il nostro centro.\n\n📄 Puoi consultare l’elenco completo delle prestazioni nella nostra brochure: [Scarica Brochure](https://www.csvcuvio.it/brochure_prestazioni.pdf)",
        }),
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, grammaticalmente corretto e informativo.

📌 Quando l’utente segnala un malessere (es. "mal di pancia", "mi fa male", "non sto bene", ecc.), dopo aver suggerito di contattare il nostro centro, puoi includere un breve consiglio pratico utile (es. riposo, bere acqua, impacchi, ecc.).

❌ Se l’utente NON segnala sintomi o problemi di salute, NON fornire consigli sanitari generici.

❌ Non fare riferimento a "il tuo medico", "il dentista di fiducia", "il pronto soccorso" o "uno specialista". Tutti gli inviti devono essere rivolti al nostro centro.

✔️ I contatti devono essere sempre presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

❗Correggi eventuali errori grammaticali o di sintassi prima di restituire la risposta.
        `,
        },
        { role: "user", content: domandaOriginale },
      ],
      temperature: 0.4,
    });

    let risposta =
      response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia della risposta
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(
        /(rivolgiti|contatta)[^.!?]*[.!?]/gi,
        "Ti consigliamo di contattare il nostro centro sanitario per maggiori informazioni."
      );

    // Aggiunta contatti, se non presenti
    const contatti = `\n\n📞 Per informazioni o per fissare un appuntamento:\nChiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;

    if (
      !risposta.includes("0332 624820") &&
      !risposta.includes("segreteria@csvcuvio.it")
    ) {
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
      body: JSON.stringify({
        error: "Errore durante la generazione della risposta.",
      }),
    };
  }
};

