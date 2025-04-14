export async function handler(event, context) {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: 'Funziona! Hai raggiunto correttamente la funzione Lambda.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore interno nella funzione.' })
    };
  }
}
