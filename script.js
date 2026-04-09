document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // ¡IMPORTANTE! Reemplaza esto con tu API Key real de Google AI Studio
    // Puedes obtenerla gratis en: https://aistudio.google.com/app/apikey
    const GEMINI_API_KEY = 'AIzaSyCoSGX0bSJFuQrqEqliHnQ7bR1rQXJpK0Y';

    let conversationHistory = [];

    // Bot initial greeting
    setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            const initialMessage = 'Hola. Soy Dulcecillo Bot, tu espacio seguro. Estoy aquí para escucharte sin juzgar. ¿Cómo te sientes hoy?';
            addMessage(initialMessage, 'bot');
        }, 1500);
    }, 500);

    // Event listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    async function handleSend() {
        const text = userInput.value.trim();
        if (text === '') return;

        // Mostrar mensaje del usuario
        addMessage(text, 'user');
        userInput.value = '';

        // Añadir el mensaje de usuario al historial
        conversationHistory.push({ role: "user", parts: [{ text: text }] });

        showTypingIndicator();

        try {
            // Documentación de la API de Gemini: https://ai.google.dev/api/rest/v1beta/models/generateContent
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

            const requestBody = {
                systemInstruction: {
                    parts: [{
                        text: "Eres Dulcecillo Bot, una inteligencia artificial especializada en soporte emocional y escucha activa, actuando como un terapeuta empático. Tus respuestas deben ser cálidas, sin juicios y fomentando la reflexión. Mantén tus respuestas en español, que sean relativamente breves (1 a 3 párrafos cortos) y haz preguntas para que el usuario continúe expresándose si lo ves conveniente."
                    }]
                },
                contents: conversationHistory
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            removeTypingIndicator();

            if (response.ok && data.candidates && data.candidates.length > 0) {
                const replyText = data.candidates[0].content.parts[0].text;
                addMessage(replyText, 'bot');

                // Añadir respuesta de la IA al historial
                conversationHistory.push({ role: "model", parts: [{ text: replyText }] });
            } else {
                console.error("Error devuelto por la API:", data);
                if (data.error && data.error.message.includes("API key not valid")) {
                    addMessage("Parece que hubo un problema con la API Key. Por favor verifica que la has puesto correctamente en el código.", 'bot');
                } else {
                    addMessage("Lo siento, estoy teniendo dificultades para pensar en este momento. ¿Podemos intentarlo de nuevo?", 'bot');
                }
                conversationHistory.pop(); // Quitamos el último mensaje del usuario para no corromper el historial
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            removeTypingIndicator();
            addMessage("Ocurrió un error al intentar conectarse. Verifica tu conexión a internet.", 'bot');
            conversationHistory.pop();
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        // Formateo simple de Markdown (negritas) que a veces regresa Gemini
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgDiv.innerHTML = formattedText;

        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        chatBox.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
