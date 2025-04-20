const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Prestazioni disponibili
const prestazioniDisponibili = [
  "Addominoplastica", "Agopuntura", "Bleforaplastica", "Carico immediato",
  "Chirurgia estetica del seno", "ECG", "ECG sotto sforzo", "Ecocardiocolordoppler",
  "Ecografie", "Holter cardiaco", "Holter pressorio", "Igiene dentale",
  "Lipoemulsione sottocutanea", "Liposcultura", "Liposuzione", "Mammografia",
  "Otoplastica", "Otturazioni", "Visita cardiologica", "Visita ginecologica"
];

const segnaliMalessere = [
  "mal di", "mi fa male", "non sto bene", "sto male", "dolore", 
  "bruciore", "nausea", "sento male", "male a", "malessere"
];

// Utility
function normalizzaTesto(testo) {
  return testo.toLowerCase().replace(/[^a-zà-ú\s]/gi, "").replace(/\s+/g, " ").trim();
}

function èDomandaGenerica(testo) {
  const frasi = ["ciao", "salve", "buongiorno", "buonasera", "grazie", "ok", "va bene"];
  const testoNorm = normalizzaTesto(testo);
  return frasi.includes(testoNorm);
}

function contienePrestazione(domanda) {
  const testoDomanda = normalizzaTesto(domanda);
  return prestazioniDisponibili.some(prestazione => {
    const base = normalizzaTesto(prestazione);
    const pluraleE = base.replace(/a$/, "e");
    const pluraleI = base.replace(/o$/, "i");
    return testoDomanda.includes(base) || testoDomanda.includes(pluraleE) || testoDomanda.includes(pluraleI);
  });
}

function contieneSintomi(testo) {
  const testoNorm = normalizzaTesto(testo);
  return segnaliMalessere.some(segno => testoNorm.includes(segno));
}

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const domanda = body.domanda || "";

    if (èDomandaGenerica(domanda)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: "Ciao! Come posso aiutarti oggi?" }),
      };
    }

    if (contieneSintomi(domanda)) {
      const rispostaSintomo = `Mi dispiace che tu non ti senta bene. Ti consigliamo di contattare il nostro centro per un consulto personalizzato.📞 Chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.\n\nNel frattempo, se il disturbo è lieve, potresti:\n- riposare\n- bere acqua\n- evitare sforzi\n- applicare un impacco caldo o freddo, se appropriato`;
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta: rispostaSintomo }),
      };
    }

    if (/dove.*(siete|vi trovo|trovate)/i.test(domanda)) {
      const risposta = "📍 Ci troviamo a Cuvio (VA), in Via Enrico Fermi, 6 – 21030. " +
        "📞 Per qualsiasi informazione o per fissare un appuntamento: chiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.";
      return {
        statusCode: 200,
        body: JSON.stringify({ risposta }),
      };
    }

    if (!contienePrestazione(domanda)) {
      const risposta = `
Mi dispiace, ma al momento il servizio richiesto non è tra quelli offerti dal nostro centro.<br><br>
📄 <a href="https://drive.google.com/file/d/1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD/view?usp=drive_link" target="_blank">SCARICA ELENCO PRESTAZIONI CSV</a><br><br>
📞 Per ulteriori informazioni o per fissare un appuntamento: chiama lo <strong>0332 624820</strong> oppure scrivi a 📧 <strong>segreteria@csvcuvio.it</strong>.
      `;
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

✅ Se l’utente segnala un malessere (es: \"ho mal di pancia\", \"mi sento male\", \"mi fa male il ginocchio\"), puoi aggiungere un consiglio utile di buon senso, ad esempio:
- riposare
- bere acqua
- fare impacchi (freddi o caldi, in base al contesto)
- evitare sforzi
- alimentazione leggera
- mantenersi idratati
- evitare di toccare o sforzare la zona dolorante

❌ Non fornire mai consigli medici specifici o diagnosi.
❌ Non dire mai \"contatta il medico\", \"vai al pronto soccorso\" o simili.
❌ Se non è presente un sintomo, NON fornire alcun consiglio sanitario.

✅ I contatti devono essere sempre presenti:
📞 0332 624820
📧 segreteria@csvcuvio.it

📍 L'indirizzo del centro è: Via Enrico Fermi, 6 – 21030 Cuvio (VA).
          `,
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
      .replace(/(contatta(ci)?|rivolgi(ti)? a) (un|il) (professionista|specialista)/gi, "contatta il nostro centro");

    const contatti = `\n\n📞 Per informazioni o per fissare un appuntamento:\nChiama lo 0332 624820 oppure scrivi a 📧 segreteria@csvcuvio.it.`;
    if (!risposta.includes("0332 624820") || !risposta.includes("segreteria@csvcuvio.it")) {
      risposta += contatti;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ risposta }),
    };
  } catch (error) {
    console.error("Errore nella funzione chatbot:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante la generazione della risposta." }),
    };
  }
};
