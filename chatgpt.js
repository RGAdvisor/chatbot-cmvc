const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async function(event, context) {
  try {
    const { domanda } = JSON.parse(event.body);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Rispondi come assistente del nostro centro medico in modo gentile, empatico e informativo. Non usare il nome del centro, ma di' sempre 'presso il nostro centro'. Se rilevi un sintomo o malessere, invita a contattare il nostro centro telefonicamente allo 0332 624820 per concordare un trattamento adeguato.",
        },
        {
          role: "user",
          content: domanda,
        }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Sostituisce ogni menzione del nome del centro
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Aggiunge la firma telefonica se non presente
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\nPer informazioni o per prenotare una visita, contattaci presso il nostro centro telefonando allo 0332 624820.";
    }

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
