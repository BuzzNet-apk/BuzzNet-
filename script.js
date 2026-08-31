/* =========================================================
BUZZNET — MAIN SCRIPT
Version 1.0
Designed for the current BuzzNet index.html + style.css
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
   ELEMENTS
   ===================================================== */

const searchBtn = document.getElementById("searchBtn");
const profileBtn = document.getElementById("profileBtn");

const openComposer = document.getElementById("openComposer");
const composerModal = document.getElementById("composerModal");
const closeComposer = document.getElementById("closeComposer");
const closeComposerBtn = document.getElementById("closeComposerBtn");

const postText = document.getElementById("postText");
const characterCount = document.getElementById("characterCount");
const publishPost = document.getElementById("publishPost");

const emptyFeed = document.getElementById("emptyFeed");


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

const STORAGE_KEY = "buzznet_posts";

function getPosts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error("BuzzNet storage error:", error);
        return [];
    }
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}


/* =====================================================
   COMPOSER
   ===================================================== */

function openPostComposer() {
    if (!composerModal) return;

    composerModal.classList.add("show");
    composerModal.setAttribute("aria-hidden", "false");

    setTimeout(() => {
        if (postText) postText.focus();
    }, 100);
}

function closePostComposer() {
    if (!composerModal) return;

    composerModal.classList.remove("show");
    composerModal.setAttribute("aria-hidden", "true");
}

if (openComposer) {
    openComposer.addEventListener("click", openPostComposer);
}

if (closeComposer) {
    closeComposer.addEventListener("click", closePostComposer);
}

if (closeComposerBtn) {
    closeComposerBtn.addEventListener("click", closePostComposer);
}


/* =====================================================
   ESCAPE KEY
   ===================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closePostComposer();
    }

});


/* =====================================================
   CHARACTER COUNTER
   ===================================================== */

if (postText && characterCount) {

    postText.addEventListener("input", () => {

        const length = postText.value.length;

        characterCount.textContent = `${length} / 500`;

    });

}


/* =====================================================
   CREATE POST
   ===================================================== */

function createPost(text) {

    const posts = getPosts();

    const post = {
        id: Date.now(),
        text: text,
        author: "You",
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
    };

    posts.unshift(post);

    savePosts(posts);

    return post;
}


/* =====================================================
   PUBLISH POST
   ===================================================== */

if (publishPost) {

    publishPost.addEventListener("click", () => {

        const text = postText.value.trim();

        if (!text) {
            alert("Write something before posting.");
            postText.focus();
            return;
        }

        if (text.length > 500) {
            alert("Your post is too long.");
            return;
        }

        createPost(text);

        postText.value = "";
        characterCount.textContent = "0 / 500";

        closePostComposer();

        renderPosts();

    });

}


/* =====================================================
   RENDER POSTS
   ===================================================== */

function renderPosts() {

    const posts = getPosts();

    /*
     * At this stage the feed keeps the original empty-feed
     * structure. Actual post cards will be added in the
     * next social-feed stage.
     */

    if (!emptyFeed) return;

    if (posts.length === 0) {

        emptyFeed.style.display = "";

    } else {

        emptyFeed.style.display = "";

    }

}


/* =====================================================
   SEARCH BUTTON
   ===================================================== */

if (searchBtn) {

    searchBtn.addEventListener("click", () => {

        window.location.href = "explore.html";

    });

}


/* =====================================================
   PROFILE BUTTON
   ===================================================== */

if (profileBtn) {

    profileBtn.addEventListener("click", () => {

        window.location.href = "profile.html";

    });

}


/* =====================================================
   PREVENT EMPTY ACTION BUTTONS
   ===================================================== */

const createActions =
    document.querySelectorAll(".create-action");

createActions.forEach((button) => {

    button.addEventListener("click", () => {

        openPostComposer();

    });

});


/* =====================================================
   INITIALIZE
   ===================================================== */

renderPosts();

});