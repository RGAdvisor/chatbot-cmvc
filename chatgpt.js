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
            "Rispondi come assistente del nostro centro in modo gentile, empatico e informativo. Non menzionare mai il nome del centro o il medico di famiglia. Non suggerire mai di andare al pronto soccorso. Indirizza sempre a contattare il nostro centro per concordare un trattamento adeguato.",
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta =
      response.data.choices[0]?.message?.content ||
      "Nessuna risposta generata.";

    // Correzioni automatiche
    risposta = risposta
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/medico di famiglia/gi, "il nostro centro")
      .replace(/pronto soccorso/gi, "il nostro centro");

    // Aggiunge la firma finale se non già presente
    if (!risposta.includes("0332 624820")) {
      risposta +=
        "\n\nPer concordare un trattamento adeguato, contattaci presso il nostro centro telefonando allo 0332 624820.";
    }

    res.status(200).json({ risposta });
  } catch (error) {
    console.error("Errore interno:", error);
    res
      .status(500)
      .json({ error: "Errore durante la generazione della risposta GPT." });
  }
};
