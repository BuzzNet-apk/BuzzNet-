/*

* BuzzNet App
* Central application initializer.
* 
* This file coordinates available BuzzNet modules
* without modifying the individual feature files.
  */

(function () {

"use strict";


const App = {

    initialized: false,

    modules: {},


    /* =========================================
       LOAD AVAILABLE MODULES
       ========================================= */

    loadModules() {

        this.modules = {

            storage:
                window.BuzzNetStorage || null,

            auth:
                window.BuzzNetAuth || null,

            router:
                window.BuzzNetRouter || null,

            search:
                window.BuzzNetSearch || null,

            notifications:
                window.BuzzNetNotifications || null,

            messages:
                window.BuzzNetMessages || null,

            profile:
                window.BuzzNetProfile || null,

            posts:
                window.BuzzNetPosts || null,

            feed:
                window.BuzzNetFeed || null,

            settings:
                window.BuzzNetSettings || null,

            explore:
                window.BuzzNetExplore || null,

            upload:
                window.BuzzNetUpload || null,

            utils:
                window.BuzzNetUtils || null,

            ikCore:
                window.BuzzNetIKCore || null,

            ik:
                window.BuzzNetIK || null

        };


        return this.modules;

    },


    /* =========================================
       INITIALIZE SETTINGS
       ========================================= */

    initializeSettings() {

        const settings =
            this.modules.settings;


        if (
            settings &&
            typeof settings.init ===
            "function"
        ) {

            settings.init();

        }

    },


    /* =========================================
       INITIALIZE ROUTER
       ========================================= */

    initializeRouter() {

        const router =
            this.modules.router;


        if (
            router &&
            typeof router.init ===
            "function"
        ) {

            router.init();

        }

    },


    /* =========================================
       CHECK MODULE STATUS
       ========================================= */

    getModuleStatus() {

        const status = {};


        Object.keys(
            this.modules
        ).forEach(
            name => {

                status[name] =
                    Boolean(
                        this.modules[name]
                    );

            }
        );


        return status;

    },


    /* =========================================
       GET CURRENT USER
       ========================================= */

    getCurrentUser() {

        const storage =
            this.modules.storage;


        if (
            !storage ||
            typeof storage.getCurrentUser !==
            "function"
        ) {

            return null;

        }


        return storage.getCurrentUser();

    },


    /* =========================================
       APPLICATION STATUS
       ========================================= */

    status() {

        return {

            initialized:
                this.initialized,

            modules:
                this.getModuleStatus(),

            currentUser:
                this.getCurrentUser()

        };

    },


    /* =========================================
       INITIALIZE APPLICATION
       ========================================= */

    init() {

        if (
            this.initialized
        ) {

            return this.status();

        }


        this.loadModules();


        this.initializeSettings();


        this.initializeRouter();


        this.initialized =
            true;


        window.dispatchEvent(

            new CustomEvent(
                "buzznet:ready",
                {

                    detail:
                        this.status()

                }
            )

        );


        return this.status();

    }

};


/* =========================================
   PUBLIC API
   ========================================= */

window.BuzzNetApp =
    App;


/* =========================================
   AUTO INITIALIZATION
   ========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        function () {

            App.init();

        }

    );

} else {

    App.init();

}

})();