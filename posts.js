/*

* BuzzNet Posts
* Local post-management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   GET POSTS
   ========================================= */


function getAll() {

    if (!storage) {
        return [];
    }


    return storage.getPosts();

}


/* =========================================
   FIND POST
   ========================================= */


function find(
    postId
) {

    if (!postId) {
        return null;
    }


    return getAll().find(
        post =>
            post.id === postId
    ) || null;

}


/* =========================================
   CREATE POST
   ========================================= */


function create(
    content,
    options = {}
) {

    if (!storage) {

        return {

            success: false,

            message:
                "BuzzNet storage is unavailable."

        };

    }


    const user =
        storage.getCurrentUser();


    if (!user) {

        return {

            success: false,

            message:
                "Please log in first."

        };

    }


    const text =
        String(
            content || ""
        ).trim();


    const image =
        String(
            options.image || ""
        ).trim();


    if (!text && !image) {

        return {

            success: false,

            message:
                "Write something or add an image."

        };

    }


    if (text.length > 5000) {

        return {

            success: false,

            message:
                "Your post is too long."

        };

    }


    const post =
        storage.addPost({

            userId:
                user.id,

            author:
                user.name,

            username:
                user.username,

            avatar:
                user.avatar ||
                "images/default-avatar.svg",

            content:
                text,

            image,

            likes: 0,

            comments: []

        });


    return {

        success: true,

        post

    };

}


/* =========================================
   UPDATE POST
   ========================================= */


function update(
    postId,
    changes
) {

    if (!storage) {
        return null;
    }


    const post =
        find(postId);


    if (!post) {
        return null;
    }


    const user =
        storage.getCurrentUser();


    if (!user) {
        return null;
    }


    if (
        post.userId !==
        user.id
    ) {

        return null;

    }


    const allowed = {};


    if (
        changes &&
        changes.content !== undefined
    ) {

        const content =
            String(
                changes.content
            ).trim();


        if (
            content.length > 5000
        ) {

            return null;

        }


        allowed.content =
            content;

    }


    if (
        changes &&
        changes.image !== undefined
    ) {

        allowed.image =
            String(
                changes.image
            ).trim();

    }


    return storage.updatePost(
        postId,
        allowed
    );

}


/* =========================================
   DELETE POST
   ========================================= */


function remove(
    postId
) {

    if (!storage) {
        return false;
    }


    const post =
        find(postId);


    if (!post) {
        return false;
    }


    const user =
        storage.getCurrentUser();


    if (!user) {
        return false;
    }


    if (
        post.userId !==
        user.id
    ) {

        return false;

    }


    return storage.deletePost(
        postId
    );

}


/* =========================================
   LIKE POST
   ========================================= */


function like(
    postId
) {

    if (!storage) {
        return null;
    }


    const post =
        find(postId);


    if (!post) {
        return null;
    }


    return storage.likePost(
        postId
    );

}


/* =========================================
   UNLIKE POST
   ========================================= */


function unlike(
    postId
) {

    if (!storage) {
        return null;
    }


    const posts =
        storage.getPosts();


    const post =
        posts.find(
            item =>
                item.id === postId
        );


    if (!post) {
        return null;
    }


    post.likes =
        Math.max(
            0,
            Number(
                post.likes || 0
            ) - 1
        );


    storage.savePosts(
        posts
    );


    return post;

}


/* =========================================
   ADD COMMENT
   ========================================= */


function comment(
    postId,
    content
) {

    if (!storage) {
        return null;
    }


    const text =
        String(
            content || ""
        ).trim();


    if (!text) {
        return null;
    }


    if (text.length > 1000) {
        return null;
    }


    return storage.addComment(
        postId,
        text
    );

}


/* =========================================
   GET COMMENTS
   ========================================= */


function comments(
    postId
) {

    const post =
        find(postId);


    if (!post) {
        return [];
    }


    return Array.isArray(
        post.comments
    )
        ? post.comments
        : [];

}


/* =========================================
   DELETE COMMENT
   ========================================= */


function removeComment(
    postId,
    commentId
) {

    if (!storage) {
        return false;
    }


    const post =
        find(postId);


    if (!post) {
        return false;
    }


    const user =
        storage.getCurrentUser();


    if (!user) {
        return false;
    }


    const commentList =
        Array.isArray(
            post.comments
        )
            ? post.comments
            : [];


    const target =
        commentList.find(
            comment =>
                comment.id ===
                commentId
        );


    if (!target) {
        return false;
    }


    if (
        target.userId !==
        user.id &&
        post.userId !==
        user.id
    ) {

        return false;

    }


    post.comments =
        commentList.filter(
            comment =>
                comment.id !==
                commentId
        );


    storage.savePosts(
        storage.getPosts()
    );


    return true;

}


/* =========================================
   USER POSTS
   ========================================= */


function byUser(
    userId
) {

    if (!userId) {
        return [];
    }


    return getAll().filter(
        post =>
            post.userId === userId
    );

}


/* =========================================
   FEED
   ========================================= */


function feed() {

    return getAll()
        .sort(
            (a, b) =>

                new Date(
                    b.createdAt
                ) -

                new Date(
                    a.createdAt
                )
        );

}


/* =========================================
   SEARCH
   ========================================= */


function search(
    query
) {

    const value =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!value) {
        return [];
    }


    return getAll().filter(
        post =>

            String(
                post.content || ""
            )
                .toLowerCase()
                .includes(value)

            ||

            String(
                post.author || ""
            )
                .toLowerCase()
                .includes(value)

            ||

            String(
                post.username || ""
            )
                .toLowerCase()
                .includes(value)

    );

}


/* =========================================
   SHARE FOUNDATION
   ========================================= */


function share(
    postId
) {

    const post =
        find(postId);


    if (!post) {
        return null;
    }


    const url =
        window.location.origin +
        window.location.pathname
            .replace(
                /[^/]*$/,
                ""
            ) +
        "index.html?post=" +
        encodeURIComponent(
            postId
        );


    return {

        postId,

        url,

        title:
            post.author +
            " on BuzzNet",

        text:
            post.content ||
            "Check out this post on BuzzNet."

    };

}


/* =========================================
   TIME FORMAT
   ========================================= */


function timeAgo(
    date
) {

    const timestamp =
        new Date(date).getTime();


    if (
        Number.isNaN(timestamp)
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


    return new Date(date)
        .toLocaleDateString();

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetPosts = {

    getAll,

    find,

    create,

    update,

    remove,

    like,

    unlike,

    comment,

    comments,

    removeComment,

    byUser,

    feed,

    search,

    share,

    timeAgo

};

})();