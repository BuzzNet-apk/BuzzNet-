/*

* BuzzNet Upload
* Local image and media handling utility.
* 
* This version stores selected images as Data URLs
* for local prototype use only.
  */

(function () {

"use strict";


const CONFIG = {

    maxImageSize:
        5 * 1024 * 1024,

    allowedImageTypes: [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif"

    ]

};


/* =========================================
   VALIDATE FILE
   ========================================= */

function validateImage(
    file
) {

    if (!file) {

        return {

            success: false,

            message:
                "Please select an image."

        };

    }


    if (
        !CONFIG.allowedImageTypes
            .includes(file.type)
    ) {

        return {

            success: false,

            message:
                "Please select a JPG, PNG, WEBP, or GIF image."

        };

    }


    if (
        file.size >
        CONFIG.maxImageSize
    ) {

        return {

            success: false,

            message:
                "Image must be smaller than 5 MB."

        };

    }


    return {

        success: true,

        file

    };

}


/* =========================================
   READ FILE AS DATA URL
   ========================================= */

function readAsDataURL(
    file
) {

    return new Promise(
        (resolve, reject) => {

            const validation =
                validateImage(file);


            if (
                !validation.success
            ) {

                reject(
                    new Error(
                        validation.message
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to read the image."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================
   CREATE IMAGE PREVIEW
   ========================================= */

function preview(
    file,
    imageElement
) {

    if (!imageElement) {

        return Promise.reject(
            new Error(
                "Preview element not found."
            )
        );

    }


    return readAsDataURL(
        file
    )
        .then(
            dataUrl => {

                imageElement.src =
                    dataUrl;


                return dataUrl;

            }
        );

}


/* =========================================
   GET IMAGE DIMENSIONS
   ========================================= */

function dimensions(
    file
) {

    return new Promise(
        (resolve, reject) => {

            readAsDataURL(file)

                .then(
                    dataUrl => {

                        const image =
                            new Image();


                        image.onload =
                            function () {

                                resolve({

                                    width:
                                        image.width,

                                    height:
                                        image.height,

                                    dataUrl

                                });

                            };


                        image.onerror =
                            function () {

                                reject(
                                    new Error(
                                        "Unable to load image."
                                    )
                                );

                            };


                        image.src =
                            dataUrl;

                    }
                )

                .catch(
                    reject
                );

        }
    );

}


/* =========================================
   FORMAT FILE SIZE
   ========================================= */

function formatSize(
    bytes
) {

    const value =
        Number(bytes) || 0;


    if (value < 1024) {
        return `${value} B`;
    }


    if (value < 1024 * 1024) {

        return (
            value / 1024
        )
            .toFixed(1) +
            " KB";

    }


    return (
        value /
        (1024 * 1024)
    )
        .toFixed(1) +
        " MB";

}


/* =========================================
   IMAGE FILE INFORMATION
   ========================================= */

function info(
    file
) {

    if (!file) {
        return null;
    }


    return {

        name:
            file.name || "",

        type:
            file.type || "",

        size:
            Number(
                file.size || 0
            ),

        formattedSize:
            formatSize(
                file.size
            )

    };

}


/* =========================================
   PREPARE POST IMAGE
   ========================================= */

async function preparePostImage(
    file
) {

    const validation =
        validateImage(file);


    if (
        !validation.success
    ) {

        return validation;

    }


    try {

        const dataUrl =
            await readAsDataURL(
                file
            );


        return {

            success: true,

            image:
                dataUrl,

            info:
                info(file)

        };

    } catch (error) {

        return {

            success: false,

            message:
                error.message ||
                "Unable to prepare image."

        };

    }

}


/* =========================================
   PREPARE AVATAR
   ========================================= */

async function prepareAvatar(
    file
) {

    return preparePostImage(
        file
    );

}


/* =========================================
   PREPARE COVER
   ========================================= */

async function prepareCover(
    file
) {

    return preparePostImage(
        file
    );

}


/* =========================================
   CLEAR FILE INPUT
   ========================================= */

function clearInput(
    input
) {

    if (
        input &&
        "value" in input
    ) {

        input.value = "";

    }


    return true;

}


/* =========================================
   PUBLIC API
   ========================================= */

window.BuzzNetUpload = {

    CONFIG,

    validateImage,

    readAsDataURL,

    preview,

    dimensions,

    formatSize,

    info,

    preparePostImage,

    prepareAvatar,

    prepareCover,

    clearInput

};

})();