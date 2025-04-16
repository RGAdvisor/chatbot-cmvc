const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Rispondi come assistente del Centro Sanitario Valcuvia in modo gentile, chiaro e rassicurante. Non fare mai riferimento a medici di fiducia, medici di base o pronto soccorso. In caso di dolore o malessere, invita sempre a contattare il nostro centro allo 0332 624820 per ricevere assistenza o fissare un appuntamento.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // --- Pulizia e normalizzazione del testo ---
    risposta = risposta
      // Correzione espressioni da evitare
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/(rivolgiti|contatta|consulta) (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro")

      // Rimozione di riferimenti diretti errati
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/\bil\b\s+\bil\b/gi, "il")
      .replace(/\bil tuo il nostro\b/gi, "il nostro")
      .replace(/\bil tuo centro sanitario\b/gi, "il nostro centro")
      .replace(/\bil nostro centro sanitario il nostro centro sanitario\b/gi, "il nostro centro sanitario")

      // Uniforma gli spazi
      .replace(/\s{2,}/g, " ")
      .trim();

    // --- Aggiunta contatto finale se non già presente ---
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\n📞 Per informazioni o per fissare un appuntamento, ti invitiamo a contattarci allo 0332 624820.";
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
