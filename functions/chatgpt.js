// chatbot-function.js
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Prestazioni disponibili
const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo",
  "Ecocardiocolordoppler", "Ecografie", "Holter cardiaco", "Holter pressorio",
  "Igiene dentale", "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione",
  "Mammografia", "Otoplastica", "Otturazioni", "Visita cardiologica",
  "Visita ginecologica"
];

const brochureLink =
  '<a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank">📄 SCARICA ELENCO PRESTAZIONI CSV</a>';

function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zà-ü\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene", "come state", "da dove vieni"];
  return frasi.includes(normalizzaTesto(testo));
}

function domandaSuPosizione(testo) {
  return /dove (siete|vi trovo|si trova|trovate)/i.test(testo);
}

function contienePrestazione(domanda) {
  const testo = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prest => {
    const base = normalizzaTesto(prest);
    const pluraleA = base.replace(/a$/, "e");
    const pluraleO = base.replace(/o$/, "i");
    return testo.includes(base) || testo.includes(pluraleA) || testo.includes(pluraleO);
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

    if (domandaSuPosizione(domanda)) {
      const risposta = `Ci troviamo a Cuvio (VA), in via Enrico Fermi 6. 📍 Per informazioni o appuntamenti: ☎️ 0332 624820 – 📧 segreteria@csvcuvio.it.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.<br><br>
      ${brochureLink}<br><br>
      ☎️ Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Risposta con OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo gentile, corretto e informativo.

✅ Se l'utente segnala un malessere (es: mal di denti), invita a contattare il nostro centro e aggiungi un piccolo consiglio utile (es. riposo, impacchi freddi/caldi, ecc.).
❌ Non dare consigli se non si parla di sintomi.
❌ Non usare: medico di base, dentista di fiducia, pronto soccorso. Usa sempre "il nostro centro sanitario".
✅ I contatti devono sempre essere presenti:
  ☎️ 0332 624820
  📧 segreteria@csvcuvio.it
  
❗Correggi grammatica e sintassi prima della risposta.`
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    const contatti = `<br><br>☎️ Per informazioni o per fissare un appuntamento:<br>Chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>`;

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
