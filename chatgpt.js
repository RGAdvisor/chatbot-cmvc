import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (err) {
    console.error("Errore nel parsing del body:", err);
    return res.status(400).json({ error: "Corpo della richiesta non valido" });
  }

  const domanda = body?.domanda;

  if (!domanda || typeof domanda !== "string") {
    return res.status(400).json({ error: "Domanda non valida" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sei l'assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo chiaro e gentile.",
        },
        {
          role: "user",
          content: domanda,
        },
      ],
      temperature: 0.5,
    });

    const risposta = completion.choices?.[0]?.message?.content?.trim();

    if (!risposta) {
      throw new Error("La risposta generata è vuota.");
    }

    return res.status(200).json({ risposta });

  } catch (err) {
    console.error("Errore GPT:", err);
    return res.status(500).json({
      error: "Errore interno GPT",
      dettagli: err.message || "Errore sconosciuto",
    });
  }
}
