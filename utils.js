/*

* BuzzNet Utilities
* Shared helper functions.
  */

(function () {

"use strict";


/* =========================================
   GENERATE ID
   ========================================= */

function createId(
    prefix = "buzz"
) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


/* =========================================
   CLEAN TEXT
   ========================================= */

function cleanText(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   FORMAT NUMBER
   ========================================= */

function formatNumber(
    value
) {

    const number =
        Number(value) || 0;


    return new Intl.NumberFormat()
        .format(number);

}


/* =========================================
   FORMAT COMPACT NUMBER
   ========================================= */

function formatCompact(
    value
) {

    const number =
        Number(value) || 0;


    return new Intl.NumberFormat(
        undefined,
        {
            notation: "compact",
            maximumFractionDigits: 1
        }
    )
        .format(number);

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatDate(
    date,
    options = {}
) {

    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return "";

    }


    return value.toLocaleDateString(
        undefined,
        options
    );

}


/* =========================================
   FORMAT TIME
   ========================================= */

function formatTime(
    date,
    options = {}
) {

    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return "";

    }


    return value.toLocaleTimeString(
        undefined,
        options
    );

}


/* =========================================
   TIME AGO
   ========================================= */

function timeAgo(
    date
) {

    const timestamp =
        new Date(date)
            .getTime();


    if (
        Number.isNaN(
            timestamp
        )
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


    return formatDate(
        date
    );

}


/* =========================================
   COPY TEXT
   ========================================= */

async function copy(
    text
) {

    const value =
        String(
            text || ""
        );


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator
                .clipboard
                .writeText(
                    value
                );


            return true;

        }


        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            value;


        textarea.style.position =
            "fixed";


        textarea.style.opacity =
            "0";


        document.body
            .appendChild(
                textarea
            );


        textarea.select();


        const copied =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        return copied;

    } catch (error) {

        return false;

    }

}


/* =========================================
   GET URL PARAMETER
   ========================================= */

function getParam(
    name,
    url = window.location.href
) {

    try {

        const params =
            new URL(
                url
            ).searchParams;


        return params.get(
            name
        );

    } catch (error) {

        return null;

    }

}


/* =========================================
   DEBOUNCE
   ========================================= */

function debounce(
    callback,
    delay = 300
) {

    let timer;


    return function (
        ...args
    ) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () => {

                    callback.apply(
                        this,
                        args
                    );

                },
                Math.max(
                    0,
                    Number(delay) || 0
                )
            );

    };

}


/* =========================================
   THROTTLE
   ========================================= */

function throttle(
    callback,
    delay = 300
) {

    let waiting =
        false;


    return function (
        ...args
    ) {

        if (waiting) {
            return;
        }


        callback.apply(
            this,
            args
        );


        waiting =
            true;


        setTimeout(
            () => {

                waiting =
                    false;

            },
            Math.max(
                0,
                Number(delay) || 0
            )
        );

    };

}


/* =========================================
   SAFE JSON PARSE
   ========================================= */

function safeJSON(
    value,
    fallback = null
) {

    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        return fallback;

    }

}


/* =========================================
   PUBLIC API
   ========================================= */

window.BuzzNetUtils = {

    createId,

    cleanText,

    escapeHTML,

    formatNumber,

    formatCompact,

    formatDate,

    formatTime,

    timeAgo,

    copy,

    getParam,

    debounce,

    throttle,

    safeJSON

};

})();