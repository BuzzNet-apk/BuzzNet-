/*

* BuzzNet Authentication
* Local development authentication layer.
* 
* IMPORTANT:
* This is NOT production authentication.
* Real authentication should be handled by a secure backend.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   VALIDATION
   ========================================= */


function validateEmail(email) {

    const value =
        String(email || "")
            .trim()
            .toLowerCase();


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(value);

}


function validatePassword(password) {

    return (
        typeof password === "string" &&
        password.length >= 6
    );

}


function cleanUsername(username) {

    return String(
        username || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9_]/g,
            ""
        );

}


/* =========================================
   SIGN UP
   ========================================= */


function signup(details) {

    if (!storage) {

        return {

            success: false,

            message:
                "BuzzNet storage is unavailable."

        };

    }


    const name =
        String(
            details?.name || ""
        ).trim();


    const email =
        String(
            details?.email || ""
        )
            .trim()
            .toLowerCase();


    const username =
        cleanUsername(
            details?.username
        );


    const password =
        String(
            details?.password || ""
        );


    if (name.length < 2) {

        return {

            success: false,

            message:
                "Please enter your name."

        };

    }


    if (!validateEmail(email)) {

        return {

            success: false,

            message:
                "Please enter a valid email address."

        };

    }


    if (username.length < 3) {

        return {

            success: false,

            message:
                "Username must contain at least 3 characters."

        };

    }


    if (!validatePassword(password)) {

        return {

            success: false,

            message:
                "Password must contain at least 6 characters."

        };

    }


    const users =
        storage.getUsers();


    const emailExists =
        users.some(
            user =>
                String(user.email)
                    .toLowerCase() ===
                email
        );


    if (emailExists) {

        return {

            success: false,

            message:
                "An account with this email already exists."

        };

    }


    const usernameExists =
        users.some(
            user =>
                String(user.username)
                    .toLowerCase() ===
                username
        );


    if (usernameExists) {

        return {

            success: false,

            message:
                "That username is already taken."

        };

    }


    /*
     * For this local prototype only.
     *
     * Never store real passwords like this
     * in a production application.
     */

    const user =
        storage.addUser({

            name,

            username,

            email,

            password,

            avatar:
                "images/default-avatar.svg",

            cover:
                "images/default-cover.svg",

            bio: ""

        });


    storage.setCurrentUser(
        user
    );


    storage.createSession(
        user.id
    );


    return {

        success: true,

        user,

        message:
            "Your BuzzNet account has been created."

    };

}


/* =========================================
   LOGIN
   ========================================= */


function login(
    identifier,
    password
) {

    if (!storage) {

        return {

            success: false,

            message:
                "BuzzNet storage is unavailable."

        };

    }


    const value =
        String(
            identifier || ""
        )
            .trim()
            .toLowerCase();


    const pass =
        String(
            password || ""
        );


    if (!value || !pass) {

        return {

            success: false,

            message:
                "Please enter your login details."

        };

    }


    const users =
        storage.getUsers();


    const user =
        users.find(
            item =>

                String(
                    item.email || ""
                )
                    .toLowerCase() ===
                    value

                ||

                String(
                    item.username || ""
                )
                    .toLowerCase() ===
                    value

        );


    if (!user) {

        return {

            success: false,

            message:
                "Account not found."

        };

    }


    /*
     * Local prototype password check.
     *
     * Production authentication must use
     * secure server-side password hashing.
     */

    if (
        user.password !==
        pass
    ) {

        return {

            success: false,

            message:
                "Incorrect password."

        };

    }


    storage.setCurrentUser(
        user
    );


    storage.createSession(
        user.id
    );


    return {

        success: true,

        user,

        message:
            "Welcome back to BuzzNet."

    };

}


/* =========================================
   LOGOUT
   ========================================= */


function logout() {

    if (!storage) {
        return false;
    }


    storage.logout();


    return true;

}


/* =========================================
   CURRENT USER
   ========================================= */


function currentUser() {

    if (!storage) {
        return null;
    }


    return storage.getCurrentUser();

}


/* =========================================
   AUTH STATUS
   ========================================= */


function isLoggedIn() {

    return Boolean(
        currentUser()
    );

}


/* =========================================
   REQUIRE LOGIN
   ========================================= */


function requireLogin(
    redirect = "login.html"
) {

    if (isLoggedIn()) {
        return true;
    }


    window.location.href =
        redirect;


    return false;

}


/* =========================================
   USERNAME AVAILABILITY
   ========================================= */


function isUsernameAvailable(
    username
) {

    if (!storage) {
        return false;
    }


    const clean =
        cleanUsername(
            username
        );


    if (!clean) {
        return false;
    }


    const users =
        storage.getUsers();


    return !users.some(
        user =>
            String(
                user.username || ""
            )
                .toLowerCase() ===
                clean
    );

}


/* =========================================
   EMAIL AVAILABILITY
   ========================================= */


function isEmailAvailable(
    email
) {

    if (!storage) {
        return false;
    }


    const value =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();


    if (!validateEmail(value)) {
        return false;
    }


    const users =
        storage.getUsers();


    return !users.some(
        user =>
            String(
                user.email || ""
            )
                .toLowerCase() ===
                value
    );

}


/* =========================================
   UPDATE PROFILE
   ========================================= */


function updateProfile(
    updates
) {

    if (!storage) {
        return null;
    }


    const user =
        currentUser();


    if (!user) {
        return null;
    }


    const users =
        storage.getUsers();


    const index =
        users.findIndex(
            item =>
                item.id === user.id
        );


    if (index === -1) {
        return null;
    }


    const allowed = {

        name:
            updates?.name,

        username:
            updates?.username,

        bio:
            updates?.bio,

        avatar:
            updates?.avatar,

        cover:
            updates?.cover

    };


    Object.keys(allowed).forEach(
        property => {

            if (
                allowed[property] !==
                undefined
            ) {

                users[index][property] =
                    allowed[property];

            }

        }
    );


    storage.saveUsers(
        users
    );


    storage.setCurrentUser(
        users[index]
    );


    return users[index];

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetAuth = {

    signup,

    login,

    logout,

    currentUser,

    isLoggedIn,

    requireLogin,

    isUsernameAvailable,

    isEmailAvailable,

    updateProfile,

    validateEmail,

    validatePassword,

    cleanUsername

};

})();