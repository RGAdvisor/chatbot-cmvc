/* Corpo principale */
body {
  font-family: Arial, sans-serif;
  background-color: #e0f7fa;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Container per il layout centrale */
.container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 30px;
  text-align: center;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Titolo principale */
h1 {
  color: #00796b;
  font-size: 26px;
  margin-bottom: 20px;
}

/* Pulsanti per le opzioni */
.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  background-color: #00796b;
  color: white;
  border: none;
  padding: 12px;
  cursor: pointer;
  width: 100%;
  max-width: 380px;
  margin: 5px auto;
  font-size: 14px;
  border-radius: 8px;
}

button:hover {
  background-color: #004d40;
}

/* Casella della chat (domanda/risposta) */
.chat-box {
  background-color: #00796b;
  color: white;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
  min-height: 50px;
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  text-align: left;
  word-wrap: break-word;
  font-size: 16px;
}

/* Casella di input */
.input-box {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

textarea {
  width: 80%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #00796b;
  font-size: 14px;
  height: 100px;
  resize: none;
}

textarea:focus {
  outline: none;
  border-color: #004d40;
}

button[type="submit"] {
  background-color: #00796b;
  color: white;
  padding: 12px;
  border: none;
  cursor: pointer;
  width: 70%;
  max-width: 300px;
  font-size: 14px;
  border-radius: 8px;
}

button[type="submit"]:hover {
  background-color: #004d40;
}

/* Footer */
.footer {
  font-size: 12px;
  margin-top: 20px;
  color: #00796b;
}

footer a {
  color: #004d40;
  text-decoration: none;
}
