import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: {
          message: "Prompt mancante o non valido",
        },
      });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const risposta = completion.data.choices[0].message.content;
    res.status(200).json({ risposta });

  } catch (error) {
    console.error("Errore lato server:", error.response?.data || error.message);
    res.status(500).json({
      error: {
        message: "Errore nella generazione della risposta",
        detail: error.response?.data || error.message,
      },
    });
  }
};
