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
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, grammaticalmente corretto e informativo.

📌 Quando l’utente segnala un malessere (es. "mal di pancia", "mi fa male", "non sto bene", ecc.), dopo aver suggerito di contattare il nostro centro, puoi includere un breve consiglio pratico utile (es. riposo, bere acqua, impacchi, ecc.).

❌ Se l’utente NON segnala sintomi o problemi di salute, NON fornire consigli sanitari generici.

❌ Non fare riferimento a "il tuo medico", "il dentista di fiducia", "il pronto soccorso" o "uno specialista". Tutti gli inviti devono essere rivolti al nostro centro.

✔️ I contatti devono essere sempre presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

❗Correggi eventuali errori grammaticali o di sintassi prima di restituire la risposta.
        `,
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia e sostituzioni di sicurezza
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    // Verifica se ha già fornito i contatti
    const telefono = "0332 624820";
    const mail = "segreteria@csvcuvio.it";
    const contatti = `\n\n📞 Per informazioni o per fissare un appuntamento:\nChiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;

    if (!risposta.includes("0332 624820") && !risposta.includes("segreteria@csvcuvio.it")) {
      risposta += contatti;
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
