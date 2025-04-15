const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  try {
    // Controllo su metodo POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    // Parsing del body
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // Controllo che la domanda esista
    if (!domanda) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Domanda mancante" }),
      };
    }

    // Chiamata API OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: domanda }],
    });

    const risposta = completion.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore nella funzione:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Errore interno", error: error.message }),
    };
  }
};
