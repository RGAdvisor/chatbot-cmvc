/* Reset base */
body {
    font-family: Arial, sans-serif;
    background-color: #f1f1f1;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Titolo */
h1 {
    text-align: center;
    color: #2a7f63;
}

/* Bottoni verdi */
.button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.button-group button {
    background-color: #2a7f63;
    color: white;
    font-size: 16px;
    padding: 12px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
}

.button-group button:hover {
    background-color: #1e5e45;
}

/* Risposta fissa */
.response-box {
    background-color: white;
    border: 2px solid #2a7f63;
    color: #2a7f63;
    font-size: 16px;
    padding: 12px;
    border-radius: 25px;
    margin-top: 15px;
    width: 100%;
    text-align: center;
    min-height: 40px;
}

/* Riga input: bottone bianco + textarea verde */
.input-row {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 10px;
    margin-top: 20px;
}

/* Bottone bianco a sinistra */
.assist-button {
    width: 48%;
    background-color: white;
    border: 2px solid #2a7f63;
    color: #2a7f63;
    font-size: 14px;
    border-radius: 25px;
    padding: 12px;
    text-align: center;
    box-sizing: border-box;
    cursor: default;
}

/* Textarea verde a destra */
.green-textarea {
    width: 48%;
    background-color: #2a7f63;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 14px;
    padding: 12px;
    resize: none;
    box-sizing: border-box;
}

.green-textarea::placeholder {
    color: #e0e0e0;
}

/* Contenitore chat */
.chat-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

/* Messaggi */
.user-message,
.gpt-response {
    padding: 10px;
    border-radius: 10px;
    max-width: 60%;
    word-wrap: break-word;
    font-size: 15px;
}

.user-message {
    background-color: #2a7f63;
    color: white;
    align-self: flex-end;
}

.gpt-response {
    background-color: #f1f1f1;
    border: 1px solid #2a7f63;
    color: #2a7f63;
    align-self: flex-start;
}

/* Footer */
footer {
    text-align: center;
    margin-top: 30px;
    font-size: 13px;
    color: #666;
}
