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
            "Rispondi come assistente del centro sanitario in modo empatico, gentile e informativo. Evita frasi generiche. Se l'utente riferisce un malessere, consiglia sempre di contattare il centro per concordare un trattamento adeguato. Non usare il nome del centro.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    // Ottieni la risposta
    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Rimuove il nome del centro, se presente
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Aggiunge sempre la frase di contatto se manca
    const firma = "Contattaci presso il nostro centro telefonando allo 0332 624820 per concordare un trattamento adeguato.";
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\n" + firma;
    }

    res.status(200).json({ risposta });
  } catch (error) {
    console.error("Errore interno:", error);
    res.status(500).json({ error: "Errore durante la generazione della risposta GPT." });
  }
};
