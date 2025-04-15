import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { domanda } = req.body;

    if (!domanda || typeof domanda !== "string") {
      return res.status(400).json({ error: "Domanda non valida" });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Rispondi come assistente del nostro centro sanitario in modo gentile e informativo. Non citare mai il nome del centro. Invita sempre a contattarci al numero 0332 624820 per ogni informazione o per concordare un trattamento adeguato.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Rimuove ogni uso di "Centro Sanitario Valcuvia"
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Elimina espressioni generiche di contatto
    risposta = risposta.replace(/contattaci[^.?!]*[.?!]/gi, "");
    risposta = risposta.replace(/non esitare a contattarci[^.?!]*[.?!]/gi, "");

    // Firma fissa alla fine
    risposta += "\n\nContattaci presso il nostro centro telefonando allo 0332 624820 per concordare un trattamento adeguato.";

    res.status(200).json({ risposta });
  } catch (error) {
    console.error("Errore interno:", error);
    res.status(500).json({ error: "Errore durante la generazione della risposta GPT." });
  }
};
