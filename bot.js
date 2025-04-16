const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    const icon = className === "incoming" ? `<span class="material-symbols-outlined">smart_toy</span>` : "";
    chatLi.innerHTML = `${icon}<p></p>`;
    chatLi.querySelector("p").innerHTML = message;
    return chatLi;
};

const formatAsLinkAndOpen = (text) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/;
    if (urlPattern.test(text)) {
        let formattedUrl = text;
        if (!formattedUrl.startsWith("http")) {
            formattedUrl = "https://" + formattedUrl;
        }
        window.open(formattedUrl, '_blank');
        return `Opening website: <a href="${formattedUrl}" target="_blank">${formattedUrl}</a>`;
    }
    return null;
};

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    const lowerMsg = userMessage.toLowerCase();

    const commands = {
        "help": "🆘 Ask anything! Commands: help, hello, time, date, joke, quote, open google, open youtube, open github",
        "hello": " Hi there! How can I assist you today?",
        "hi": "Hello! ",
        "about": " I'm a chatbot built using JavaScript!",
        "creator": "‍ I was created by a developer.",
        "your name": "I'm ChatBuddy ",
        "how are you": "I'm great! Just code and coffee ☕",
        "thanks": "You're welcome! ",
        "bye": "Goodbye! ",
        "time": ` Current time: ${new Date().toLocaleTimeString()}`,
        "date": ` Date: ${new Date().toLocaleDateString()}`,
        "joke": " Why do programmers prefer dark mode? Because light attracts bugs!",
        "quote": " “Code is like humor. When you have to explain it, it’s bad.” – Cory House",
        "open google": "https://www.google.com",
        "open youtube": "https://www.youtube.com",
        "open github": "https://github.com"
    };

    if (commands[lowerMsg]) {
        const cmdResponse = formatAsLinkAndOpen(commands[lowerMsg]) || commands[lowerMsg];
        messageElement.innerHTML = cmdResponse;
        chatbox.scrollTo(0, chatbox.scrollHeight);
        return;
    }

    const siteLink = formatAsLinkAndOpen(userMessage);
    if (siteLink) {
        messageElement.innerHTML = siteLink;
        chatbox.scrollTo(0, chatbox.scrollHeight);
        return;
    }

    if (lowerMsg.startsWith("what is")) {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(userMessage.substring(8))}`;

        fetch(wikiUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.extract) {
                    const shortExtract = data.extract.split('. ').slice(0, 2).join('. ') + '.';
                    messageElement.innerHTML = `
                         <b>${data.title}</b><br>
                        ${shortExtract}<br>
                        <a href="${data.content_urls.desktop.page}" target="_blank">Read more</a>
                    `;
                } else {
                    messageElement.textContent = " Sorry, I couldn't find info on that topic.";
                }
            })
            .catch(error => {
                console.error("Wikipedia API error:", error);
                messageElement.classList.add("error");
                messageElement.textContent = "⚠️ Failed to fetch info. Check console for details.";
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
        return;
    }

    messageElement.textContent = " Please be more specific.";
    chatbox.scrollTo(0, chatbox.scrollHeight);
};

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
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));