import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    console.log("Prompt ricevuto:", prompt);

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ errore: "Prompt mancante o non valido" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sei un assistente per il centro sanitario" },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    console.log("Risposta OpenAI:", JSON.stringify(data, null, 2));

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ risposta: "Errore nella risposta da OpenAI" });
    }

    res.json({ risposta: data.choices[0].message.content });

  } catch (error) {
    console.error("Errore interno:", error);
    res.status(500).json({ risposta: "Errore interno del server" });
  }
}
