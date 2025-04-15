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
          content: `Rispondi come un assistente del nostro centro, in modo empatico e rassicurante. 
Non nominare mai il nome del centro. Non suggerire mai "di contattare il proprio medico o un dentista". 
Ogni risposta deve terminare invitando l’utente a contattarci presso il nostro centro telefonando allo 0332 624820 per concordare un trattamento adeguato.`,
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Rimuove riferimenti al nome del centro
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Rimuove frasi generiche come "prenota una visita presso un dentista..."
    risposta = risposta.replace(/prenotare una visita presso (un|il) dentista.*?(?:\.|\n)/gi, "");

    // Aggiunge la firma corretta SOLO se non già presente
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\nPer concordare un trattamento adeguato, contattaci presso il nostro centro telefonando allo 0332 624820.";
    }

    res.status(200).json({ risposta });
  } catch (error) {
    console.error("Errore interno:", error);
    res.status(500).json({ error: "Errore durante la generazione della risposta GPT." });
  }
};
