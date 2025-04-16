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
          content:
            "Rispondi come assistente del nostro centro in modo gentile, empatico e informativo. Evita di menzionare 'Centro Sanitario Valcuvia' e non suggerire di rivolgersi a un medico generico o pronto soccorso. Ricorda sempre di indirizzare l’utente a contattarci per fissare un appuntamento o per ricevere il trattamento più adatto alla sua situazione.",
        },
        {
          role: "user",
          content: domanda,
        },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Corregge riferimenti impropri
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");
    risposta = risposta.replace(/www\.centrosanitariovalcuvia\.it/gi, "www.csvcuvio.it");
    risposta = risposta.replace(/info@centrosanitariovalcuvia\.it/gi, "info@csvcuvio.it");

    // Aggiunge blocco contatti se rilevante
    if (
      !risposta.includes("0332 624820") &&
      /dolore|male|malessere|non sto bene|contattare|informazioni|appuntamento/i.test(risposta)
    ) {
      risposta += "\n\nPer informazioni o appuntamenti, puoi contattarci presso il nostro centro telefonando allo 0332 624820 o scrivendo a info@csvcuvio.it. Puoi anche visitare il sito www.csvcuvio.it.";
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
