/*

* BuzzNet Router
* Simple page navigation and route utilities.
  */

(function () {

"use strict";


const ROUTES = {

    home:
        "index.html",

    login:
        "login.html",

    signup:
        "signup.html",

    explore:
        "explore.html",

    notifications:
        "notifications.html",

    messages:
        "messages.html",

    profile:
        "profile.html",

    settings:
        "settings.html",

    ik:
        "ik.html",

    about:
        "about.html",

    contact:
        "contact.html",

    privacy:
        "privacy.html",

    terms:
        "terms.html"

};


/* =========================================
   NAVIGATE
   ========================================= */


function go(route) {

    const destination =
        ROUTES[route];


    if (!destination) {

        console.warn(
            "BuzzNet: Unknown route:",
            route
        );

        return false;

    }


    window.location.href =
        destination;


    return true;

}


/* =========================================
   GET CURRENT PAGE
   ========================================= */


function getCurrentPage() {

    const path =
        window.location.pathname;


    const filename =
        path
            .split("/")
            .pop()
            .toLowerCase();


    if (
        !filename ||
        filename === "/"
    ) {

        return "home";

    }


    for (
        const [route, page]
        of Object.entries(ROUTES)
    ) {

        if (
            page.toLowerCase() ===
            filename
        ) {

            return route;

        }

    }


    return "404";

}


/* =========================================
   CHECK ROUTE
   ========================================= */


function exists(route) {

    return Boolean(
        ROUTES[route]
    );

}


/* =========================================
   GET ROUTE URL
   ========================================= */


function url(route) {

    return ROUTES[route] || null;

}


/* =========================================
   GO BACK
   ========================================= */


function back(
    fallback = "home"
) {

    if (
        window.history.length > 1
    ) {

        window.history.back();

    } else {

        go(fallback);

    }

}


/* =========================================
   OPEN EXTERNAL URL
   ========================================= */


function external(
    url,
    newTab = false
) {

    if (!url) {
        return false;
    }


    if (newTab) {

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    } else {

        window.location.href =
            url;

    }


    return true;

}


/* =========================================
   PAGE TITLE
   ========================================= */


function setTitle(
    title
) {

    if (!title) {
        return;
    }


    document.title =
        title +
        " · BuzzNet";

}


/* =========================================
   NAVIGATION HELPERS
   ========================================= */


function goHome() {
    return go("home");
}


function goExplore() {
    return go("explore");
}


function goNotifications() {
    return go("notifications");
}


function goMessages() {
    return go("messages");
}


function goProfile() {
    return go("profile");
}


function goSettings() {
    return go("settings");
}


function goIK() {
    return go("ik");
}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetRouter = {

    routes:
        ROUTES,

    go,

    getCurrentPage,

    exists,

    url,

    back,

    external,

    setTitle,

    goHome,

    goExplore,

    goNotifications,

    goMessages,

    goProfile,

    goSettings,

    goIK

};

})();