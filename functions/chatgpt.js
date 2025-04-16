const { Configuration, OpenAIApi } = require("openai");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Carica l'elenco delle prestazioni
const workbook = xlsx.readFile(path.join(__dirname, "elenco prestazioni.xlsx"));
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Crea un Set per confronti efficienti
const prestazioniOfferte = new Set();
data.forEach((row) => {
  const voce = row["Prestazione"]?.toLowerCase().trim();
  if (voce) {
    prestazioniOfferte.add(voce);
    if (voce.endsWith("e")) {
      prestazioniOfferte.add(voce.slice(0, -1)); // versione singolare
    } else if (voce.endsWith("i")) {
      prestazioniOfferte.add(voce.slice(0, -1)); // versione singolare
    }
  }
});

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda.toLowerCase();

    // Controllo prestazione
    const richiestaPrestazione = Array.from(prestazioniOfferte).some((p) =>
      domanda.includes(p)
    );

    if (!richiestaPrestazione) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta:
            "Ci dispiace, ma al momento questa prestazione non è disponibile presso il nostro centro.\n\n📄 Puoi consultare l’elenco completo delle nostre prestazioni nella brochure: [Scarica Brochure](https://www.csvcuvio.it/brochure_prestazioni.pdf)",
        }),
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Sei l’assistente del Centro Sanitario Valcuvia. Rispondi in modo chiaro, gentile, corretto grammaticalmente, senza fare riferimento a medici di base, pronto soccorso o centri esterni. In caso di sintomi o malessere, invita sempre a contattare il centro. Se il paziente chiede un servizio che offriamo, conferma con gentilezza e invita a telefonare o scrivere via mail. Se il paziente non esprime un malessere, non offrire consigli di salute.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.4,
    });

    let risposta =
      response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia e armonizzazione
    risposta = risposta
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro sanitario")
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(
        /(rivolgiti|contatta)[^.!?]*[.!?]/gi,
        "Ti consigliamo di contattare il nostro centro sanitario per maggiori informazioni."
      );

    // Aggiunta contatti, se non presenti
    if (!risposta.includes("0332 624820")) {
      risposta +=
        "\n\n📞 Puoi contattarci telefonicamente al numero 0332 624820 o via email all'indirizzo 📧 segreteria@csvcuvio.it per prenotare una visita o ricevere maggiori informazioni.";
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
