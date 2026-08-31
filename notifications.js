/*

* BuzzNet Notifications
* Local notification management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   GET NOTIFICATIONS
   ========================================= */


function getAll() {

    if (!storage) {
        return [];
    }


    return storage.getNotifications();

}


/* =========================================
   GET UNREAD
   ========================================= */


function getUnread() {

    return getAll().filter(
        notification =>
            !notification.read
    );

}


/* =========================================
   UNREAD COUNT
   ========================================= */


function getUnreadCount() {

    return getUnread().length;

}


/* =========================================
   ADD NOTIFICATION
   ========================================= */


function add(
    type,
    title,
    message,
    extra = {}
) {

    if (!storage) {
        return null;
    }


    return storage.addNotification({

        type:
            type || "general",

        title:
            title || "New notification",

        message:
            message || "",

        ...extra

    });

}


/* =========================================
   LIKE
   ========================================= */


function like(
    username,
    postId = ""
) {

    return add(

        "like",

        "New like",

        `${username || "Someone"} liked your post.`,

        {
            postId
        }

    );

}


/* =========================================
   COMMENT
   ========================================= */


function comment(
    username,
    postId = "",
    preview = ""
) {

    const message =
        preview
            ? `${username || "Someone"} commented: "${preview}"`
            : `${username || "Someone"} commented on your post.`;


    return add(

        "comment",

        "New comment",

        message,

        {
            postId
        }

    );

}


/* =========================================
   FOLLOW
   ========================================= */


function follow(
    username,
    userId = ""
) {

    return add(

        "follow",

        "New follower",

        `${username || "Someone"} started following you.`,

        {
            userId
        }

    );

}


/* =========================================
   MESSAGE
   ========================================= */


function message(
    username,
    userId = ""
) {

    return add(

        "message",

        "New message",

        `You received a new message from ${username || "someone"}.`,

        {
            userId
        }

    );

}


/* =========================================
   IK
   ========================================= */


function ik(
    messageText = ""
) {

    return add(

        "ik",

        "ik is ready",

        messageText ||
            "Your BuzzNet AI assistant is ready to help.",

        {}

    );

}


/* =========================================
   GENERAL
   ========================================= */


function general(
    title,
    message
) {

    return add(

        "general",

        title,

        message

    );

}


/* =========================================
   MARK AS READ
   ========================================= */


function markRead(
    notificationId
) {

    if (!storage) {
        return null;
    }


    return storage.markNotificationRead(
        notificationId
    );

}


/* =========================================
   MARK ALL READ
   ========================================= */


function markAllRead() {

    if (!storage) {
        return [];
    }


    return storage.markAllNotificationsRead();

}


/* =========================================
   DELETE
   ========================================= */


function remove(
    notificationId
) {

    if (!storage) {
        return false;
    }


    const notifications =
        storage.getNotifications();


    const filtered =
        notifications.filter(
            notification =>
                notification.id !==
                notificationId
        );


    storage.saveNotifications(
        filtered
    );


    return true;

}


/* =========================================
   CLEAR ALL
   ========================================= */


function clearAll() {

    if (!storage) {
        return false;
    }


    storage.saveNotifications(
        []
    );


    return true;

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


    const weeks =
        Math.floor(
            days / 7
        );


    if (weeks < 5) {
        return `${weeks}w`;
    }


    return new Date(date)
        .toLocaleDateString();

}


/* =========================================
   GROUP BY TYPE
   ========================================= */


function groupByType() {

    const notifications =
        getAll();


    return notifications.reduce(
        (groups, notification) => {

            const type =
                notification.type ||
                "general";


            if (!groups[type]) {
                groups[type] = [];
            }


            groups[type].push(
                notification
            );


            return groups;

        },
        {}
    );

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetNotifications = {

    getAll,

    getUnread,

    getUnreadCount,

    add,

    like,

    comment,

    follow,

    message,

    ik,

    general,

    markRead,

    markAllRead,

    remove,

    clearAll,

    timeAgo,

    groupByType

};

})();