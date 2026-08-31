/*

* BuzzNet Settings
* Local settings management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


const DEFAULTS = {

    theme:
        "dark",

    notifications:
        true,

    sounds:
        true,

    language:
        "en",

    autoplayMedia:
        true,

    reducedMotion:
        false,

    privateAccount:
        false

};


/* =========================================
   GET SETTINGS
   ========================================= */


function get() {

    if (!storage) {

        return {
            ...DEFAULTS
        };

    }


    return {

        ...DEFAULTS,

        ...storage.getSettings()

    };

}


/* =========================================
   SAVE SETTINGS
   ========================================= */


function save(
    settings
) {

    if (!storage) {
        return false;
    }


    const current =
        get();


    const updated = {

        ...current,

        ...settings

    };


    storage.saveSettings(
        updated
    );


    return updated;

}


/* =========================================
   UPDATE ONE SETTING
   ========================================= */


function set(
    name,
    value
) {

    if (
        !Object.prototype
            .hasOwnProperty
            .call(
                DEFAULTS,
                name
            )
    ) {

        return false;

    }


    return save({

        [name]:
            value

    });

}


/* =========================================
   THEME
   ========================================= */


function getTheme() {

    return get().theme;

}


function setTheme(
    theme
) {

    const allowed = [

        "dark",

        "light",

        "system"

    ];


    if (
        !allowed.includes(theme)
    ) {

        return false;

    }


    return set(
        "theme",
        theme
    );

}


/* =========================================
   NOTIFICATIONS
   ========================================= */


function notificationsEnabled() {

    return Boolean(
        get().notifications
    );

}


function setNotifications(
    enabled
) {

    return set(
        "notifications",
        Boolean(enabled)
    );

}


/* =========================================
   SOUNDS
   ========================================= */


function soundsEnabled() {

    return Boolean(
        get().sounds
    );

}


function setSounds(
    enabled
) {

    return set(
        "sounds",
        Boolean(enabled)
    );

}


/* =========================================
   LANGUAGE
   ========================================= */


function getLanguage() {

    return get().language;

}


function setLanguage(
    language
) {

    const value =
        String(
            language || "en"
        )
            .trim()
            .toLowerCase();


    if (!value) {
        return false;
    }


    return set(
        "language",
        value
    );

}


/* =========================================
   MEDIA
   ========================================= */


function autoplayEnabled() {

    return Boolean(
        get().autoplayMedia
    );

}


function setAutoplay(
    enabled
) {

    return set(
        "autoplayMedia",
        Boolean(enabled)
    );

}


/* =========================================
   ACCESSIBILITY
   ========================================= */


function reducedMotionEnabled() {

    return Boolean(
        get().reducedMotion
    );

}


function setReducedMotion(
    enabled
) {

    return set(
        "reducedMotion",
        Boolean(enabled)
    );

}


/* =========================================
   PRIVACY
   ========================================= */


function isPrivate() {

    return Boolean(
        get().privateAccount
    );

}


function setPrivate(
    enabled
) {

    return set(
        "privateAccount",
        Boolean(enabled)
    );

}


/* =========================================
   RESET
   ========================================= */


function reset() {

    if (!storage) {
        return {
            ...DEFAULTS
        };
    }


    storage.saveSettings(
        {
            ...DEFAULTS
        }
    );


    return get();

}


/* =========================================
   EXPORT SETTINGS
   ========================================= */


function exportSettings() {

    return JSON.stringify(
        get(),
        null,
        2
    );

}


/* =========================================
   IMPORT SETTINGS
   ========================================= */


function importSettings(
    data
) {

    let parsed;


    try {

        parsed =
            typeof data === "string"
                ? JSON.parse(data)
                : data;

    } catch (error) {

        return {

            success: false,

            message:
                "Invalid settings data."

        };

    }


    if (
        !parsed ||
        typeof parsed !== "object"
    ) {

        return {

            success: false,

            message:
                "Invalid settings data."

        };

    }


    const safe = {};


    Object.keys(DEFAULTS)
        .forEach(
            key => {

                if (
                    parsed[key] !==
                    undefined
                ) {

                    safe[key] =
                        parsed[key];

                }

            }
        );


    const updated =
        save(safe);


    return {

        success:
            Boolean(updated),

        settings:
            updated

    };

}


/* =========================================
   APPLY SETTINGS TO PAGE
   ========================================= */


function apply() {

    const settings =
        get();


    const root =
        document.documentElement;


    if (!root) {
        return settings;
    }


    root.dataset.theme =
        settings.theme;


    root.dataset.reducedMotion =
        settings.reducedMotion
            ? "true"
            : "false";


    return settings;

}


/* =========================================
   INITIALIZE
   ========================================= */


function init() {

    apply();

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetSettings = {

    DEFAULTS,

    get,

    save,

    set,

    getTheme,

    setTheme,

    notificationsEnabled,

    setNotifications,

    soundsEnabled,

    setSounds,

    getLanguage,

    setLanguage,

    autoplayEnabled,

    setAutoplay,

    reducedMotionEnabled,

    setReducedMotion,

    isPrivate,

    setPrivate,

    reset,

    exportSettings,

    importSettings,

    apply,

    init

};

})();