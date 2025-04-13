let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

let audio = null;

function speak(text) {
    if (text) {
        let textSpeak = new SpeechSynthesisUtterance(text);
        textSpeak.rate = 1;
        textSpeak.pitch = 1;
        textSpeak.volume = 1;
        window.speechSynthesis.speak(textSpeak);
    }
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good morning");
    } else if (hours >= 12 && hours < 16) {
        speak("Good afternoon");
    } else {
        speak("Good evening");
    }
}

window.addEventListener('load', () => {
    wishMe();
});

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    let recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript.toLowerCase();
        console.log(transcript);
        content.textContent = `✅ You said: "${transcript}"`;

        // ✅ Send transcript to backend
        fetch("http://localhost:5000/api/save-speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: transcript })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Saved to MySQL:", data);
        })
        .catch(error => {
            console.error("Error sending speech to server:", error);
        });

        takeCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        content.textContent = '❌ Error: ' + event.error;
    };

    btn.addEventListener("click", () => {
        recognition.start();
        content.textContent = "🎤 Listening...";
        btn.style.display = "none";
        voice.style.display = "block";
    });
} else {
    console.error("Speech Recognition API not supported in this browser.");
}

function takeCommand(message) {
    btn.style.display = "flex";
    voice.style.display = "none";

    if (message.includes("hello") || message.includes("hey") || message.includes("hi")) {
        setTimeout(() => speak("Hey! How can I assist you?"), 100);
    } else if (message.includes("who are you")) {
        setTimeout(() => speak("I am a virtual assistant, created by SR."), 100);
    } else if (message.includes("how are you work")) {
        setTimeout(() => speak("just tell me"), 100);
    } else if (message.includes("how are you")) {
        setTimeout(() => speak("I am just a program, but thank you for asking!"), 100);
    } else if (message.includes("weather")) {
        getWeather();
    } else if (message.includes("open youtube")) {
        setTimeout(() => {
            speak("opening youtube");
            window.open("https://www.youtube.com/", "_blank");
        }, 100);
    } else if (message.includes("open google")) {
        setTimeout(() => {
            speak("opening google");
            window.open("https://www.google.co.in/", "_blank");
        }, 100);
    } else if (message.includes("open instagram")) {
        setTimeout(() => {
            speak("opening instagram");
            window.open("https://www.instagram.com/accounts/login/", "_blank");
        }, 100);
    } else if (message.includes("open facebook")) {
        setTimeout(() => {
            speak("opening facebook");
            window.open("https://www.facebook.com/", "_blank");
        }, 100);
    } else if (message.includes("open snapchat")) {
        setTimeout(() => {
            speak("opening snapchat");
            window.open("https://www.snapchat.com/", "_blank");
        }, 100);
    } else if (message.includes("open map")) {
        setTimeout(() => {
            speak("opening google map");
            window.open("https://maps.google.com/", "_blank");
        }, 100);
    } else if (message.includes("open earth")) {
        setTimeout(() => {
            speak("opening google earth");
            window.open("https://earth.google.com/web", "_blank");
        }, 100);
    } else if (message.includes("open chatgpt")) {
        setTimeout(() => {
            speak("opening chatgpt");
            window.open("https://chatgpt.com/", "_blank");
        }, 100);
    } else if (message.includes("calculate")) {
        let calculation = message.replace(/calculate|calculate the|find|solve|what is/gi, "").trim();
        if (calculation) {
            try {
                let result = eval(calculation);
                speak(`The result is ${result}`);
            } catch (error) {
                speak("Sorry, I couldn't calculate that.");
            }
        } else {
            speak("Please provide a calculation.");
        }
    } else if (message.includes("day") || message.includes("today")) {
        let day = new Date();
        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let currentDay = daysOfWeek[day.getDay()];
        speak(`Today is ${currentDay}`);
    } else if (message.includes("play song") || message.includes("play music")) {
        setTimeout(() => {
            speak("Playing your song");
            audio = new Audio('The Placement Song - Life of Every Engineer.mp3');
            audio.play();
        }, 100);
    } else if (message.includes("stop song") || message.includes("stop music")) {
        setTimeout(() => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                speak("The song has been stopped.");
            } else {
                speak("No song is currently playing.");
            }
        }, 100);
    } else {
        let searchTerm = message.replace(/naruto|naroto/gi, "").trim();
        if (searchTerm) {
            let finalText = `This is what I found on the internet regarding ${searchTerm}`;
            speak(finalText);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, "_blank");
        } else {
            speak("I'm not sure what you're looking for.");
        }
    }
}

function getWeather() {
    let city = "Indian";
    let apiKey = "630c7e1c1985a7ad49536c591daa3419";
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.main) {
                let temperature = data.main.temp;
                let weatherDescription = data.weather[0].description;
                let weatherInfo = `The current temperature in ${city} is ${temperature}°C with ${weatherDescription}.`;
                speak(weatherInfo);
            } else {
                speak("Sorry, I couldn't fetch the weather information.");
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            speak("Sorry, there was an error getting the weather information.");
        });
}
