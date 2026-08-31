/*

* BuzzNet Modules
* Module registry and dependency checker.
  */

(function () {

"use strict";


const Modules = {


    /* =========================================
       MODULE REGISTRY
       ========================================= */

    registry: {

        storage: {
            global: "BuzzNetStorage",
            required: true
        },

        auth: {
            global: "BuzzNetAuth",
            required: true
        },

        router: {
            global: "BuzzNetRouter",
            required: true
        },

        search: {
            global: "BuzzNetSearch",
            required: false
        },

        notifications: {
            global: "BuzzNetNotifications",
            required: false
        },

        messages: {
            global: "BuzzNetMessages",
            required: false
        },

        profile: {
            global: "BuzzNetProfile",
            required: false
        },

        posts: {
            global: "BuzzNetPosts",
            required: false
        },

        feed: {
            global: "BuzzNetFeed",
            required: false
        },

        settings: {
            global: "BuzzNetSettings",
            required: false
        },

        explore: {
            global: "BuzzNetExplore",
            required: false
        },

        upload: {
            global: "BuzzNetUpload",
            required: false
        },

        utils: {
            global: "BuzzNetUtils",
            required: false
        },

        ikCore: {
            global: "BuzzNetIKCore",
            required: false
        },

        ik: {
            global: "BuzzNetIK",
            required: false
        },

        app: {
            global: "BuzzNetApp",
            required: false
        }

    },


    /* =========================================
       GET ONE MODULE
       ========================================= */

    get(name) {

        const item =
            this.registry[name];


        if (!item) {
            return null;
        }


        return window[
            item.global
        ] || null;

    },


    /* =========================================
       CHECK ONE MODULE
       ========================================= */

    exists(name) {

        return Boolean(
            this.get(name)
        );

    },


    /* =========================================
       GET ALL MODULES
       ========================================= */

    getAll() {

        const result = {};


        Object.keys(
            this.registry
        ).forEach(
            name => {

                result[name] =
                    this.get(name);

            }
        );


        return result;

    },


    /* =========================================
       MODULE STATUS
       ========================================= */

    status() {

        const result = {};


        Object.keys(
            this.registry
        ).forEach(
            name => {

                const item =
                    this.registry[name];


                result[name] = {

                    loaded:
                        Boolean(
                            window[
                                item.global
                            ]
                        ),

                    required:
                        item.required,

                    global:
                        item.global

                };

            }
        );


        return result;

    },


    /* =========================================
       REQUIRED MODULES
       ========================================= */

    required() {

        return Object.keys(
            this.registry
        )
            .filter(
                name =>
                    this.registry[name]
                        .required
            );

    },


    /* =========================================
       MISSING MODULES
       ========================================= */

    missing() {

        return this.required()
            .filter(
                name =>
                    !this.exists(name)
            );

    },


    /* =========================================
       READY CHECK
       ========================================= */

    ready() {

        return this.missing()
            .length === 0;

    },


    /* =========================================
       WAIT FOR MODULE
       ========================================= */

    waitFor(
        name,
        timeout = 5000
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    this.exists(name)
                ) {

                    resolve(
                        this.get(name)
                    );

                    return;

                }


                const started =
                    Date.now();


                const timer =
                    setInterval(
                        () => {

                            if (
                                this.exists(name)
                            ) {

                                clearInterval(
                                    timer
                                );


                                resolve(
                                    this.get(name)
                                );


                                return;

                            }


                            if (
                                Date.now() -
                                started >=
                                timeout
                            ) {

                                clearInterval(
                                    timer
                                );


                                reject(
                                    new Error(
                                        `Module "${name}" was not loaded.`
                                    )
                                );

                            }

                        },
                        50
                    );

            }
        );

    },


    /* =========================================
       REPORT
       ========================================= */

    report() {

        const moduleStatus =
            this.status();


        const loaded =
            Object.values(
                moduleStatus
            )
                .filter(
                    item =>
                        item.loaded
                )
                .length;


        const total =
            Object.keys(
                moduleStatus
            )
                .length;


        return {

            ready:
                this.ready(),

            loaded,

            total,

            missing:
                this.missing(),

            modules:
                moduleStatus

        };

    }


};


/* =========================================
   PUBLIC API
   ========================================= */

window.BuzzNetModules =
    Modules;


/* =========================================
   READY EVENT
   ========================================= */

window.dispatchEvent(

    new CustomEvent(
        "buzznet:modules-ready",
        {

            detail:
                Modules.report()

        }
    )

);

})();