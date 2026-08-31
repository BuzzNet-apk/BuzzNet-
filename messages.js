/*

* BuzzNet Messages
* Local messaging management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   GET ALL MESSAGES
   ========================================= */


function getAll() {

    if (!storage) {
        return [];
    }


    return storage.getMessages();

}


/* =========================================
   SEND MESSAGE
   ========================================= */


function send(
    receiverId,
    content
) {

    if (!storage) {

        return {

            success: false,

            message:
                "BuzzNet storage is unavailable."

        };

    }


    const currentUser =
        storage.getCurrentUser();


    if (!currentUser) {

        return {

            success: false,

            message:
                "Please log in first."

        };

    }


    if (!receiverId) {

        return {

            success: false,

            message:
                "A recipient is required."

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
                "Message cannot be empty."

        };

    }


    const message =
        storage.addMessage({

            senderId:
                currentUser.id,

            receiverId,

            content:
                text,

            read:
                false

        });


    if (!message) {

        return {

            success: false,

            message:
                "Message could not be sent."

        };

    }


    return {

        success: true,

        message

    };

}


/* =========================================
   GET CONVERSATION
   ========================================= */


function conversation(
    userId
) {

    if (!storage) {
        return [];
    }


    return storage.getConversation(
        userId
    );

}


/* =========================================
   GET USER MESSAGES
   ========================================= */


function received() {

    const currentUser =
        storage
            ? storage.getCurrentUser()
            : null;


    if (!currentUser) {
        return [];
    }


    return getAll().filter(
        message =>
            message.receiverId ===
            currentUser.id
    );

}


function sent() {

    const currentUser =
        storage
            ? storage.getCurrentUser()
            : null;


    if (!currentUser) {
        return [];
    }


    return getAll().filter(
        message =>
            message.senderId ===
            currentUser.id
    );

}


/* =========================================
   UNREAD MESSAGES
   ========================================= */


function unread() {

    return received().filter(
        message =>
            !message.read
    );

}


function unreadCount() {

    return unread().length;

}


/* =========================================
   MARK MESSAGE READ
   ========================================= */


function markRead(
    messageId
) {

    if (!storage) {
        return null;
    }


    const messages =
        storage.getMessages();


    const message =
        messages.find(
            item =>
                item.id ===
                messageId
        );


    if (!message) {
        return null;
    }


    message.read = true;


    storage.saveMessages(
        messages
    );


    return message;

}


/* =========================================
   MARK CONVERSATION READ
   ========================================= */


function markConversationRead(
    userId
) {

    if (!storage) {
        return [];

    }


    const currentUser =
        storage.getCurrentUser();


    if (!currentUser) {
        return [];

    }


    const messages =
        storage.getMessages();


    messages.forEach(
        message => {

            if (

                message.senderId ===
                userId &&

                message.receiverId ===
                currentUser.id

            ) {

                message.read = true;

            }

        }
    );


    storage.saveMessages(
        messages
    );


    return messages;

}


/* =========================================
   DELETE MESSAGE
   ========================================= */


function remove(
    messageId
) {

    if (!storage) {
        return false;
    }


    const messages =
        storage.getMessages();


    const filtered =
        messages.filter(
            message =>
                message.id !==
                messageId
        );


    storage.saveMessages(
        filtered
    );


    return true;

}


/* =========================================
   DELETE CONVERSATION
   ========================================= */


function removeConversation(
    userId
) {

    if (!storage) {
        return false;
    }


    const currentUser =
        storage.getCurrentUser();


    if (!currentUser) {
        return false;
    }


    const messages =
        storage.getMessages();


    const filtered =
        messages.filter(
            message => {

                const isConversation =

                    (
                        message.senderId ===
                        currentUser.id &&

                        message.receiverId ===
                        userId
                    )

                    ||

                    (
                        message.senderId ===
                        userId &&

                        message.receiverId ===
                        currentUser.id
                    );


                return !isConversation;

            }
        );


    storage.saveMessages(
        filtered
    );


    return true;

}


/* =========================================
   CONVERSATION LIST
   ========================================= */


function conversations() {

    if (!storage) {
        return [];
    }


    const currentUser =
        storage.getCurrentUser();


    if (!currentUser) {
        return [];
    }


    const messages =
        getAll();


    const map = {};


    messages.forEach(
        message => {

            let otherUserId = null;


            if (
                message.senderId ===
                currentUser.id
            ) {

                otherUserId =
                    message.receiverId;

            } else if (
                message.receiverId ===
                currentUser.id
            ) {

                otherUserId =
                    message.senderId;

            }


            if (!otherUserId) {
                return;
            }


            const existing =
                map[otherUserId];


            if (
                !existing ||
                new Date(
                    message.createdAt
                ) >
                new Date(
                    existing.lastMessage
                        .createdAt
                )
            ) {

                map[otherUserId] = {

                    userId:
                        otherUserId,

                    lastMessage:
                        message,

                    unread:
                        0

                };

            }

        }
    );


    Object.values(map)
        .forEach(
            conversation => {

                conversation.unread =
                    messages.filter(
                        message =>

                            message.senderId ===
                            conversation.userId &&

                            message.receiverId ===
                            currentUser.id &&

                            !message.read

                    ).length;

            }
        );


    return Object.values(map)
        .sort(
            (a, b) =>

                new Date(
                    b.lastMessage.createdAt
                ) -

                new Date(
                    a.lastMessage.createdAt
                )
        );

}


/* =========================================
   SEARCH MESSAGES
   ========================================= */


function search(
    query
) {

    const text =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!text) {
        return [];
    }


    return getAll().filter(
        message =>

            String(
                message.content || ""
            )
                .toLowerCase()
                .includes(text)

    );

}


/* =========================================
   TIME FORMAT
   ========================================= */


function timeAgo(
    date
) {

    const timestamp =
        new Date(date).getTime();


    if (
        Number.isNaN(timestamp)
    ) {

        return "";

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                timestamp
            ) / 1000
        );


    if (seconds < 10) {
        return "Just now";
    }


    if (seconds < 60) {
        return `${seconds}s`;
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {
        return `${minutes}m`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {
        return `${hours}h`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {
        return `${days}d`;
    }


    return new Date(date)
        .toLocaleDateString();

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetMessages = {

    getAll,

    send,

    conversation,

    received,

    sent,

    unread,

    unreadCount,

    markRead,

    markConversationRead,

    remove,

    removeConversation,

    conversations,

    search,

    timeAgo

};

})();