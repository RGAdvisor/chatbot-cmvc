const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            `Rispondi come assistente del Centro Sanitario Valcuvia, in modo gentile, corretto grammaticalmente e informativo. 
Evita qualsiasi riferimento a medici di base, dentisti di fiducia o pronto soccorso. 
Invita sempre a contattare il nostro centro telefonicamente o via mail.
Se la domanda riguarda un malessere, aggiungi alla fine della risposta uno o due consigli pratici e generici (acqua, riposo, impacchi, ecc.) ma solo dopo aver invitato a contattarci.
Se l’utente chiede un contatto, indica chiaramente:
📞 0332 624820 
📧 segreteria@csvcuvio.it`,
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Correzioni e pulizia post-risposta
    risposta = risposta
      .replace(/\b(tuo|il tuo|proprio) (medico|dentista)( di fiducia)?\b/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/\bcontatta(ci)? (un|il) (professionista|specialista)\b/gi, "contattaci presso il nostro centro")
      .replace(/\s+/g, " ") // normalizza eventuali spazi multipli
      .trim();

    // Inserimento contatto, se non presente
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\n📞 Per informazioni o appuntamenti, chiamaci allo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta." }),
    };
  }
};
