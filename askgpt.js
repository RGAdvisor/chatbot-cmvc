import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt mancante" }),
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Sei un assistente di un centro sanitario. Rispondi in modo gentile, chiaro e informativo.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const risposta = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore GPT:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Errore generico" }),
    };
  }
}
