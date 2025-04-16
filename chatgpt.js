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
          content: `Rispondi come un assistente gentile e professionale. Non usare mai il nome "Centro Sanitario Valcuvia": usa sempre "il nostro centro". Se l'utente accenna a malesseri, dolori o disagi fisici, concludi la risposta dicendo: "Ti consigliamo di chiamarci allo 0332 624820 in modo da poterti indirizzare allo specialista più indicato per il tuo caso."`,
        },
        {
          role: "user",
          content: domanda,
        }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Sostituisce ogni occorrenza del nome del centro con "il nostro centro"
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Aggiunge la frase finale se non già inclusa
    const firma = "Ti consigliamo di chiamarci allo 0332 624820 in modo da poterti indirizzare allo specialista più indicato per il tuo caso.";
    if (!risposta.includes("0332 624820")) {
      risposta += `\n\n${firma}`;
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
