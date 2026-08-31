/*

* BuzzNet Feed
* Local home-feed management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   GET ALL POSTS
   ========================================= */


function getAllPosts() {

    if (!storage) {
        return [];
    }


    return storage
        .getPosts()
        .slice()
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
   CURRENT USER
   ========================================= */


function currentUser() {

    if (!storage) {
        return null;
    }


    return storage.getCurrentUser();

}


/* =========================================
   FOLLOWING IDS
   ========================================= */


function followingIds() {

    const user =
        currentUser();


    if (!user) {
        return [];

    }


    return Array.isArray(
        user.followingUsers
    )
        ? user.followingUsers
        : [];

}


/* =========================================
   PERSONALIZED FEED
   ========================================= */


function personalized() {

    const user =
        currentUser();


    const posts =
        getAllPosts();


    if (!user) {

        return posts;

    }


    const following =
        followingIds();


    const relevant =
        posts.filter(
            post =>

                post.userId ===
                user.id

                ||

                following.includes(
                    post.userId
                )
        );


    /*
     * If the user has not followed anyone yet,
     * show the general BuzzNet feed instead.
     */

    if (!following.length) {

        return posts;

    }


    return relevant;

}


/* =========================================
   DISCOVER FEED
   ========================================= */


function discover() {

    return getAllPosts();

}


/* =========================================
   TRENDING FEED
   ========================================= */


function trending(
    limit = 20
) {

    return getAllPosts()

        .map(post => {

            const likes =
                Number(
                    post.likes || 0
                );


            const comments =
                Array.isArray(
                    post.comments
                )
                    ? post.comments.length
                    : 0;


            const created =
                new Date(
                    post.createdAt
                ).getTime();


            const ageHours =
                Math.max(
                    1,
                    (
                        Date.now() -
                        created
                    ) /
                    3600000
                );


            const engagement =
                likes +
                (
                    comments * 2
                );


            const score =
                engagement /
                Math.pow(
                    ageHours,
                    0.45
                );


            return {

                ...post,

                feedScore:
                    score

            };

        })

        .sort(
            (a, b) =>
                b.feedScore -
                a.feedScore
        )

        .slice(
            0,
            limit
        );

}


/* =========================================
   FILTER BY USER
   ========================================= */


function byUser(
    userId
) {

    if (!userId) {
        return [];
    }


    return getAllPosts()
        .filter(
            post =>
                post.userId ===
                userId
        );

}


/* =========================================
   FILTER BY KEYWORD
   ========================================= */


function filter(
    posts,
    query
) {

    const value =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!value) {
        return Array.isArray(posts)
            ? posts
            : [];

    }


    return (
        Array.isArray(posts)
            ? posts
            : []
    ).filter(
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
   PAGINATION
   ========================================= */


function paginate(
    posts,
    page = 1,
    perPage = 10
) {

    const items =
        Array.isArray(posts)
            ? posts
            : [];


    const safePage =
        Math.max(
            1,
            Number(page) || 1
        );


    const safePerPage =
        Math.max(
            1,
            Number(perPage) || 10
        );


    const start =
        (
            safePage - 1
        ) *
        safePerPage;


    const results =
        items.slice(
            start,
            start + safePerPage
        );


    return {

        results,

        page:
            safePage,

        perPage:
            safePerPage,

        total:
            items.length,

        totalPages:
            Math.ceil(
                items.length /
                safePerPage
            ),

        hasNext:
            start +
            safePerPage <
            items.length,

        hasPrevious:
            safePage > 1

    };

}


/* =========================================
   REFRESH
   ========================================= */


function refresh() {

    return {

        personalized:
            personalized(),

        discover:
            discover(),

        trending:
            trending()

    };

}


/* =========================================
   FEED STATISTICS
   ========================================= */


function statistics(
    posts
) {

    const items =
        Array.isArray(posts)
            ? posts
            : [];


    let likes = 0;

    let comments = 0;


    items.forEach(
        post => {

            likes +=
                Number(
                    post.likes || 0
                );


            comments +=
                Array.isArray(
                    post.comments
                )
                    ? post.comments.length
                    : 0;

        }
    );


    return {

        posts:
            items.length,

        likes,

        comments,

        engagement:
            likes + comments

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


window.BuzzNetFeed = {

    getAllPosts,

    currentUser,

    followingIds,

    personalized,

    discover,

    trending,

    byUser,

    filter,

    paginate,

    refresh,

    statistics,

    timeAgo

};

})();