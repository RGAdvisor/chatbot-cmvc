import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Sei un assistente di un centro sanitario. Rispondi in modo gentile, chiaro e informativo.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-3.5-turbo'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.choices[0].message.content })
    };

  } catch (error) {
    console.error('Errore GPT:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore nel generare una risposta.' })
    };
  }
}
