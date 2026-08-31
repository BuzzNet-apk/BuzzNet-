/*

* BuzzNet ik Core
* Conversation and AI data management layer.
* 
* NOTE:
* This file does NOT connect to OpenAI yet.
* The real AI provider will be added securely later.
  */

(function () {

"use strict";


const STORAGE_KEY =
    "buzznet_ik_data";


const MAX_MESSAGES =
    100;


/* =========================================
   STORAGE
   ========================================= */


function load() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return {

                conversations: []

            };

        }


        const data =
            JSON.parse(saved);


        if (
            !data ||
            !Array.isArray(
                data.conversations
            )
        ) {

            return {

                conversations: []

            };

        }


        return data;

    } catch (error) {

        return {

            conversations: []

        };

    }

}


function save(
    data
) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );


        return true;

    } catch (error) {

        return false;

    }

}


/* =========================================
   ID GENERATOR
   ========================================= */


function createId(
    prefix = "ik"
) {

    return (

        prefix +

        "_" +

        Date.now()
            .toString(36) +

        "_" +

        Math.random()
            .toString(36)
            .slice(2, 8)

    );

}


/* =========================================
   CONVERSATIONS
   ========================================= */


function getConversations() {

    return load()
        .conversations
        .slice()
        .sort(
            (a, b) =>

                new Date(
                    b.updatedAt
                ) -

                new Date(
                    a.updatedAt
                )
        );

}


function getConversation(
    conversationId
) {

    return getConversations()
        .find(
            conversation =>
                conversation.id ===
                conversationId
        ) || null;

}


/* =========================================
   CREATE CONVERSATION
   ========================================= */


function createConversation(
    title = "New conversation"
) {

    const data =
        load();


    const now =
        new Date()
            .toISOString();


    const conversation = {

        id:
            createId(
                "conversation"
            ),

        title:
            String(
                title ||
                "New conversation"
            ).trim(),

        createdAt:
            now,

        updatedAt:
            now,

        messages: []

    };


    data.conversations
        .push(
            conversation
        );


    save(data);


    return conversation;

}


/* =========================================
   DELETE CONVERSATION
   ========================================= */


function deleteConversation(
    conversationId
) {

    const data =
        load();


    const before =
        data.conversations.length;


    data.conversations =
        data.conversations.filter(
            conversation =>
                conversation.id !==
                conversationId
        );


    if (
        data.conversations.length ===
        before
    ) {

        return false;

    }


    save(data);


    return true;

}


/* =========================================
   RENAME CONVERSATION
   ========================================= */


function renameConversation(
    conversationId,
    title
) {

    const data =
        load();


    const conversation =
        data.conversations.find(
            item =>
                item.id ===
                conversationId
        );


    if (!conversation) {
        return null;
    }


    const value =
        String(
            title ||
            "New conversation"
        ).trim();


    conversation.title =
        value ||
        "New conversation";


    conversation.updatedAt =
        new Date()
            .toISOString();


    save(data);


    return conversation;

}


/* =========================================
   ADD MESSAGE
   ========================================= */


function addMessage(
    conversationId,
    role,
    content,
    metadata = {}
) {

    const data =
        load();


    const conversation =
        data.conversations.find(
            item =>
                item.id ===
                conversationId
        );


    if (!conversation) {
        return null;
    }


    const text =
        String(
            content || ""
        ).trim();


    if (!text) {
        return null;
    }


    const validRoles = [

        "user",

        "assistant",

        "system"

    ];


    const safeRole =
        validRoles.includes(role)
            ? role
            : "user";


    const message = {

        id:
            createId(
                "message"
            ),

        role:
            safeRole,

        content:
            text,

        createdAt:
            new Date()
                .toISOString(),

        metadata:
            metadata &&
            typeof metadata ===
            "object"
                ? metadata
                : {}

    };


    conversation.messages
        .push(
            message
        );


    /*
     * Keep conversations lightweight.
     */

    if (
        conversation.messages.length >
        MAX_MESSAGES
    ) {

        conversation.messages =
            conversation.messages.slice(
                -MAX_MESSAGES
            );

    }


    conversation.updatedAt =
        message.createdAt;


    /*
     * Automatically use the first
     * user message as the title.
     */

    if (
        conversation.title ===
        "New conversation" &&

        safeRole ===
        "user"
    ) {

        conversation.title =
            text.length > 40
                ? text.slice(0, 40) +
                  "..."
                : text;

    }


    save(data);


    return message;

}


/* =========================================
   GET MESSAGES
   ========================================= */


function getMessages(
    conversationId
) {

    const conversation =
        getConversation(
            conversationId
        );


    if (!conversation) {
        return [];
    }


    return conversation
        .messages
        .slice();

}


/* =========================================
   CLEAR MESSAGES
   ========================================= */


function clearConversation(
    conversationId
) {

    const data =
        load();


    const conversation =
        data.conversations.find(
            item =>
                item.id ===
                conversationId
        );


    if (!conversation) {
        return false;
    }


    conversation.messages = [];


    conversation.title =
        "New conversation";


    conversation.updatedAt =
        new Date()
            .toISOString();


    save(data);


    return true;

}


/* =========================================
   LAST MESSAGE
   ========================================= */


function lastMessage(
    conversationId
) {

    const messages =
        getMessages(
            conversationId
        );


    if (!messages.length) {
        return null;
    }


    return messages[
        messages.length - 1
    ];

}


/* =========================================
   MESSAGE COUNT
   ========================================= */


function messageCount(
    conversationId
) {

    return getMessages(
        conversationId
    ).length;

}


/* =========================================
   BUILD AI CONTEXT
   ========================================= */


function getContext(
    conversationId,
    limit = 20
) {

    const messages =
        getMessages(
            conversationId
        );


    return messages
        .slice(
            -Math.max(
                1,
                Number(limit) || 20
            )
        )
        .map(
            message => ({

                role:
                    message.role,

                content:
                    message.content

            })
        );

}


/* =========================================
   EXPORT CONVERSATION
   ========================================= */


function exportConversation(
    conversationId
) {

    const conversation =
        getConversation(
            conversationId
        );


    if (!conversation) {
        return null;
    }


    return JSON.stringify(
        conversation,
        null,
        2
    );

}


/* =========================================
   IMPORT CONVERSATION
   ========================================= */


function importConversation(
    dataToImport
) {

    let imported;


    try {

        imported =
            typeof dataToImport ===
            "string"

                ? JSON.parse(
                    dataToImport
                )

                : dataToImport;

    } catch (error) {

        return {

            success: false,

            message:
                "Invalid conversation data."

        };

    }


    if (
        !imported ||
        typeof imported !==
        "object"
    ) {

        return {

            success: false,

            message:
                "Invalid conversation data."

        };

    }


    const data =
        load();


    const conversation = {

        id:
            createId(
                "conversation"
            ),

        title:
            String(
                imported.title ||
                "Imported conversation"
            ).trim(),

        createdAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString(),

        messages:
            Array.isArray(
                imported.messages
            )
                ? imported.messages
                    .slice(
                        -MAX_MESSAGES
                    )
                : []

    };


    data.conversations
        .push(
            conversation
        );


    save(data);


    return {

        success: true,

        conversation

    };

}


/* =========================================
   CLEAR EVERYTHING
   ========================================= */


function clearAll() {

    save({

        conversations: []

    });


    return true;

}


/* =========================================
   GET SUMMARY
   ========================================= */


function summary() {

    const conversations =
        getConversations();


    let messages = 0;


    conversations.forEach(
        conversation => {

            messages +=
                conversation.messages
                    .length;

        }
    );


    return {

        conversations:
            conversations.length,

        messages

    };

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetIKCore = {

    createConversation,

    getConversations,

    getConversation,

    deleteConversation,

    renameConversation,

    addMessage,

    getMessages,

    clearConversation,

    lastMessage,

    messageCount,

    getContext,

    exportConversation,

    importConversation,

    clearAll,

    summary

};

})();