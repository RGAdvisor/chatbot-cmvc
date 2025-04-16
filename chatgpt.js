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
            "Rispondi come assistente del centro sanitario in modo gentile, empatico e informativo. Le risposte devono essere chiare e rassicuranti. Evita di citare nomi specifici come 'Centro Sanitario Valcuvia' o fornire email generiche. Se il paziente manifesta un malessere, invita sempre a contattare il centro telefonicamente per concordare un trattamento adeguato.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta =
      response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Rimuove nomi, email e numeri generici o errati
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");
    risposta = risposta.replace(/\S+@\S+\.\S+/g, "");
    risposta = risposta.replace(/(?:\b\d{6,}\b|X{6,}|\d{2,}\s?\d{2,}\s?\d{2,})/g, "");

    // Aggiunge sempre la firma corretta
    risposta +=
      "\n\nPer prenotazioni o informazioni, contattaci presso il nostro centro telefonando allo 0332 624820.";

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore nella risposta GPT:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore nel generare una risposta." }),
    };
  }
};
