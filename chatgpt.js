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
          content: `Rispondi come assistente di un centro medico. Non usare il nome del centro. Se l'utente segnala sintomi, dolori o malesseri, invita sempre a contattare telefonicamente il centro per essere indirizzato allo specialista adeguato. Sii empatico e rassicurante. Usa 'il nostro centro' invece del nome.`,
        },
        {
          role: "user",
          content: domanda,
        }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Sostituisce "Centro Sanitario Valcuvia" con "il nostro centro"
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Frase da aggiungere sempre per sintomi/dolori
    const firma = "Ti consigliamo di chiamarci allo 0332 624820 in modo da poterti indirizzare allo specialista più indicato per il tuo caso.";

    // Aggiunge la frase finale se non già inclusa
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
