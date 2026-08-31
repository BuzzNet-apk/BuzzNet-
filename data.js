/*

BUZZNET DATA LAYER

This file is the central place for BuzzNet's local data.

For now:

- Stores demo user information
- Stores the current session
- Stores posts
- Stores notifications
- Stores conversations
- Stores settings

Later:

- This can be connected to a real database/backend.
- IK can also use the same user/session system.

Do not put passwords or secret API keys in this file.

*/

const BuzzNetData = {

/* =====================================================
   STORAGE KEYS
   ===================================================== */

keys: {

    users: "buzznet_users",

    currentUser: "buzznet_current_user",

    posts: "buzznet_posts",

    notifications: "buzznet_notifications",

    messages: "buzznet_messages",

    settings: "buzznet_settings"

},


/* =====================================================
   BASIC STORAGE
   ===================================================== */

get(key) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : null;

    } catch (error) {

        console.error(
            "BuzzNet data error:",
            error
        );

        return null;

    }

},


set(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "BuzzNet storage error:",
            error
        );

        return false;

    }

},


remove(key) {

    localStorage.removeItem(key);

},


/* =====================================================
   USER DATA
   ===================================================== */

getUsers() {

    return this.get(
        this.keys.users
    ) || [];

},


saveUsers(users) {

    return this.set(
        this.keys.users,
        users
    );

},


findUser(identifier) {

    const users =
        this.getUsers();

    const search =
        String(identifier)
            .trim()
            .toLowerCase();


    return users.find(user =>

        String(user.email)
            .toLowerCase() === search

        ||

        String(user.username)
            .toLowerCase() === search

    ) || null;

},


/* =====================================================
   CURRENT USER / SESSION
   ===================================================== */

getCurrentUser() {

    return this.get(
        this.keys.currentUser
    );

},


setCurrentUser(user) {

    return this.set(
        this.keys.currentUser,
        user
    );

},


logout() {

    this.remove(
        this.keys.currentUser
    );

},


isLoggedIn() {

    return !!this.getCurrentUser();

},


/* =====================================================
   CREATE USER
   ===================================================== */

createUser(userData) {

    const users =
        this.getUsers();


    const existing =
        users.find(user =>

            user.email.toLowerCase() ===
            userData.email.toLowerCase()

            ||

            user.username.toLowerCase() ===
            userData.username.toLowerCase()

        );


    if (existing) {

        return {

            success: false,

            message:
                "An account with that email or username already exists."

        };

    }


    const user = {

        id:
            "user_" +
            Date.now(),

        fullName:
            userData.fullName,

        username:
            userData.username,

        email:
            userData.email,

        bio:
            "",

        avatar:
            "",

        followers:
            0,

        following:
            0,

        verified:
            false,

        createdAt:
            new Date().toISOString()

    };


    users.push(user);


    this.saveUsers(users);


    return {

        success: true,

        user: user

    };

},


/* =====================================================
   POSTS
   ===================================================== */

getPosts() {

    return this.get(
        this.keys.posts
    ) || [];

},


savePosts(posts) {

    return this.set(
        this.keys.posts,
        posts
    );

},


addPost(post) {

    const posts =
        this.getPosts();


    const newPost = {

        id:
            "post_" +
            Date.now(),

        author:
            post.author || "BuzzNet User",

        username:
            post.username || "@user",

        content:
            post.content || "",

        image:
            post.image || "",

        likes:
            0,

        comments:
            0,

        shares:
            0,

        createdAt:
            new Date().toISOString()

    };


    posts.unshift(
        newPost
    );


    this.savePosts(posts);


    return newPost;

},


/* =====================================================
   NOTIFICATIONS
   ===================================================== */

getNotifications() {

    return this.get(
        this.keys.notifications
    ) || [];

},


saveNotifications(
    notifications
) {

    return this.set(
        this.keys.notifications,
        notifications
    );

},


addNotification(
    notification
) {

    const notifications =
        this.getNotifications();


    notifications.unshift({

        id:
            "notification_" +
            Date.now(),

        type:
            notification.type ||
            "general",

        title:
            notification.title ||
            "BuzzNet",

        message:
            notification.message ||
            "",

        read:
            false,

        createdAt:
            new Date().toISOString()

    });


    this.saveNotifications(
        notifications
    );

},


/* =====================================================
   MESSAGES
   ===================================================== */

getMessages() {

    return this.get(
        this.keys.messages
    ) || [];

},


saveMessages(messages) {

    return this.set(
        this.keys.messages,
        messages
    );

},


addMessage(
    conversationId,
    sender,
    text
) {

    const messages =
        this.getMessages();


    messages.push({

        id:
            "message_" +
            Date.now(),

        conversationId:
            conversationId,

        sender:
            sender,

        text:
            text,

        createdAt:
            new Date().toISOString()

    });


    this.saveMessages(
        messages
    );

},


/* =====================================================
   SETTINGS
   ===================================================== */

getSettings() {

    return this.get(
        this.keys.settings
    ) || {

        darkMode: true,

        notifications: true,

        privateAccount: false,

        language: "English"

    };

},


saveSettings(settings) {

    return this.set(
        this.keys.settings,
        settings
    );

},


updateSetting(
    name,
    value
) {

    const settings =
        this.getSettings();


    settings[name] =
        value;


    this.saveSettings(
        settings
    );


    return settings;

},


/* =====================================================
   INITIAL DEMO DATA
   ===================================================== */

initialize() {

    if (
        !localStorage.getItem(
            this.keys.posts
        )
    ) {

        this.savePosts([

            {

                id: "post_demo_1",

                author:
                    "BuzzNet",

                username:
                    "@buzznet",

                content:
                    "Welcome to BuzzNet. Connect, discover and create.",

                image: "",

                likes: 0,

                comments: 0,

                shares: 0,

                createdAt:
                    new Date().toISOString()

            }

        ]);

    }


    if (
        !localStorage.getItem(
            this.keys.notifications
        )
    ) {

        this.saveNotifications([]);

    }


    if (
        !localStorage.getItem(
            this.keys.messages
        )
    ) {

        this.saveMessages([]);

    }


    if (
        !localStorage.getItem(
            this.keys.settings
        )
    ) {

        this.saveSettings(
            this.getSettings()
        );

    }

}

};

/* =========================================================
START BUZZNET DATA SYSTEM
========================================================= */

BuzzNetData.initialize();

console.log(
"BuzzNet data system initialized."
);