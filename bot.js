const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // User message
const OPENAI_API_KEY = "PASTE-YOUR-OPENAI-KEY";
const WEATHER_API_KEY = "PASTE-YOUR-OPENWEATHER-API-KEY";
const inputInitHeight = chatInput.scrollHeight;

// Create chat item
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    const icon = className === "incoming" ? `<span class="material-symbols-outlined">smart_toy</span>` : "";
    chatLi.innerHTML = `${icon}<p></p>`;
    chatLi.querySelector("p").innerHTML = message;
    return chatLi;
}

// Open URLs
const formatAsLinkAndOpen = (text) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/;
    if (urlPattern.test(text)) {
        let formattedUrl = text;
        if (!formattedUrl.startsWith("http")) {
            formattedUrl = "https://" + formattedUrl;
        }
        window.open(formattedUrl, '_blank');
        return `Opening website automatically: <a href="${formattedUrl}" target="_blank">${formattedUrl}</a>`;
    }
    return null;
}

// Get weather info from OpenWeather API
const getWeather = async (city = "Delhi") => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === 200) {
            const temp = data.main.temp;
            const desc = data.weather[0].description;
            const cityName = data.name;
            return `🌤️ Weather in ${cityName}: ${temp}°C, ${desc}`;
        } else {
            return `❌ City not found: "${city}"`;
        }
    } catch (error) {
        return "⚠️ Unable to fetch weather. Please try again.";
    }
}

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    const lowerMsg = userMessage.toLowerCase();

    // Command dictionary
    const commands = {
        "help": "🆘 You can ask me anything! Commands: help, hello, time, date, joke, quote, open google, open youtube, weather in [city]",
        "hello": "👋 Hi there! How can I assist you today?",
        "hi": "Hello! 👋",
        "about": "🤖 I'm a chatbot built using OpenAI & JavaScript!",
        "creator": "👨‍💻 I was created by an awesome developer!",
        "your name": "I'm ChatBuddy, your personal assistant 🤖",
        "how are you": "I'm just code, but I'm doing great! 😄",
        "thanks": "You're welcome! 😊",
        "bye": "Goodbye! Have a nice day! 👋",
        "time": `🕒 Current time is: ${new Date().toLocaleTimeString()}`,
        "date": `📅 Today's date is: ${new Date().toLocaleDateString()}`,
        "joke": "😂 Why do programmers prefer dark mode? Because the light attracts bugs!",
        "quote": "💡 “Code is like humor. When you have to explain it, it’s bad.” – Cory House",
        "open google": "https://www.google.com",
        "open youtube": "https://www.youtube.com",
        "open github": "https://github.com"
    };

    // Weather command check
    if (lowerMsg.startsWith("weather in")) {
        const city = userMessage.split("in")[1].trim();
        getWeather(city).then(weatherMsg => {
            messageElement.innerHTML = weatherMsg;
            chatbox.scrollTo(0, chatbox.scrollHeight);
        });
        return;
    }

    // Predefined command check
    if (commands[lowerMsg]) {
        const cmdResponse = formatAsLinkAndOpen(commands[lowerMsg]) || commands[lowerMsg];
        messageElement.innerHTML = cmdResponse;
        chatbox.scrollTo(0, chatbox.scrollHeight);
        return;
    }

    // Direct link detection
    const siteLink = formatAsLinkAndOpen(userMessage);
    if (siteLink) {
        messageElement.innerHTML = siteLink;
        chatbox.scrollTo(0, chatbox.scrollHeight);
        return;
    }

    // OpenAI fallback response
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }]
        })
    };

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            messageElement.textContent = data.choices[0].message.content.trim();
        })
        .catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "⚠️ Oops! Something went wrong.";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

// Chat send handler
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

// Auto-grow input
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Send on Enter
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

// Event listeners
sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
