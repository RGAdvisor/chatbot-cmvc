const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 📄 Prestazioni erogate dal Centro Sanitario Valcuvia
const prestazioniDisponibili = [
  "Addominoplastica",
  "Agopuntura",
  "Bleforaplastica",
  "Carico immediato",
  "Chirurgia estetica del seno",
  "ECG",
  "ECG sotto sforzo",
  "Ecocardiocolordoppler",
  "Ecografie",
  "Holter cardiaco",
  "Holter pressorio",
  "Igiene dentale",
  "Lipoemulsione sottocutanea",
  "Liposcultura",
  "Liposuzione",
  "Mammografia",
  "Otoplastica",
  "Otturazioni",
  "Visita cardiologica",
  "Visita ginecologica"
];

// Domande generiche da escludere dal controllo prestazioni
const frasiGeneriche = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene", "come vi contatto", "come posso contattarvi", "dove siete", "da dove vieni", "come funziona"];

// Normalizzazione testi
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Controllo domande generiche
function èDomandaGenerica(testo) {
  const testoNorm = normalizzaTesto(testo);
  return frasiGeneriche.includes(testoNorm);
}

// Controllo localizzazione
function èDomandaSuDoveSiamo(testo) {
  const testoNorm = normalizzaTesto(testo);
  return testoNorm.includes("dove siete") || testoNorm.includes("dove vi trovo") || testoNorm.includes("indirizzo");
}

// Controllo prestazioni in singolare/plurale
function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleE = base.replace(/a$/, "e");
    const pluraleI = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleE) || testoDomanda.includes(pluraleI);
  });
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // 📍 Localizzazione
    if (èDomandaSuDoveSiamo(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `📍 Ci troviamo a Cuvio (VA), in **Via Enrico Fermi, 6 – 21030**. 
📞 Per qualsiasi informazione o per fissare un appuntamento: chiama lo **0332 624820** oppure scrivi a 📧 **segreteria@csvcuvio.it**.`,
        }),
      };
    }

    // 👋 Risposte generiche tipo "ciao"
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    // ❌ Prestazione NON presente
    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.
📄 <a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank"><strong>SCARICA ELENCO PRESTAZIONI CSV</strong></a><br><br>
📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // ✅ Chat GPT per risposte su prestazioni riconosciute
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, grammaticalmente corretto e informativo.

✅ Se l’utente segnala un malessere (es: "ho mal di pancia", "mi sento male", "mi fa male un dente"), dopo aver consigliato di contattare il centro, puoi aggiungere un piccolo consiglio utile (es: riposare, bere acqua, fare impacchi).

❌ Non fornire consigli sanitari se non c’è un malessere esplicito.

❌ Evita riferimenti a “medico di base”, “dentista di fiducia”, “pronto soccorso”, “specialista generico”.

✅ Inserisci sempre questi contatti:
📞 0332 624820
📧 segreteria@csvcuvio.it

❗Controlla grammatica e sintassi prima di restituire la risposta.
        `
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia finale e sostituzioni
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    const contatti = `<br><br>📞 Per informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.`;

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
