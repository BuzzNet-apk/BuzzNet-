/*

* BuzzNet Profile
* Local profile management layer.
  */

(function () {

"use strict";


const storage =
    window.BuzzNetStorage || null;


/* =========================================
   CURRENT PROFILE
   ========================================= */


function current() {

    if (!storage) {
        return null;
    }


    return storage.getCurrentUser();

}


/* =========================================
   FIND USER
   ========================================= */


function find(
    identifier
) {

    if (!storage || !identifier) {
        return null;
    }


    const value =
        String(identifier)
            .trim()
            .toLowerCase();


    const users =
        storage.getUsers();


    return users.find(
        user =>

            String(
                user.id || ""
            )
                .toLowerCase() ===
                value

            ||

            String(
                user.username || ""
            )
                .toLowerCase() ===
                value

            ||

            String(
                user.email || ""
            )
                .toLowerCase() ===
                value

    ) || null;

}


/* =========================================
   UPDATE PROFILE
   ========================================= */


function update(
    changes
) {

    if (!storage) {
        return null;
    }


    const user =
        storage.getCurrentUser();


    if (!user) {
        return null;
    }


    const allowed = {};


    if (
        changes &&
        changes.name !== undefined
    ) {

        allowed.name =
            String(
                changes.name
            ).trim();

    }


    if (
        changes &&
        changes.username !== undefined
    ) {

        allowed.username =
            String(
                changes.username
            )
                .trim()
                .toLowerCase();

    }


    if (
        changes &&
        changes.bio !== undefined
    ) {

        allowed.bio =
            String(
                changes.bio
            ).trim();

    }


    if (
        changes &&
        changes.avatar !== undefined
    ) {

        allowed.avatar =
            String(
                changes.avatar
            ).trim();

    }


    if (
        changes &&
        changes.cover !== undefined
    ) {

        allowed.cover =
            String(
                changes.cover
            ).trim();

    }


    return storage
        .getUsers()
        .find(
            item =>
                item.id === user.id
        )
        ? window.BuzzNetAuth
            ? window.BuzzNetAuth
                .updateProfile(allowed)
            : null
        : null;

}


/* =========================================
   GET USER POSTS
   ========================================= */


function posts(
    userId
) {

    if (!storage) {
        return [];
    }


    const id =
        userId ||
        (
            current()
                ? current().id
                : ""
        );


    if (!id) {
        return [];
    }


    return storage
        .getPosts()
        .filter(
            post =>
                post.userId === id
        );

}


/* =========================================
   PROFILE STATS
   ========================================= */


function stats(
    userId
) {

    const user =
        userId
            ? find(userId)
            : current();


    if (!user) {

        return {

            posts: 0,

            followers: 0,

            following: 0

        };

    }


    return {

        posts:
            posts(user.id).length,

        followers:
            Number(
                user.followers || 0
            ),

        following:
            Number(
                user.following || 0
            )

    };

}


/* =========================================
   FOLLOWING CHECK
   ========================================= */


function isFollowing(
    userId
) {

    const user =
        current();


    if (!user || !userId) {
        return false;
    }


    const following =
        Array.isArray(
            user.followingUsers
        )
            ? user.followingUsers
            : [];


    return following.includes(
        userId
    );

}


/* =========================================
   FOLLOW USER
   ========================================= */


function follow(
    userId
) {

    if (!storage) {
        return null;
    }


    const me =
        current();


    if (!me || !userId) {
        return null;
    }


    if (
        me.id === userId
    ) {

        return null;

    }


    const target =
        find(userId);


    if (!target) {
        return null;
    }


    const users =
        storage.getUsers();


    const meIndex =
        users.findIndex(
            user =>
                user.id === me.id
        );


    const targetIndex =
        users.findIndex(
            user =>
                user.id === target.id
        );


    if (
        meIndex === -1 ||
        targetIndex === -1
    ) {

        return null;

    }


    if (
        !Array.isArray(
            users[meIndex]
                .followingUsers
        )
    ) {

        users[meIndex]
            .followingUsers = [];

    }


    if (
        users[meIndex]
            .followingUsers
            .includes(target.id)
    ) {

        return users[targetIndex];

    }


    users[meIndex]
        .followingUsers
        .push(target.id);


    users[meIndex].following =
        Number(
            users[meIndex]
                .following || 0
        ) + 1;


    users[targetIndex].followers =
        Number(
            users[targetIndex]
                .followers || 0
        ) + 1;


    storage.saveUsers(
        users
    );


    storage.setCurrentUser(
        users[meIndex]
    );


    return users[targetIndex];

}


/* =========================================
   UNFOLLOW USER
   ========================================= */


function unfollow(
    userId
) {

    if (!storage) {
        return null;
    }


    const me =
        current();


    if (!me || !userId) {
        return null;
    }


    const target =
        find(userId);


    if (!target) {
        return null;
    }


    const users =
        storage.getUsers();


    const meIndex =
        users.findIndex(
            user =>
                user.id === me.id
        );


    const targetIndex =
        users.findIndex(
            user =>
                user.id === target.id
        );


    if (
        meIndex === -1 ||
        targetIndex === -1
    ) {

        return null;

    }


    const following =
        Array.isArray(
            users[meIndex]
                .followingUsers
        )
            ? users[meIndex]
                .followingUsers
            : [];


    users[meIndex]
        .followingUsers =
        following.filter(
            id =>
                id !== target.id
        );


    users[meIndex].following =
        Math.max(
            0,
            Number(
                users[meIndex]
                    .following || 0
            ) - 1
        );


    users[targetIndex].followers =
        Math.max(
            0,
            Number(
                users[targetIndex]
                    .followers || 0
            ) - 1
        );


    storage.saveUsers(
        users
    );


    storage.setCurrentUser(
        users[meIndex]
    );


    return users[targetIndex];

}


/* =========================================
   FOLLOWERS
   ========================================= */


function followers(
    userId
) {

    if (!storage) {
        return [];
    }


    const target =
        find(
            userId ||
            (
                current()
                    ? current().id
                    : ""
            )
        );


    if (!target) {
        return [];
    }


    const users =
        storage.getUsers();


    return users.filter(
        user =>

            Array.isArray(
                user.followingUsers
            ) &&

            user.followingUsers
                .includes(
                    target.id
                )

    );

}


/* =========================================
   FOLLOWING
   ========================================= */


function following(
    userId
) {

    if (!storage) {
        return [];
    }


    const target =
        find(
            userId ||
            (
                current()
                    ? current().id
                    : ""
            )
        );


    if (!target) {
        return [];
    }


    const ids =
        Array.isArray(
            target.followingUsers
        )
            ? target.followingUsers
            : [];


    return storage
        .getUsers()
        .filter(
            user =>
                ids.includes(
                    user.id
                )
        );

}


/* =========================================
   PROFILE URL
   ========================================= */


function profileUrl(
    userId
) {

    if (!userId) {
        return "profile.html";
    }


    return (
        "profile.html?user=" +
        encodeURIComponent(
            userId
        )
    );

}


/* =========================================
   PUBLIC API
   ========================================= */


window.BuzzNetProfile = {

    current,

    find,

    update,

    posts,

    stats,

    isFollowing,

    follow,

    unfollow,

    followers,

    following,

    profileUrl

};

})();