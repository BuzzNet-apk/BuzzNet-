/* =========================================================
ik — BUZZNET AI ASSISTANT
Version 1.0
Front-end chat engine
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
   ELEMENTS
   ===================================================== */

const chatArea = document.getElementById("chatArea");
const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("ikWelcome");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const typingIndicator =
    document.getElementById("typingIndicator");

const newChatButton =
    document.getElementById("newChatButton");

const suggestions =
    document.querySelectorAll(".suggestion");


/* =====================================================
   STORAGE
   ===================================================== */

const CHAT_STORAGE_KEY = "buzznet_ik_chat";

function loadMessages() {

    try {

        return JSON.parse(
            localStorage.getItem(CHAT_STORAGE_KEY)
        ) || [];

    } catch (error) {

        console.error("ik storage error:", error);

        return [];

    }

}


function saveMessages(chat) {

    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(chat)
    );

}


/* =====================================================
   HELPERS
   ===================================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function getTime() {

    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function scrollToBottom() {

    if (!chatArea) return;

    setTimeout(() => {

        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        });

    }, 50);

}


/* =====================================================
   CREATE MESSAGE
   ===================================================== */

function addMessage(role, text, save = true) {

    if (!messages) return;

    const message = document.createElement("div");

    message.className =
        role === "user"
            ? "message user"
            : "message assistant";


    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
        role === "user"
            ? "U"
            : "✦";


    const content = document.createElement("div");

    content.className = "message-content";


    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    bubble.innerHTML = escapeHTML(text);


    const time = document.createElement("div");

    time.className = "message-time";

    time.textContent = getTime();


    content.appendChild(bubble);
    content.appendChild(time);

    message.appendChild(avatar);
    message.appendChild(content);

    messages.appendChild(message);


    if (save) {

        const chat = loadMessages();

        chat.push({
            role: role,
            text: text,
            time: new Date().toISOString()
        });

        saveMessages(chat);

    }


    scrollToBottom();

}


/* =====================================================
   LOAD SAVED CONVERSATION
   ===================================================== */

function renderSavedConversation() {

    const chat = loadMessages();

    if (chat.length === 0) {

        return;

    }


    if (welcomeScreen) {

        welcomeScreen.style.display = "none";

    }


    chat.forEach(item => {

        addMessage(
            item.role,
            item.text,
            false
        );

    });


    scrollToBottom();

}


/* =====================================================
   TEMPORARY ik RESPONSE ENGINE
   ===================================================== */

function generateLocalResponse(userText) {

    const text = userText.toLowerCase().trim();


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return "Hello! 👋 I'm ik, your AI assistant inside BuzzNet. What would you like to talk about?";

    }


    if (
        text.includes("who are you") ||
        text.includes("what are you")
    ) {

        return "I'm ik, the AI assistant being built into BuzzNet. I'm designed to help you learn, create, write, plan and explore ideas.";

    }


    if (
        text.includes("what can you do") ||
        text.includes("help me")
    ) {

        return "I can eventually help with writing, explanations, brainstorming, planning, coding, learning and many other tasks. We're building my full AI capabilities step by step.";

    }


    if (
        text.includes("buzznet")
    ) {

        return "BuzzNet is your social-media platform, and I'm being built as its integrated AI assistant. 🚀";

    }


    if (
        text.includes("thank")
    ) {

        return "You're welcome! 😊 I'm here whenever you need me.";

    }


    if (
        text.includes("good morning")
    ) {

        return "Good morning! ☀️ I'm ik. What would you like to accomplish today?";

    }


    if (
        text.includes("good night")
    ) {

        return "Good night! 🌙 Take care, and I'll be here whenever you return.";

    }


    return "I'm ik. I received your message, but my full AI brain isn't connected yet. We're building that connection next. 🤖";

}


/* =====================================================
   TYPING INDICATOR
   ===================================================== */

function showTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.add("show");
    typingIndicator.setAttribute("aria-hidden", "false");

    scrollToBottom();

}


function hideTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.remove("show");
    typingIndicator.setAttribute("aria-hidden", "true");

}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

function sendMessage(text = null) {

    if (!messageInput) return;


    const message =
        text !== null
            ? text.trim()
            : messageInput.value.trim();


    if (!message) return;


    if (welcomeScreen) {

        welcomeScreen.style.display = "none";

    }


    addMessage("user", message);


    messageInput.value = "";

    messageInput.style.height = "auto";


    showTyping();


    /*
     * Temporary response delay.
     *
     * This will later be replaced by the
     * secure AI backend connection.
     */

    const delay =
        Math.floor(Math.random() * 700) + 700;


    setTimeout(() => {

        hideTyping();


        const response =
            generateLocalResponse(message);


        addMessage(
            "assistant",
            response
        );


    }, delay);

}


/* =====================================================
   SEND BUTTON
   ===================================================== */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => sendMessage()
    );

}


/* =====================================================
   ENTER TO SEND
   ===================================================== */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    /* Auto-grow textarea */

    messageInput.addEventListener(
        "input",
        () => {

            messageInput.style.height = "auto";

            messageInput.style.height =
                Math.min(
                    messageInput.scrollHeight,
                    150
                ) + "px";

        }
    );

}


/* =====================================================
   SUGGESTED PROMPTS
   ===================================================== */

suggestions.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const prompt =
                button.dataset.prompt;

            if (!prompt) return;

            sendMessage(prompt);

        }
    );

});


/* =====================================================
   NEW CHAT
   ===================================================== */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Start a new conversation with ik?"
                );


            if (!confirmed) return;


            localStorage.removeItem(
                CHAT_STORAGE_KEY
            );


            if (messages) {

                messages.innerHTML = "";

            }


            if (welcomeScreen) {

                welcomeScreen.style.display = "";

            }


            hideTyping();


            if (messageInput) {

                messageInput.value = "";

                messageInput.style.height =
                    "auto";

                messageInput.focus();

            }

        }
    );

}


/* =====================================================
   INITIALIZE
   ===================================================== */

renderSavedConversation();

});