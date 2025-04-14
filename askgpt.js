import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Netlify invia il body come stringa, va parsato
    let body;
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: "JSON malformato" });
    }

    const domanda = body?.domanda;

    if (!domanda || typeof domanda !== "string") {
      return res.status(400).json({ error: "Domanda non valida" });
    }

    // Chiamata corretta alle API OpenAI (v4)
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Rispondi come se fossi un assistente del Centro Sanitario Valcuvia.",
        },
        {
          role: "user",
          content: domanda,
        },
      ],
      temperature: 0.5,
    });

    const risposta = response.choices[0]?.message?.content?.trim() || "Nessuna risposta generata.";
    return res.status(200).json({ risposta });

  } catch (error) {
    console.error("Errore interno:", error);
    return res.status(500).json({
      error: "Errore durante la generazione della risposta GPT.",
      dettagli: error.message,
    });
  }
}
