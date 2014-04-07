// models/delete.js
var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;
function Delete() { };
module.exports = Delete;
Delete.del = function del(username, postId, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            console.log('id:' + postId);
            query.user = username;
            query._id = new ObjectID.createFromHexString(postId);
            collection.remove(query, function (err, res) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null, 'success');
                
            });
           /* collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                var posts = [];
                docs.forEach(function (doc, index) {
                    console.log('find: '+doc.post);
                    posts = 'delete call';
                });
                callback(null, posts);
            });*/
        });
    });
   
};
