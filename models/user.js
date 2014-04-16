//user.js
var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.following = [];
    this.followers = [];
};
module.exports = User;

User.prototype.save = function save(callback) {
    var user = {
        name: this.name,
        password: this.password,
    };
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('name', { unique: true });
            collection.insert(user, { safe: true }, function (err, user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
};

User.get = function get(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({ name: username }, function (err, doc) {
                mongodb.close();
                if (doc) {
                    var user = new User(doc);
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};

User.follow = function addFollower(username, follower, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({ name: follower }, { $addToSet: { followers: username } }, function (err, count) {
                if (err) {
                     mongodb.close();
                     callback(err);
                } else {
                    collection.update({ name: username }, { $addToSet: { following: follower } }, function (err, count) {
                        mongodb.close();

                        callback(err);
                        
                    });
                }
            });
        });
    })
}

User.unfollow = function unfollow(username, unfollower, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({ name: unfollower }, { $pull: { followers: username } }, function (err, count) {
                if (err) {
                    callback(err);
                } else {
                    collection.update({ name: username }, { $pull: { following: unfollower } }, function (err, count) {
                        mongodb.close();

                        callback(err);

                    })
                }
            });
        });
    })
}

User.getFolloweInfo = function getFollowerCount(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err)
            }
            var query = {};
            if (username) {
                query.name = username;
            }
            collection.findOne(query, function (err, doc) {
                console.log(doc);
                mongodb.close();

                if (err) {
                    callback(err, null, null);
                }
                if (doc.followers == undefined && doc.following == undefined) {
                    callback(null, 0, 0);
                } else if (doc.followers == undefined) {
                    callback(null, 0, doc.following.length);
                } else if (doc.following == undefined) {
                    callback(null, doc.followers.length, 0);
                } else {
                    callback(null, doc.followers.length, doc.following.length);

                }
                
            });

        })
    });

}