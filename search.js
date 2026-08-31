/*

* BuzzNet Search Engine
* Local search functionality.
  */

(function () {

"use strict";


function normalize(value) {

    return String(value || "")
        .toLowerCase()
        .trim();

}


function matches(value, query) {

    return normalize(value)
        .includes(
            normalize(query)
        );

}


function scoreText(
    text,
    query
) {

    const value =
        normalize(text);

    const search =
        normalize(query);


    if (!value || !search) {
        return 0;
    }


    if (value === search) {
        return 100;
    }


    if (value.startsWith(search)) {
        return 75;
    }


    if (value.includes(search)) {
        return 50;
    }


    return 0;

}


/* =========================================
   USER SEARCH
   ========================================= */


function searchUsers(
    query
) {

    const search =
        normalize(query);


    if (!search) {
        return [];
    }


    const users =
        window.BuzzNetStorage
            ? window.BuzzNetStorage.getUsers()
            : [];


    return users

        .map(user => {

            const score =
                Math.max(

                    scoreText(
                        user.name,
                        search
                    ),

                    scoreText(
                        user.username,
                        search
                    ),

                    scoreText(
                        user.bio,
                        search
                    )

                );


            return {
                ...user,
                score
            };

        })

        .filter(
            user =>
                user.score > 0
        )

        .sort(
            (a, b) =>
                b.score - a.score
        );

}


/* =========================================
   POST SEARCH
   ========================================= */


function searchPosts(
    query
) {

    const search =
        normalize(query);


    if (!search) {
        return [];
    }


    const posts =
        window.BuzzNetStorage
            ? window.BuzzNetStorage.getPosts()
            : [];


    return posts

        .map(post => {

            const contentScore =
                scoreText(
                    post.content,
                    search
                );


            const authorScore =
                Math.max(

                    scoreText(
                        post.author,
                        search
                    ),

                    scoreText(
                        post.username,
                        search
                    )

                );


            return {

                ...post,

                score:
                    Math.max(
                        contentScore,
                        authorScore
                    )

            };

        })

        .filter(
            post =>
                post.score > 0
        )

        .sort(
            (a, b) =>
                b.score - a.score
        );

}


/* =========================================
   GLOBAL SEARCH
   ========================================= */


function searchAll(
    query
) {

    const search =
        normalize(query);


    if (!search) {

        return {

            query: "",

            users: [],

            posts: [],

            total: 0

        };

    }


    const users =
        searchUsers(search);


    const posts =
        searchPosts(search);


    return {

        query: search,

        users,

        posts,

        total:
            users.length +
            posts.length

    };

}


/* =========================================
   SUGGESTIONS
   ========================================= */


function getSuggestions(
    query,
    limit = 8
) {

    const search =
        normalize(query);


    if (!search) {
        return [];
    }


    const users =
        searchUsers(search);


    const posts =
        searchPosts(search);


    const suggestions = [];


    users.forEach(
        user => {

            suggestions.push({

                type: "user",

                id: user.id,

                title:
                    user.name,

                subtitle:
                    "@" +
                    user.username,

                avatar:
                    user.avatar,

                score:
                    user.score

            });

        }
    );


    posts.forEach(
        post => {

            suggestions.push({

                type: "post",

                id: post.id,

                title:
                    post.content
                        .substring(
                            0,
                            70
                        ),

                subtitle:
                    post.author,

                avatar:
                    post.avatar,

                score:
                    post.score

            });

        }
    );


    return suggestions

        .sort(
            (a, b) =>
                b.score - a.score
        )

        .slice(
            0,
            limit
        );

}


/* =========================================
   SEARCH HIGHLIGHT
   ========================================= */


function highlight(
    text,
    query
) {

    const original =
        String(text || "");


    const search =
        String(query || "")
            .trim();


    if (!search) {
        return original;
    }


    const escaped =
        search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const expression =
        new RegExp(
            "(" +
            escaped +
            ")",
            "gi"
        );


    return original.replace(
        expression,
        "<mark>$1</mark>"
    );

}


/* =========================================
   TRENDING TERMS
   ========================================= */


function getTrendingTerms(
    limit = 10
) {

    const posts =
        window.BuzzNetStorage
            ? window.BuzzNetStorage.getPosts()
            : [];


    const counts = {};


    posts.forEach(
        post => {

            const words =
                normalize(
                    post.content
                )
                .split(/\s+/);


            words.forEach(
                word => {

                    const clean =
                        word.replace(
                            /[^a-z0-9#@]/gi,
                            ""
                        );


                    if (
                        clean.length < 3
                    ) {
                        return;
                    }


                    counts[clean] =
                        (
                            counts[clean] ||
                            0
                        ) + 1;

                }
            );

        }
    );


    return Object.entries(counts)

        .sort(
            (a, b) =>
                b[1] - a[1]
        )

        .slice(
            0,
            limit
        )

        .map(
            ([term, count]) => ({

                term,

                count

            })
        );

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetSearch = {

    searchUsers,

    searchPosts,

    searchAll,

    getSuggestions,

    highlight,

    getTrendingTerms,

    normalize,

    matches

};

})();