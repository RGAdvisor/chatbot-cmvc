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
            "Rispondi come assistente del nostro centro in modo gentile, professionale, rassicurante e informativo. Non fare mai riferimento a medici di base, pronto soccorso o dentisti generici. Invita sempre il paziente a contattare il nostro centro telefonando allo 0332 624820 per un consulto o un appuntamento.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // --- Pulizia & sostituzioni post-risposta ---
    risposta = risposta
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/centro sanitario Valcuvia/gi, "il nostro centro")
      .replace(/il tuo centro sanitario/gi, "il nostro centro")
      .replace(/il centro sanitario/gi, "il nostro centro")
      .replace(/il tuo medico di fiducia/gi, "il nostro centro")
      .replace(/il tuo dentista di fiducia/gi, "il nostro centro")
      .replace(/dal tuo dentista/gi, "presso il nostro centro")
      .replace(/dal dentista di fiducia/gi, "presso il nostro centro")
      .replace(/pronto soccorso/gi, "il nostro centro")
      .replace(/il tuo il nostro centro/gi, "il nostro centro") // correzione doppia
      .replace(/\bil tuo dentista\b/gi, "il nostro centro")
      .replace(/rivolgiti (al|a un) professionista/gi, "contattaci presso il nostro centro")
      .replace(/contatta (un|il) (professionista|medico|specialista)/gi, "contattaci presso il nostro centro");

    // --- Aggiunta della firma finale ---
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\n📞 Per informazioni o per fissare un appuntamento, ti invitiamo a contattarci presso il nostro centro telefonando allo 0332 624820.";
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
