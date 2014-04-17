
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Delete = require('../models/delete.js');
var postPerpage = 5;
module.exports = function (app) {
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: 'Main Page',
                posts: posts,
            });
        });
    });


    app.get('/reg', checkNLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: 'User Signup'
        });
    });

    app.get('/reg', checkNLogin);
    app.post('/reg', function (req, res) {
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', 'Two passwords are different');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = new User({
            name: req.body.username,
            password: password,
        });
        User.get(newUser.name, function (err, user) {
            if (user)
                err = 'Username already exists.';
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            newUser.save(function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                console.log(req.session.user);
                req.flash('success', 'Register success');
                res.redirect('/');
            });
        });
    });

    app.get('/login', checkNLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: 'User Login',
        });
    });

    app.get('/login', checkNLogin);
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.get(req.body.username, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', 'Wrong password!');
                return res.redirect('/login');
            }
            req.session.user = user;
            console.log(req.session.user);
            req.flash('success', 'Log in successfully');
            res.redirect('/');
        });
    });


    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', 'Log out successfully');
        res.redirect('/');
    });
    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', 'post success');
            res.redirect('/u/' + currentUser.name + '/page/1');
        });
    });

    app.post('/u/:user/follow', checkLogin);
    app.post('/u/:user/follow', function (req, res) {
        User.follow(req.session.user.name, req.params.user, function (err) {
            if (err) {
                req.flash('error', err);
            }
            return res.redirect('/u/' + req.params.user + '/page/1')
        })

    });

    app.post('/u/:user/unfollow', checkLogin);
    app.post('/u/:user/unfollow', function (req, res) {
        User.unfollow(req.session.user.name, req.params.user, function (err) {
            if (err) {
                req.flash('error', err);
            }
            return res.redirect('/u/' + req.params.user + '/page/1')
        })

    });

    app.get('/u/:user/followers', checkLogin);
    app.get('/u/:user/followers', function (req, res) {
        User.get(req.params.user, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/');
            }
            User.getFollowInfo(req.params.user, function (err, followerlist, followinglist) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                console.log(followerlist);
                res.render('userlist', {
                    title: req.params.user,
                    userlist: followerlist,
                    listname:'Followers',
                    followerCount: (followerlist == undefined) ? 0 : followerlist.length,
                    followingCount: (followinglist == undefined) ? 0 : followinglist.length,
                });
            });
        })
    });
    app.get('/u/:user/following', checkLogin);
    app.get('/u/:user/following', function (req, res) {
        User.get(req.params.user, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/');
            }
            User.getFollowInfo(req.params.user, function (err, followerlist, followinglist) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                console.log(followinglist);
                res.render('userlist', {
                    title: req.params.user,
                    userlist: followinglist,
                    listname: 'Following',
                    followerCount: (followerlist == undefined) ? 0 : followerlist.length,
                    followingCount: (followinglist == undefined) ? 0 : followinglist.length,
                });
            });
        })
    });

    app.get('/u/:user/:page', function (req, res) {
        if (req.params.user == req.session.user.name) {
            User.get(req.params.user, function (err, user) {
                if (!user) {
                    req.flash('error', 'user does not exist');
                    return res.redirect('/');
                }
                User.getFollowInfo(req.params.user, function (err, followerlist, followinglist) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/');
                    }
                    Post.getCount(followinglist, function (err, totalPosts) {
                        if (err) {
                            req.flash('error', err);
                            return res.redirect('/');
                        }
                        Post.getPostPerPage(followinglist, req.params.page, postPerpage, function (err, posts) {
                            console.log(posts);
                            if (err) {
                                req.flash('error', err);
                                return res.redirect('/');
                            }
                            console.log(Math.ceil(totalPosts / postPerpage));
                            res.render('user', {
                                title: user.name,
                                posts: posts,
                                postCount: totalPosts,
                                curPage: req.params.page,
                                pageCount: Math.ceil(totalPosts / postPerpage),
                                currentUser: 1,
                                follower: (followerlist == undefined) ? 0 : followerlist.length,
                                following: (followinglist == undefined) ? 0 : followinglist.length,
                            });
                        });
                    });
                });
            });
        }else{
            res.redirect('/u/' + req.params.user + '/page/1');
        }
    });

    app.get('/u/:user/page/:page', function (req, res) {
        User.get(req.params.user, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/');
            }
            Post.getPostPerPage(req.params.user, req.params.page, postPerpage, function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                Post.getCount(req.params.user, function (err, totalPosts) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/');
                    }
                    User.getFollowInfo(req.params.user, function (err, followerlist, followinglist) {
                        if (err) {
                            req.flash('error', err);
                            return res.redirect('/');
                        }
                        console.log(Math.ceil(totalPosts / postPerpage));
                        User.checkFollow(req.session.user.name, req.params.user, function (err, index) {
                            if (req.session.user.name == req.params.user) {
                                res.render('user', {
                                    title: req.params.user,
                                    posts: posts,
                                    postCount: totalPosts,
                                    curPage: req.params.page,
                                    pageCount: Math.ceil(totalPosts / postPerpage),
                                    follower: (followerlist == undefined)? 0:followerlist.length,
                                    following: (followinglist == undefined) ? 0 : followinglist.length,
                                });
                            } else {
                                res.render('user', {
                                    title: req.params.user,
                                    posts: posts,
                                    postCount: totalPosts,
                                    curPage: req.params.page,
                                    pageCount: Math.ceil(totalPosts / postPerpage),
                                    follower: (followerlist == undefined) ? 0 : followerlist.length,
                                    following: (followinglist == undefined) ? 0 : followinglist.length,
                                    followTag: (index == -1) ? 'Follow' : 'UnFollow'
                                });
                            }
                        })

                        
                    });
                    
                });
            })
        });
    });
    app.delete('/u/:user/delete/:id', function (req, res) {
        Delete.del(req.params.user, req.params.id, function (err, po) {
            console.log(po);
            data = {
                msg: 'success',
                redirectTo: '/u/' + req.params.user + '/page/1'
            }
            res.send((!err) ? data : { msg: 'error: ' + err });
            
        });      
    });

};

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Please log in first');
        return res.redirect('/login');
    }
    next();
};
function checkNLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', 'logged in already');
        return res.redirect('/u/' + req.session.user.name + '/page/1');
    }
    next();
};

function checkInitLogin(req, res, next) {
    if (req.session.user) {
        return res.redirect('/u/' + req.session.user.name + '/page/1');
    }
    next();
};