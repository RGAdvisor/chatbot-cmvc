const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// 👉 questo è il punto importante: la funzione esportata si chiama 'handler'
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: domanda }],
    });

    const risposta = response.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore nella funzione askgpt:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        risposta: "Si è verificato un errore. Riprova più tardi.",
      }),
    };
  }
};
