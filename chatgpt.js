import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { domanda } = req.body;

  if (!domanda || typeof domanda !== "string") {
    return res.status(400).json({ error: "Domanda non valida" });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Rispondi come assistente del Centro Sanitario Valcuvia in modo gentile e informativo." },
        { role: "user", content: domanda }
      ],
      temperature: 0.5
    });

    const risposta = response.data.choices[0].message.content;
    res.status(200).json({ risposta });

  } catch (error) {
    console.error("Errore GPT:", error);
    res.status(500).json({ error: "Errore interno nella funzione GPT." });
  }
};
