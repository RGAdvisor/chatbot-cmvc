document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.question-button');
  const rispostaFissa = document.getElementById('risposta-fissa');
  const chatContainer = document.getElementById('chat-container');
  const textarea = document.getElementById('domanda');
  const inviaButton = document.getElementById('invia');

  const rispostePredefinite = {
    "Come posso prenotare una visita?": "Puoi prenotare una visita chiamando il numero 0332 624820 o scrivendo a segreteria@csvcuvio.it.",
    "Quali sono i vostri orari?": "Siamo aperti dal lunedì al venerdì, dalle 8:00 alle 18:00.",
    "Dove si trova il Centro?": "Il Centro Sanitario Valcuvia si trova in Via Roma 10, Cuvio (VA).",
    "Quali servizi fornite?": "Offriamo una vasta gamma di servizi sanitari, tra cui visite specialistiche, analisi di laboratorio e diagnostica per immagini."
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const domanda = button.textContent;
      const risposta = rispostePredefinite[domanda] || "Mi dispiace, non ho una risposta predefinita per questa domanda.";
      rispostaFissa.textContent = risposta;
      rispostaFissa.style.display = 'block';
    });
  });

  inviaButton.addEventListener('click', () => {
    const domanda = textarea.value.trim();
    if (domanda === '') return;

    // Aggiungi il messaggio dell'utente alla chat
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user');
    userMessage.textContent = domanda;
    chatContainer.appendChild(userMessage);

    // Simula una risposta del bot
    const botMessage = document.createElement('div');
    botMessage.classList.add('message', 'bot');
    botMessage.textContent = "Grazie per la tua domanda. Ti risponderemo al più presto.";
    chatContainer.appendChild(botMessage);

    // Pulisci il campo di input
    textarea.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
});
