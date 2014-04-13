
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Delete = require('../models/delete.js');
var pagination = require('pagination');
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
            res.redirect('/u/' + currentUser.name);
        });
    });

    app.get('/u/:user', function (req, res) {
        User.get(req.params.user, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/');
            }
            Post.get(user.name, function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                });
            });
        });
    });
    app.get('/u/:user/page/:page', function (req, res) {
        User.get(req.params.user, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/');
            }
            Post.getPage(user.name, req.params.page, postPerpage, function (err, posts,postCount) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                var paginator = new pagination.SearchPaginator({ prelink: '/u/' + req.params.user, slashSeparator: true, current: req.params.page, rowsPerPage: postPerpage, totalResult: 199 });
                console.log(paginator.render().toString());
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    pagination: paginator.render().toString()
                });
            })
        });
    });
    app.delete('/u/:user/delete/:id', function (req, res) {
        Delete.del(req.params.user, req.params.id, function (err, po) {
            console.log(po);
            data = {
                msg: 'success',
                redirectTo: '/u/' + req.params.user
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
        return res.redirect('/');
    }
    next();
};
