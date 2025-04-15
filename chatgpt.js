const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { domanda } = JSON.parse(event.body);

    if (!domanda || typeof domanda !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Domanda non valida" }),
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Rispondi come assistente del Centro Sanitario Valcuvia in modo gentile e informativo.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    const risposta = response.data.choices[0].message.content;
    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta GPT." }),
    };
  }
};
