const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Prestazioni disponibili
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

// Utility per normalizzazione
function normalizzaTesto(testo) {
  return testo.toLowerCase().replace(/[^a-zàèéìòù\s]/gi, "").trim();
}

// Controllo domande generiche
function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok"];
  const testoNorm = normalizzaTesto(testo);
  return frasi.includes(testoNorm);
}

// Controllo per richiesta indirizzo
function èRichiestaIndirizzo(testo) {
  const paroleChiave = ["dove siete", "indirizzo", "come vi trovo", "dove vi trovo"];
  const testoNorm = normalizzaTesto(testo);
  return paroleChiave.some(p => testoNorm.includes(normalizzaTesto(p)));
}

// Verifica prestazioni
function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const plurale = base.replace(/a$/, "e").replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(plurale);
  });
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda;

    // Risposte rapide
    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    if (èRichiestaIndirizzo(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          risposta:
            "📍 Ci troviamo a **Cuvio (VA), in via Enrico Fermi 6 – 21030**.\n\n📞 Per informazioni o appuntamenti: chiama lo **0332 624820** oppure scrivi a 📧 **segreteria@csvcuvio.it**.",
        }),
      };
    }

    // Se la prestazione non è presente
    if (!contienePrestazione(domanda)) {
      const risposta = `Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.<br><br>📄 <a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank">SCARICA ELENCO PRESTAZIONI CSV</a><br><br>📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    // Invio richiesta a OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Sei l’assistente virtuale del Centro Sanitario Valcuvia. Rispondi sempre in modo gentile, grammaticalmente corretto e professionale.

✅ Se l’utente segnala un malessere (es. “mal di pancia”, “ho dolore”, ecc.), suggerisci prima di contattare il nostro centro, e puoi aggiungere **un solo consiglio pratico** se opportuno (es: bere acqua, riposo, impacchi ecc.).

❌ Non fornire mai consigli sanitari se non sono presenti sintomi.

❌ Non usare mai: “il tuo medico”, “dentista di fiducia”, “pronto soccorso”, “professionista”. Tutti i riferimenti devono essere al **nostro centro**.

✅ Inserisci SEMPRE i contatti:
📞 0332 624820  
📧 segreteria@csvcuvio.it

📍 Indirizzo: Via Enrico Fermi, 6 – 21030 Cuvio (VA)

❗Correggi sempre grammatica e sintassi prima della risposta.
          `,
        },
        { role: "user", content: domanda },
      ],
      temperature: 0.5,
    });

    let risposta = response.data.choices[0]?.message?.content || "Nessuna risposta generata.";

    // Pulizia contenuti
    risposta = risposta
      .replace(/(medico|dentista)( di fiducia)?/gi, "il nostro centro sanitario")
      .replace(/pronto soccorso/gi, "il nostro centro sanitario")
      .replace(/Centro Sanitario Valcuvia/gi, "il nostro centro")
      .replace(/contatta(ci)? (un|il) (professionista|specialista)/gi, "contattaci presso il nostro centro");

    const contatti =
      '<br><br>📞 Per informazioni o appuntamenti: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.';

    if (!risposta.includes("0332 624820") || !risposta.includes("segreteria@csvcuvio.it")) {
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
