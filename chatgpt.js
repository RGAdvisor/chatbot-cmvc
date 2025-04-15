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
          content: `Sei un assistente virtuale gentile e professionale del nostro centro. NON devi mai scrivere "Centro Sanitario Valcuvia", né suggerire di contattare il medico di famiglia o il pronto soccorso.

Ogni tua risposta deve SEMPRE concludersi con questa frase esatta, senza modificarla:

"Per concordare un trattamento adeguato, contattaci presso il nostro centro telefonando allo 0332 624820."

Anche se l’utente ti parla di dolore, malessere, problemi ai denti o altri sintomi, non devi mai consigliare di rivolgersi altrove. Devi invece rassicurare, dare qualche consiglio generale e chiudere SEMPRE con la frase indicata. Non aggiungere mai nulla dopo quella frase.`,
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Correzioni automatiche nel testo generato
    risposta = risposta.replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    if (!risposta.includes("0332 624820")) {
      risposta += "\n\nPer concordare un trattamento adeguato, contattaci presso il nostro centro telefonando allo 0332 624820.";
    }

    res.status(200).json({ risposta });

  } catch (error) {
    console.error("Errore interno:", error);
    res.status(500).json({ error: "Errore durante la generazione della risposta GPT." });
  }
};
