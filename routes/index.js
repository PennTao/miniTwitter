
/*
 * GET home page.
 */
module.exports = function (app) {
    var crypto = require('crypto');
    var User = require('../models/user.js');
    app.get('/', function (req, res) {
        res.render('index', {
            title: 'miniTwitter'
        });
    });

    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: 'User Signup'
        });
    });
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
                req.flash('success', 'Register success');
                res.redirect('/');
            });
        });
    });
    app.get('/login', function (req, res) {
        res.render('login', {
            title: 'User Login',
        });
    });

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
            req.flash('success', 'Log in successfully');
            res.redirect('/');
        });
    });
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', 'Log out successfully');
        res.redirect('/');

    })
};
