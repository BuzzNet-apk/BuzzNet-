/*

* BuzzNet Storage Layer
* Local development storage for the BuzzNet app.
* 
* This file is designed to keep temporary app data
* organized until a real backend/database is connected.
  */

(function () {

"use strict";


const STORAGE_PREFIX = "buzznet_";


const KEYS = {

    USER: "current_user",

    USERS: "users",

    POSTS: "posts",

    NOTIFICATIONS: "notifications",

    MESSAGES: "messages",

    SETTINGS: "settings",

    SESSION: "session"

};


function key(name) {

    return STORAGE_PREFIX + name;

}


function read(name, fallback) {

    try {

        const saved =
            localStorage.getItem(
                key(name)
            );


        if (saved === null) {
            return fallback;
        }


        return JSON.parse(saved);

    } catch (error) {

        console.warn(
            "BuzzNet storage read error:",
            error
        );

        return fallback;

    }

}


function write(name, value) {

    try {

        localStorage.setItem(
            key(name),
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.warn(
            "BuzzNet storage write error:",
            error
        );

        return false;

    }

}


function remove(name) {

    try {

        localStorage.removeItem(
            key(name)
        );

        return true;

    } catch (error) {

        console.warn(
            "BuzzNet storage remove error:",
            error
        );

        return false;

    }

}


function createId(prefix) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================
   USER
   ========================================= */


function getCurrentUser() {

    return read(
        KEYS.USER,
        null
    );

}


function setCurrentUser(user) {

    if (!user) {

        remove(KEYS.USER);

        return null;

    }


    write(
        KEYS.USER,
        user
    );


    return user;

}


function clearCurrentUser() {

    remove(KEYS.USER);

    remove(KEYS.SESSION);

}


function getUsers() {

    return read(
        KEYS.USERS,
        []
    );

}


function saveUsers(users) {

    return write(
        KEYS.USERS,
        Array.isArray(users)
            ? users
            : []
    );

}


function addUser(user) {

    const users =
        getUsers();


    const newUser = {

        id:
            user.id ||
            createId("user"),

        name:
            user.name ||
            "BuzzNet User",

        username:
            user.username ||
            "user",

        email:
            user.email ||
            "",

        avatar:
            user.avatar ||
            "images/default-avatar.svg",

        cover:
            user.cover ||
            "images/default-cover.svg",

        bio:
            user.bio ||
            "",

        createdAt:
            user.createdAt ||
            new Date().toISOString()

    };


    users.push(newUser);

    saveUsers(users);


    return newUser;

}


/* =========================================
   SESSION
   ========================================= */


function createSession(userId) {

    const session = {

        userId:
            userId,

        createdAt:
            new Date().toISOString(),

        active:
            true

    };


    write(
        KEYS.SESSION,
        session
    );


    return session;

}


function getSession() {

    return read(
        KEYS.SESSION,
        null
    );

}


function logout() {

    clearCurrentUser();

}


/* =========================================
   POSTS
   ========================================= */


function getPosts() {

    return read(
        KEYS.POSTS,
        []
    );

}


function savePosts(posts) {

    return write(
        KEYS.POSTS,
        Array.isArray(posts)
            ? posts
            : []
    );

}


function addPost(post) {

    const posts =
        getPosts();


    const currentUser =
        getCurrentUser();


    const newPost = {

        id:
            post.id ||
            createId("post"),

        userId:
            post.userId ||
            (currentUser
                ? currentUser.id
                : "guest"),

        author:
            post.author ||
            (currentUser
                ? currentUser.name
                : "BuzzNet User"),

        username:
            post.username ||
            (currentUser
                ? currentUser.username
                : "user"),

        avatar:
            post.avatar ||
            (currentUser
                ? currentUser.avatar
                : "images/default-avatar.svg"),

        content:
            post.content ||
            "",

        image:
            post.image ||
            "",

        likes:
            Number(post.likes) || 0,

        comments:
            Array.isArray(post.comments)
                ? post.comments
                : [],

        createdAt:
            post.createdAt ||
            new Date().toISOString()

    };


    posts.unshift(newPost);

    savePosts(posts);


    return newPost;

}


function updatePost(
    postId,
    updates
) {

    const posts =
        getPosts();


    const index =
        posts.findIndex(
            post =>
                post.id === postId
        );


    if (index === -1) {
        return null;
    }


    posts[index] = {

        ...posts[index],

        ...updates

    };


    savePosts(posts);


    return posts[index];

}


function deletePost(postId) {

    const posts =
        getPosts();


    const updated =
        posts.filter(
            post =>
                post.id !== postId
        );


    savePosts(updated);


    return true;

}


function likePost(postId) {

    const posts =
        getPosts();


    const post =
        posts.find(
            item =>
                item.id === postId
        );


    if (!post) {
        return null;
    }


    post.likes =
        Number(post.likes || 0) + 1;


    savePosts(posts);


    return post;

}


function addComment(
    postId,
    comment
) {

    const posts =
        getPosts();


    const post =
        posts.find(
            item =>
                item.id === postId
        );


    if (!post) {
        return null;
    }


    if (!Array.isArray(post.comments)) {
        post.comments = [];
    }


    const currentUser =
        getCurrentUser();


    const newComment = {

        id:
            createId("comment"),

        userId:
            currentUser
                ? currentUser.id
                : "guest",

        author:
            currentUser
                ? currentUser.name
                : "BuzzNet User",

        avatar:
            currentUser
                ? currentUser.avatar
                : "images/default-avatar.svg",

        content:
            String(comment || "").trim(),

        createdAt:
            new Date().toISOString()

    };


    if (!newComment.content) {
        return null;
    }


    post.comments.push(
        newComment
    );


    savePosts(posts);


    return newComment;

}


/* =========================================
   NOTIFICATIONS
   ========================================= */


function getNotifications() {

    return read(
        KEYS.NOTIFICATIONS,
        []
    );

}


function saveNotifications(
    notifications
) {

    return write(
        KEYS.NOTIFICATIONS,
        Array.isArray(notifications)
            ? notifications
            : []
    );

}


function addNotification(
    notification
) {

    const notifications =
        getNotifications();


    const item = {

        id:
            notification.id ||
            createId("notification"),

        type:
            notification.type ||
            "general",

        title:
            notification.title ||
            "New notification",

        message:
            notification.message ||
            "",

        read:
            Boolean(notification.read),

        createdAt:
            notification.createdAt ||
            new Date().toISOString()

    };


    notifications.unshift(item);

    saveNotifications(
        notifications
    );


    return item;

}


function markNotificationRead(
    notificationId
) {

    const notifications =
        getNotifications();


    const item =
        notifications.find(
            notification =>
                notification.id ===
                notificationId
        );


    if (!item) {
        return null;
    }


    item.read = true;


    saveNotifications(
        notifications
    );


    return item;

}


function markAllNotificationsRead() {

    const notifications =
        getNotifications();


    notifications.forEach(
        notification => {
            notification.read = true;
        }
    );


    saveNotifications(
        notifications
    );


    return notifications;

}


/* =========================================
   MESSAGES
   ========================================= */


function getMessages() {

    return read(
        KEYS.MESSAGES,
        []
    );

}


function saveMessages(messages) {

    return write(
        KEYS.MESSAGES,
        Array.isArray(messages)
            ? messages
            : []
    );

}


function addMessage(message) {

    const messages =
        getMessages();


    const currentUser =
        getCurrentUser();


    const newMessage = {

        id:
            message.id ||
            createId("message"),

        senderId:
            message.senderId ||
            (currentUser
                ? currentUser.id
                : "guest"),

        receiverId:
            message.receiverId ||
            "",

        content:
            String(
                message.content || ""
            ).trim(),

        read:
            Boolean(message.read),

        createdAt:
            message.createdAt ||
            new Date().toISOString()

    };


    if (!newMessage.content) {
        return null;
    }


    messages.push(
        newMessage
    );


    saveMessages(messages);


    return newMessage;

}


function getConversation(
    userId
) {

    const currentUser =
        getCurrentUser();


    if (!currentUser) {
        return [];
    }


    return getMessages().filter(
        message =>

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
            )

    );

}


/* =========================================
   SETTINGS
   ========================================= */


function getSettings() {

    return read(
        KEYS.SETTINGS,
        {

            theme:
                "dark",

            notifications:
                true,

            sounds:
                true,

            language:
                "en"

        }
    );

}


function saveSettings(
    settings
) {

    return write(
        KEYS.SETTINGS,
        settings
    );

}


function updateSettings(
    updates
) {

    const current =
        getSettings();


    const updated = {

        ...current,

        ...updates

    };


    saveSettings(
        updated
    );


    return updated;

}


/* =========================================
   DATABASE RESET
   ========================================= */


function clearBuzzNetStorage() {

    Object.keys(KEYS).forEach(
        name => {

            remove(
                KEYS[name]
            );

        }
    );

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetStorage = {

    getCurrentUser,

    setCurrentUser,

    clearCurrentUser,

    getUsers,

    saveUsers,

    addUser,

    createSession,

    getSession,

    logout,

    getPosts,

    savePosts,

    addPost,

    updatePost,

    deletePost,

    likePost,

    addComment,

    getNotifications,

    saveNotifications,

    addNotification,

    markNotificationRead,

    markAllNotificationsRead,

    getMessages,

    saveMessages,

    addMessage,

    getConversation,

    getSettings,

    saveSettings,

    updateSettings,

    clearBuzzNetStorage

};

})();