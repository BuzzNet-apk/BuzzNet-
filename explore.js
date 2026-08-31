/*

* BuzzNet Explore
* Discovery and search management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   USERS
   ========================================= */


function getUsers() {

    if (!storage) {
        return [];
    }


    return storage.getUsers();

}


/* =========================================
   POSTS
   ========================================= */


function getPosts() {

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
   SEARCH ALL
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

        return {

            users: [],

            posts: []

        };

    }


    const users =
        getUsers().filter(
            user =>

                String(
                    user.name || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    user.username || ""
                )
                    .toLowerCase()
                    .includes(value)

        );


    const posts =
        getPosts().filter(
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


    return {

        users,

        posts

    };

}


/* =========================================
   SEARCH USERS
   ========================================= */


function users(
    query
) {

    const value =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!value) {
        return getUsers();
    }


    return getUsers().filter(
        user =>

            String(
                user.name || ""
            )
                .toLowerCase()
                .includes(value)

            ||

            String(
                user.username || ""
            )
                .toLowerCase()
                .includes(value)

    );

}


/* =========================================
   SEARCH POSTS
   ========================================= */


function posts(
    query
) {

    const value =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (!value) {
        return getPosts();
    }


    return getPosts().filter(
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
   TRENDING POSTS
   ========================================= */


function trending(
    limit = 20
) {

    if (
        window.BuzzNetFeed &&
        typeof
            window.BuzzNetFeed.trending ===
            "function"
    ) {

        return window.BuzzNetFeed
            .trending(limit);

    }


    return getPosts()
        .sort(
            (a, b) =>

                (
                    Number(
                        b.likes || 0
                    ) +

                    (
                        Array.isArray(
                            b.comments
                        )
                            ? b.comments.length
                            : 0
                    )
                )

                -

                (
                    Number(
                        a.likes || 0
                    ) +

                    (
                        Array.isArray(
                            a.comments
                        )
                            ? a.comments.length
                            : 0
                    )
                )

        )
        .slice(
            0,
            limit
        );

}


/* =========================================
   NEW USERS
   ========================================= */


function newestUsers(
    limit = 20
) {

    return getUsers()
        .slice()
        .sort(
            (a, b) =>

                new Date(
                    b.createdAt || 0
                ) -

                new Date(
                    a.createdAt || 0
                )
        )
        .slice(
            0,
            limit
        );

}


/* =========================================
   POPULAR USERS
   ========================================= */


function popularUsers(
    limit = 20
) {

    return getUsers()
        .slice()
        .sort(
            (a, b) =>

                (
                    Number(
                        b.followers || 0
                    )
                )

                -

                (
                    Number(
                        a.followers || 0
                    )
                )

        )
        .slice(
            0,
            limit
        );

}


/* =========================================
   FEATURED USERS
   ========================================= */


function featuredUsers(
    limit = 10
) {

    return getUsers()
        .filter(
            user =>
                user.verified === true
                ||
                user.featured === true
        )
        .slice(
            0,
            limit
        );

}


/* =========================================
   HASHTAGS
   ========================================= */


function hashtags() {

    const counts = {};


    getPosts()
        .forEach(
            post => {

                const text =
                    String(
                        post.content || ""
                    );


                const tags =
                    text.match(
                        /#[a-zA-Z0-9_]+/g
                    ) || [];


                tags.forEach(
                    tag => {

                        const key =
                            tag
                                .toLowerCase();


                        counts[key] =
                            (
                                counts[key] ||
                                0
                            ) + 1;

                    }
                );

            }
        );


    return Object.entries(
        counts
    )
        .map(
            ([tag, count]) => ({

                tag,

                count

            })
        )
        .sort(
            (a, b) =>
                b.count -
                a.count
        );

}


/* =========================================
   POSTS BY HASHTAG
   ========================================= */


function byHashtag(
    hashtag
) {

    const tag =
        String(
            hashtag || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /^#/,
                ""
            );


    if (!tag) {
        return [];
    }


    return getPosts().filter(
        post => {

            const text =
                String(
                    post.content || ""
                )
                    .toLowerCase();


            return text.includes(
                "#" + tag
            );

        }
    );

}


/* =========================================
   DISCOVER
   ========================================= */


function discover() {

    return {

        trending:
            trending(),

        newestUsers:
            newestUsers(),

        popularUsers:
            popularUsers(),

        featuredUsers:
            featuredUsers(),

        hashtags:
            hashtags()

    };

}


/* =========================================
   PAGINATE
   ========================================= */


function paginate(
    items,
    page = 1,
    perPage = 20
) {

    const list =
        Array.isArray(items)
            ? items
            : [];


    const currentPage =
        Math.max(
            1,
            Number(page) || 1
        );


    const amount =
        Math.max(
            1,
            Number(perPage) || 20
        );


    const start =
        (
            currentPage - 1
        ) *
        amount;


    return {

        results:
            list.slice(
                start,
                start + amount
            ),

        page:
            currentPage,

        perPage:
            amount,

        total:
            list.length,

        totalPages:
            Math.ceil(
                list.length /
                amount
            )

    };

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetExplore = {

    getUsers,

    getPosts,

    search,

    users,

    posts,

    trending,

    newestUsers,

    popularUsers,

    featuredUsers,

    hashtags,

    byHashtag,

    discover,

    paginate

};

})();