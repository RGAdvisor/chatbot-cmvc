const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prestazioniDisponibili = [
  "visita ginecologica",
  "mammografia",
  "ecografie",
  "otturazioni",
  "igiene dentale",
];

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda.toLowerCase();

    // Verifica se la prestazione richiesta è tra quelle disponibili
    const prestazioneRichiesta = prestazioniDisponibili.find(p => domanda.includes(p));

    let risposta;
    if (!prestazioneRichiesta) {
      risposta = "Ci dispiace, ma il servizio richiesto non è attualmente offerto presso il nostro centro.";
    } else {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Rispondi come assistente del Centro Sanitario Valcuvia in modo gentile, informativo e corretto grammaticalmente. Non menzionare mai medici o dentisti di fiducia, pronto soccorso o strutture esterne. Reindirizza sempre al nostro centro. Se la domanda riguarda un malessere, aggiungi consigli di gestione solo dopo aver suggerito il contatto con il centro. Se la domanda riguarda un contatto, includi sia il numero che la mail (0332 624820 e segreteria@csvcuvio.it).",
          },
          { role: "user", content: domanda },
        ],
        temperature: 0.5,
      });

      risposta = completion.data.choices[0]?.message?.content || "Nessuna risposta generata.";

      risposta = risposta
        .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
        .replace(/pronto soccorso/gi, "il nostro centro sanitario")
        .replace(/(rivolgiti|contatta) (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro")
        .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

      if (!risposta.includes("0332 624820")) {
        risposta +=
          "\n\n\ud83d\udcde Per informazioni o per fissare un appuntamento, ti invitiamo a contattarci allo 0332 624820 o via mail all'indirizzo segreteria@csvcuvio.it.";
      }
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
