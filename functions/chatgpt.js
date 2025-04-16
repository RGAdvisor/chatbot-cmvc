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
          content: `
Sei un assistente del Centro Sanitario Valcuvia. Rispondi in modo gentile, chiaro e rassicurante, usando un linguaggio corretto e facilmente comprensibile da chiunque.

‼️ Prima di restituire la risposta:
- Controlla grammatica, sintassi e fluidità del testo.
- NON usare espressioni come “medico di fiducia”, “pronto soccorso” o “specialista”.
- Indirizza SEMPRE l’utente a contattare il nostro centro telefonicamente allo 0332 624820.
- NON ripetere parole tipo “il il”, “il tuo il nostro” ecc.
- Se l’utente riporta un malessere, indica di contattarci 📞 0332 624820 e POI aggiungi un piccolo consiglio pratico o comportamentale utile (es. bere acqua, evitare cibi irritanti, riposare, ecc.) se coerente con la situazione.

Parla sempre a nome del nostro centro e non usare espressioni impersonali come “si consiglia”.
          `.trim()
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Correzioni automatiche extra
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/(rivolgiti|contatta) (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro");

    // Aggiunta recapito se non incluso
    if (!risposta.includes("0332 624820")) {
      risposta += "\n\n📞 Per informazioni o per fissare un appuntamento, ti invitiamo a contattarci allo 0332 624820.";
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
