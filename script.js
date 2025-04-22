const chatContainer = document.getElementById("chat-container");
const textarea = document.getElementById("domanda");
const rispostaFissa = document.getElementById("risposta-fissa");
const csvButton = document.createElement("button");
csvButton.className = "download-button";
csvButton.innerHTML = "📄 SCARICA ELENCO PRESTAZIONI CSV";
csvButton.onclick = () => {
  window.open("https://drive.google.com/uc?export=download&id=1JOPK-rAAu5D330BwCY_7sOcHmkBwD6HD", "_blank");
};

let csvButtonShown = false;

// DOMANDE FISSE
const domandeFisse = {
  button1: "Come posso prenotare una visita?",
  button2: "Quali sono i vostri orari?",
  button3: "Dove si trova il Centro?",
  button4: "Quali servizi fornite?"
};

Object.keys(domandeFisse).forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    rispostaFissa.textContent = "";
    inviaDomanda(domandeFisse[id], true); // passa true per non mostrare il messaggio utente
  });
});

textarea.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const domanda = textarea.value.trim();
    if (domanda) {
      inviaDomanda(domanda, false); // utente ha scritto, quindi mostra il messaggio
      textarea.value = "";
    }
  }
});

function aggiungiMessaggioTesto(testo, classe) {
  const div = document.createElement("div");
  div.className = classe;
  div.innerHTML = testo;
  chatContainer.appendChild(div);
  chatContainer.scrollTop
