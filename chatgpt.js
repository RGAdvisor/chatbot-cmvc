const { Configuration, OpenAIApi } = require("openai");
const pluralize = require("pluralize"); // Assicurati di installare questo modulo
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// Inizializza OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Carica le prestazioni dall'excel
const workbook = xlsx.readFile(path.resolve(__dirname, "elenco prestazioni.xlsx"));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

// Estrae in minuscolo le prestazioni per il match
const prestazioniDisponibili = rows.map(row =>
  pluralize.singular((row["Prestazione"] || "").toLowerCase().trim())
);

// Funzione per cercare prestazioni nel testo
function trovaPrestazione(domanda) {
  const parole = domanda.toLowerCase().split(/\W+/);
  for (let parola of parole) {
    const singolare = pluralize.singular(parola);
    if (prestazioniDisponibili.includes(singolare)) {
      return singolare;
    }
  }
  return null;
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    const prestazioneTrovata = trovaPrestazione(domanda);

    // Se non troviamo la prestazione, rispondiamo che non è disponibile
    if (!prestazioneTrovata) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta:
            "Ci dispiace, ma al momento il servizio richiesto non è disponibile presso il nostro centro. " +
            "📞 Per ulteriori informazioni puoi contattarci al numero 0332 624820 oppure via mail all’indirizzo 📧 segreteria@csvcuvio.it.",
        }),
      };
    }

    // Chiamata a OpenAI per una risposta su quella prestazione
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Rispondi come assistente del Centro Sanitario Valcuvia. Usa un linguaggio gentile, informativo e grammaticalmente corretto. Se l’utente parla di un malessere, puoi aggiungere un consiglio utile ma semplice (es. bere acqua, riposare), MA solo dopo aver consigliato di contattare il centro.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia e reindirizzamento
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/(rivolgiti|contatta) (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Controlla se ci sono sintomi per dare un consiglio (solo se parliamo di malessere)
    const malessere = /(mal di|dolore|nausea|febbre|vomito|non sto bene|sintomi|malessere)/i.test(domanda);
    const consiglioSalute = malessere
      ? "\n\n💡 In attesa della visita, cerca di riposare, mantenerti idratato e monitorare i sintomi. Evita cibi pesanti e stancanti."
      : "";

    // Aggiungi contatti se non presenti
    if (!risposta.includes("0332 624820")) {
      risposta +=
        "\n\n📞 Per informazioni o per fissare un appuntamento, puoi contattarci al numero 0332 624820 oppure via mail all’indirizzo 📧 segreteria@csvcuvio.it.";
    }

    // Aggiunta finale opzionale
    risposta += consiglioSalute;

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
