/*

* BuzzNet ik Engine
* Local AI conversation engine.
* 
* This version does NOT contain an OpenAI API key.
* A secure backend can replace generateResponse()
* later without exposing secret keys in the browser.
  */

(function () {

"use strict";


const core =
    window.BuzzNetIKCore || null;


/* =========================================
   CONFIGURATION
   ========================================= */


const CONFIG = {

    name: "ik",

    fallbackMessage:
        "I'm ik, BuzzNet's AI assistant. I'm still learning how to answer that.",

    welcomeMessage:
        "Hi, I'm ik. How can I help you today?"

};


/* =========================================
   HELPERS
   ========================================= */


function normalize(
    text
) {

    return String(
        text || ""
    )
        .trim()
        .toLowerCase();

}


function containsAny(
    text,
    words
) {

    return words.some(
        word =>
            text.includes(word)
    );

}


/* =========================================
   LOCAL RESPONSE GENERATOR
   ========================================= */


function generateResponse(
    message,
    context = []
) {

    const text =
        normalize(message);


    if (!text) {

        return "Please type a message and I'll do my best to help.";

    }


    if (
        containsAny(
            text,
            [
                "hello",
                "hi",
                "hey",
                "good morning",
                "good afternoon",
                "good evening"
            ]
        )
    ) {

        return "Hello! I'm ik, your BuzzNet AI assistant. What would you like to talk about?";

    }


    if (
        containsAny(
            text,
            [
                "who are you",
                "what are you",
                "your name"
            ]
        )
    ) {

        return "I'm ik, the AI assistant being built for BuzzNet. I can help with questions, ideas, writing, and more.";

    }


    if (
        containsAny(
            text,
            [
                "buzznet",
                "about buzznet"
            ]
        )
    ) {

        return "BuzzNet is your social platform project, designed as a modern social network with features such as posts, messages, notifications, profiles, discovery, and ik AI.";

    }


    if (
        containsAny(
            text,
            [
                "help",
                "what can you do",
                "your abilities"
            ]
        )
    ) {

        return "I can currently guide you through BuzzNet and respond to basic questions. Later, I can be connected to a real AI backend for much more powerful conversations.";

    }


    if (
        containsAny(
            text,
            [
                "thank",
                "thanks"
            ]
        )
    ) {

        return "You're welcome! I'm always here to help.";

    }


    if (
        text.includes("time")
    ) {

        return "The current time on your device is " +
            new Date()
                .toLocaleTimeString() +
            ".";

    }


    if (
        text.includes("date") ||
        text.includes("today")
    ) {

        return "Today's date on your device is " +
            new Date()
                .toLocaleDateString() +
            ".";

    }


    /*
     * Context-aware fallback.
     */

    if (
        Array.isArray(context) &&
        context.length > 2
    ) {

        return "I understand we're continuing our conversation. A full AI backend will allow ik to understand your request in much greater detail.";

    }


    return CONFIG.fallbackMessage;

}


/* =========================================
   CREATE NEW CHAT
   ========================================= */


function newConversation(
    title = "New conversation"
) {

    if (!core) {
        return null;
    }


    return core.createConversation(
        title
    );

}


/* =========================================
   SEND MESSAGE
   ========================================= */


function send(
    conversationId,
    content
) {

    if (!core) {

        return {

            success: false,

            message:
                "ik conversation storage is unavailable."

        };

    }


    let conversation =
        core.getConversation(
            conversationId
        );


    /*
     * Automatically create a conversation
     * if one was not provided.
     */

    if (!conversation) {

        conversation =
            newConversation();

    }


    if (!conversation) {

        return {

            success: false,

            message:
                "Unable to create a conversation."

        };

    }


    const text =
        String(
            content || ""
        ).trim();


    if (!text) {

        return {

            success: false,

            message:
                "Please enter a message."

        };

    }


    const userMessage =
        core.addMessage(

            conversation.id,

            "user",

            text

        );


    if (!userMessage) {

        return {

            success: false,

            message:
                "Your message could not be saved."

        };

    }


    const context =
        core.getContext(
            conversation.id,
            20
        );


    const reply =
        generateResponse(
            text,
            context
        );


    const assistantMessage =
        core.addMessage(

            conversation.id,

            "assistant",

            reply

        );


    return {

        success: true,

        conversationId:
            conversation.id,

        userMessage,

        assistantMessage,

        reply

    };

}


/* =========================================
   WELCOME MESSAGE
   ========================================= */


function welcome(
    conversationId
) {

    if (!core) {
        return null;
    }


    const conversation =
        core.getConversation(
            conversationId
        );


    if (!conversation) {
        return null;
    }


    if (
        conversation.messages &&
        conversation.messages.length
    ) {

        return null;

    }


    return core.addMessage(

        conversationId,

        "assistant",

        CONFIG.welcomeMessage

    );

}


/* =========================================
   GET CONVERSATION
   ========================================= */


function getConversation(
    conversationId
) {

    if (!core) {
        return null;
    }


    return core.getConversation(
        conversationId
    );

}


/* =========================================
   GET MESSAGES
   ========================================= */


function getMessages(
    conversationId
) {

    if (!core) {
        return [];
    }


    return core.getMessages(
        conversationId
    );

}


/* =========================================
   CLEAR CHAT
   ========================================= */


function clear(
    conversationId
) {

    if (!core) {
        return false;
    }


    return core.clearConversation(
        conversationId
    );

}


/* =========================================
   DELETE CHAT
   ========================================= */


function remove(
    conversationId
) {

    if (!core) {
        return false;
    }


    return core.deleteConversation(
        conversationId
    );

}


/* =========================================
   CHAT HISTORY
   ========================================= */


function history() {

    if (!core) {
        return [];
    }


    return core.getConversations();

}


/* =========================================
   ENGINE STATUS
   ========================================= */


function status() {

    return {

        name:
            CONFIG.name,

        provider:
            "local",

        connected:
            false,

        conversations:
            core
                ? core.summary()
                : {

                    conversations: 0,

                    messages: 0

                }

    };

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetIK = {

    CONFIG,

    generateResponse,

    newConversation,

    send,

    welcome,

    getConversation,

    getMessages,

    clear,

    remove,

    history,

    status

};

})();