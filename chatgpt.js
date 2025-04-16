const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Elenco prestazioni disponibili
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

// Utility di normalizzazione testo
function normalizzaTesto(testo) {
  return testo.toLowerCase()
    .replace(/[^a-zàèéìòù\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Riconoscimento di domande generiche
function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok"];
  return frasi.includes(normalizzaTesto(testo));
}

// Riconoscimento di domande sull’indirizzo
function èDomandaIndirizzo(testo) {
  const frasi = ["dove siete", "dove vi trovo", "dove si trova il centro", "sede", "indirizzo"];
  const normalizzato = normalizzaTesto(testo);
  return frasi.some(f => normalizzato.includes(f));
}

// Verifica se la prestazione è tra quelle erogate
function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleA = base.replace(/a$/, "e");
    const pluraleO = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleA) || testoDomanda.includes(pluraleO);
  });
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // Risposte predefinite
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    if (èDomandaIndirizzo(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta: `📍 Ci troviamo a **Cuvio, Via Enrico Fermi, 6 (VA)**.\n\n📞 Per qualsiasi informazione o per fissare un appuntamento:\nchiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`
        }),
      };
    }

    if (!contienePrestazione(domanda)) {
     const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.  
📄 [SCARICA ELENCO PRESTAZIONI CSV](https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link)  
📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;

      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Chiamata a OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei un assistente virtuale del Centro Sanitario Valcuvia. Rispondi in modo gentile, corretto e informativo.

✅ Se l’utente segnala un malessere (es. “ho mal di pancia”), suggerisci di contattare il centro e puoi aggiungere un consiglio pratico (bere acqua, riposo, impacchi).

❌ Non fornire consigli sanitari generici se non si parla di sintomi.

❌ Non usare espressioni come “contatta il tuo medico”, “dentista di fiducia” o “pronto soccorso”. Devi sempre dire “il nostro centro”.

✅ Includi sempre i contatti:
📞 0332 624820 – 📧 segreteria@csvcuvio.it

❗ Controlla grammatica e sintassi prima di rispondere.
          `
        },
        { role: "user", content: domanda }
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia testo
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
