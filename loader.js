/*

* BuzzNet Loader
* Startup coordinator for BuzzNet modules.
  */

(function () {

"use strict";


const Loader = {

    started: false,


    /* =========================================
       GET MODULE REPORT
       ========================================= */

    getReport() {

        if (
            !window.BuzzNetModules ||
            typeof window.BuzzNetModules.report !==
            "function"
        ) {

            return null;

        }


        return window.BuzzNetModules
            .report();

    },


    /* =========================================
       CHECK REQUIRED MODULES
       ========================================= */

    isReady() {

        if (
            !window.BuzzNetModules ||
            typeof window.BuzzNetModules.ready !==
            "function"
        ) {

            return false;

        }


        return window.BuzzNetModules
            .ready();

    },


    /* =========================================
       INITIALIZE APPLICATION
       ========================================= */

    initializeApp() {

        if (
            !window.BuzzNetApp ||
            typeof window.BuzzNetApp.init !==
            "function"
        ) {

            return false;

        }


        window.BuzzNetApp
            .init();


        return true;

    },


    /* =========================================
       START BUZZNET
       ========================================= */

    start() {

        if (
            this.started
        ) {

            return {

                success: true,

                alreadyStarted: true,

                report:
                    this.getReport()

            };

        }


        const ready =
            this.isReady();


        if (!ready) {

            return {

                success: false,

                message:
                    "Required BuzzNet modules are missing.",

                report:
                    this.getReport()

            };

        }


        this.initializeApp();


        this.started =
            true;


        const result = {

            success: true,

            started: true,

            report:
                this.getReport()

        };


        window.dispatchEvent(

            new CustomEvent(
                "buzznet:started",
                {

                    detail:
                        result

                }
            )

        );


        return result;

    },


    /* =========================================
       WAIT FOR MODULES
       ========================================= */

    wait(
        timeout = 5000
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    this.isReady()
                ) {

                    resolve(
                        this.start()
                    );

                    return;

                }


                const startedAt =
                    Date.now();


                const timer =
                    setInterval(
                        () => {

                            if (
                                this.isReady()
                            ) {

                                clearInterval(
                                    timer
                                );


                                resolve(
                                    this.start()
                                );


                                return;

                            }


                            if (
                                Date.now() -
                                startedAt >=
                                timeout
                            ) {

                                clearInterval(
                                    timer
                                );


                                reject(

                                    new Error(
                                        "BuzzNet modules did not load in time."
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
       STATUS
       ========================================= */

    status() {

        return {

            started:
                this.started,

            ready:
                this.isReady(),

            report:
                this.getReport()

        };

    }

};


/* =========================================
   PUBLIC API
   ========================================= */

window.BuzzNetLoader =
    Loader;


/* =========================================
   AUTO START
   ========================================= */

function boot() {

    Loader
        .wait()
        .catch(
            error => {

                console.warn(
                    "BuzzNet startup warning:",
                    error.message
                );

            }
        );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        boot

    );

} else {

    boot();

}

})();