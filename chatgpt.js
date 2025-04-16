const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale",
  "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione", "Mammografia",
  "Otoplastica", "Otturazioni", "Visita cardiologica", "Visita ginecologica"
];

function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zÀ-ſ\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene"];
  return frasi.includes(normalizzaTesto(testo));
}

function èDomandaSuPosizione(testo) {
  const frasi = [
    "dove siete", "dove vi trovate", "dove siete situati", "dove vi trovo", "indirizzo", "sede", "come raggiungervi"
  ];
  const testoNorm = normalizzaTesto(testo);
  return frasi.some(frase => testoNorm.includes(frase));
}

function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleI = base.replace(/a$/, "e");
    const pluraleE = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleI) || testoDomanda.includes(pluraleE);
  });
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    if (èDomandaSuPosizione(domanda)) {
      const risposta = `Ci troviamo a Cuvio (VA), in via Milano 19. 📍\nPer qualsiasi informazione o per fissare un appuntamento:\n📞 0332 624820 – 📧 segreteria@csvcuvio.it`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.\nPuoi consultare l’elenco completo delle nostre prestazioni nella brochure disponibile in formato PDF: https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link\n\n📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, corretto grammaticalmente e informativo.

✅ Se l’utente segnala un malessere (es: "ho mal di pancia", "mi sento male"), dopo aver consigliato di contattare il centro, aggiungi solo un consiglio utile (riposo, impacchi, bere acqua, ecc.).

❌ Non fornire mai consigli sanitari generici se non c'è un malessere esplicito.

❌ Evita frasi come “contatta il tuo medico”, “dentista di fiducia” o “pronto soccorso”. Devi sempre indirizzare al nostro centro.

✅ I contatti devono sempre essere presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

❗Controlla sempre grammatica e sintassi prima di restituire la risposta.`
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

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
