const chatbox = document.getElementById("chatbox");
const input = document.getElementById("input");
const typing = document.getElementById("typing");
const historyBox = document.getElementById("history");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
let questionLog = JSON.parse(localStorage.getItem("hexaQuestionLog")) || [];

// 🔥 NO API KEYS HERE! 100% SECURE.

let cachedModelName = "";
let localData = [];

// ---------------- SYSTEM PROMPT ----------------
const SYSTEM_PROMPT = `You are Hexa Core, an AI assistant of a web app with 6 features:
1. Weather App
2. Chatbot
3. Cyber-Link Game
4. Image Generator
5. CV Analyzer
6. To-Do List

Also includes OTP login, Contact page, About page.

Answer shortly (max 3 sentences).`;

// ---------------- LOAD CSV ----------------
async function loadCSV() {
    try {
        const res = await fetch("data.csv");
        const text = await res.text();

        const rows = text.split("\n").slice(1);

        rows.forEach(row => {
            if (!row.trim()) return;

            const parts = row.split(/,(.+)/);
            if (parts.length < 3) return;

            const intent = parts[0];
            const rest = parts[1].split(/,(.+)/);

            if (rest.length < 2) return;

            const keywords = rest[0];
            const response = rest[1];

            localData.push({
                keywords: keywords.split(";").map(k => k.trim()),
                response: response.replace(/"/g, "").trim()
            });
        });

        console.log("✅ CSV Loaded:", localData.length);
    } catch (err) {
        console.error("CSV Load Error:", err);
    }
}

loadCSV();

// ---------------- SMART MATCH ----------------
function getLocalResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    localData.forEach(item => {
        let score = 0;

        item.keywords.forEach(keyword => {
            if (msg.includes(keyword)) {
                score++;
            }
        });

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    });

    return bestScore > 0 ? bestMatch.response : null;
}

// ---------------- SECURE FETCH (Talks to PHP) ----------------
async function fetchAIReply(message) {
    try {
        const res = await fetch("chat_api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                system_prompt: SYSTEM_PROMPT
            })
        });

        if (res.status === 500) {
            return "⚠️ Server Crash (500). Check if config.php has a typo or missing semicolon.";
        }

        const data = await res.json();
        
        if (data.error) {
            return "⚠️ " + (data.error.message || data.error);
        }

        return data.choices?.[0]?.message?.content || "⚠️ AI returned no text.";

    } catch (err) {
        console.error("DEBUG:", err);
        return "⚠️ Connection Error. Ensure your PHP server is running.";
    }
}

// ---------------- UI FUNCTIONS ----------------
function addMsg(text, type, save = true) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.innerText = text;

    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;

    if (save) {
        chatHistory.push({ text, type });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        renderHistory();
    }
}

function renderHistory() {
    historyBox.innerHTML = "";

    const userMessages = chatHistory
        .filter(item => item.type === "user")
        .slice(-10)
        .reverse();

    if (!userMessages.length) {
        historyBox.innerHTML = "No recent prompts";
        return;
    }

    userMessages.forEach(item => {
        const div = document.createElement("div");
        div.innerText = item.text.substring(0, 40);
        div.onclick = () => loadChatFromPrompt(item.text);
        historyBox.appendChild(div);
    });
}

function loadChatFromPrompt(promptText) {
    chatbox.innerHTML = "";

    chatHistory.forEach(item => {
        if (item.text === promptText || item.type === "bot") {
            addMsg(item.text, item.type, false);
        }
    });
}

function saveQuestionToLog(question) {
    questionLog.push({
        question,
        time: new Date().toLocaleString()
    });
    localStorage.setItem("hexaQuestionLog", JSON.stringify(questionLog));
}

// ---------------- MAIN SEND FUNCTION ----------------
async function send() {
    const message = input.value.trim();
    if (!message) return;

    addMsg(message, "user");
    saveQuestionToLog(message);
    input.value = "";

    typing.style.display = "flex";

    // LOCAL RESPONSE (FAST)
    const localReply = getLocalResponse(message);

    if (localReply) {
        typing.style.display = "none";
        addMsg(localReply, "bot");
        return;
    }

    // AI FALLBACK (Talks to PHP safely)
    const aiReply = await fetchAIReply(message);

    typing.style.display = "none";
    addMsg(aiReply, "bot");
}

// ---------------- EVENTS ----------------
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") send();
});

// ---------------- INIT ----------------
renderHistory();
addMsg("Hello! I'm Hexa Core 🤖 Ask me about your app or anything!", "bot", false);

// ---------------- MISSING BUTTON FUNCTIONS ----------------
function newChat() {
    chatbox.innerHTML = "";
    addMsg("New chat started. Ask me anything.", "bot", false);
}

function clearHistory() {
    localStorage.removeItem("chatHistory");
    chatHistory = [];
    historyBox.innerHTML = "";
    chatbox.innerHTML = "";
    addMsg("Chat history cleared.", "bot", false);
}

function downloadCVLog() {
    const saved = JSON.parse(localStorage.getItem("hexaQuestionLog")) || [];
    let content = "HEXA CHAT QUESTIONS\n\n";

    if (!saved.length) {
        content += "No questions available.";
    } else {
        saved.forEach((item, i) => {
            content += `${i + 1}. ${item.question}\nTime: ${item.time}\n\n`;
        });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat-questions.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function fillPrompt(text) {
    input.value = text;
    input.focus();
}