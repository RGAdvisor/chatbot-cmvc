const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  try {
    const { domanda } = JSON.parse(event.body);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Rispondi come assistente del nostro centro sanitario in modo gentile e informativo. Non menzionare mai il nome del centro, ma invita a contattarci direttamente. Se l'utente parla di un sintomo, dolore o malessere, consiglia sempre di contattarci telefonicamente allo 0332 624820 per ricevere assistenza e per fissare un appuntamento con lo specialista più adatto. L’indirizzo email è info@csvcuvio.it.",
        },
        {
          role: "user",
          content: domanda,
        },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Sostituzioni per eliminare riferimenti errati o generici
    risposta = risposta
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/il tuo dentista di fiducia/gi, "il nostro centro")
      .replace(/il tuo dentista/gi, "il nostro centro")
      .replace(/un dentista di fiducia/gi, "uno dei nostri specialisti")
      .replace(/dal dentista/gi, "presso il nostro centro")
      .replace(/il dentista/gi, "uno dei nostri specialisti");

    // Aggiunge i contatti se non presenti già
    if (!risposta.includes("0332 624820")) {
      risposta +=
        "\n\nPer valutare la situazione e ricevere un trattamento adeguato, ti consigliamo di contattarci allo 0332 624820 o via email a info@csvcuvio.it.";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore nella risposta GPT:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore nella chiamata alla funzione GPT." }),
    };
  }
};
