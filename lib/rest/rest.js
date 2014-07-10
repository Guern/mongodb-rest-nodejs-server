/* 
    rest.js
    Civis db server
    
    Author(s): Marco Guernieri
    Concept Reply, 2014-07-09
*/

var mongo = require("mongodb"),
    util = require("../util"),
    BSON = mongo.BSONPure,
    assert = require('assert');

// getting config
//var config = module.parent.exports.config;

// mongo client interface
var MongoClient = require('mongodb').MongoClient

/**
 * Query
 */
app.get('/energy/:collection/:id?', function(req, res) { 
    console.log('---- GET request - db: ' + config.db.name + ', collection: ' + req.params.collection + ((req.params.id)? ', id: ' + req.params.id : ''));

    var query = req.query.query ? JSON.parse(req.query.query) : {};

    // Providing an id overwrites giving a query in the URL
    if (req.params.id) {
        query = {'_id': new BSON.ObjectID(req.params.id)};
    }
    var options = req.params.options || {};

    var test = ['limit','sort','fields','skip','hint','explain','snapshot','timeout'];

    for( o in req.query ) {
        if( test.indexOf(o) >= 0 ) {
            options[o] = req.query[o];
        } 
    }

    //connect away
    MongoClient.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name, function (err, db) {
        if (err) throw err;
        console.log("\tConnected to Database");
        db.authenticate(config.db.username, config.db.password, function (err, result) {
            // check the authentication
            //assert.equal(true, result);

            // find record
            db.collection(req.params.collection, function (err, collection) {
                if (err) throw err;

                collection.find(query, options, function (err, cursor) {
                    if (err) throw err;

                    cursor.toArray(function (err, docs) {
                        if (err) throw err;

                        var result = [];
                        if (req.params.id) {
                            if (docs.length > 0) {
                                console.log("\tDocument found");
                                result = util.flavorize(docs[0], "out");
                                res.header('Content-Type', 'application/json');
                                res.send(result);
                            } else {
                                console.log("\tDocument does not exist");
                                res.send(404);
                            }
                        } else {
                            console.log("\tDocument list found");
                            docs.forEach(function (doc) {
                                result.push(util.flavorize(doc, "out"));
                            });
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        }
                        db.close();
                        console.log("\n");
                    });
                });
            });
        });
    });
});

/**
 * Insert
 */
app.post('/energy/:collection', function (req, res) {
    console.log('---- POST request - db: ' + config.db.name + ', collection: ' + req.params.collection);

    if (req.body) {
        //connect away
        MongoClient.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name, function (err, db) {
            if (err) throw err;
            console.log("\tConnected to Database");
            db.authenticate(config.db.username, config.db.password, function () {
                // json from the body
                var document = Array.isArray(req.body) ? req.body[0] : req.body;

                //insert record
                db.collection(req.params.collection).insert(document, function (err, records) {
                    if (err) throw err;
                    console.log("\tRecord added as " + records[0]._id);
                    res.header('Location', '/' + config.db.name + '/' + req.params.collection + '/' + records[0]._id.toHexString());
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}', 201);

                    // Close the db
                    db.close();
                    console.log("\n");
                });
            });
        });
    } else {
        console.log("\tRequest aborted");
        res.header('Content-Type', 'application/json');
        res.send('{"ok":0}', 200);
        console.log("\n");
    }
});

/**
 * Update
 */
app.put('/energy/:collection/:id', function (req, res) {
    console.log('---- PUT request - db: ' + config.db.name + ', collection: ' + req.params.collection + ', id: ' + req.params.id);

    var spec = { '_id': new BSON.ObjectID(req.params.id) };

    if (req.body) {
        //connect away
        MongoClient.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name, function (err, db) {
            if (err) throw err;
            console.log("\tConnected to Database");
            db.authenticate(config.db.username, config.db.password, function () {
                // TODO: check if well formed json
                var document = req.body;

                db.collection(req.params.collection, function (err, collection) {
                    collection.update(spec, document, true, function (err, records) {
                        console.log("\tRecord put as " + records[0]._id);
                        res.header('Content-Type', 'application/json');
                        res.send('{"ok":1}');

                        // Close the db
                        db.close();
                        console.log("\n");
                    });
                });
            });
        });
    } else {
        console.log("\tRequest aborted");
        res.header('Content-Type', 'application/json');
        res.send('{"ok":0}', 200);
        console.log("\n");
    }
});

/**
 * Delete
 */
app.delete('/energy/:collection/:id', function (req, res) {
    console.log('---- DELETE request - db: ' + config.db.name + ', collection: ' + req.params.collection + ', id: ' + req.params.id);

    var spec = { '_id': new BSON.ObjectID(req.params.id) };
 
    //connect away
    MongoClient.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name, function (err, db) {
        if (err) throw err;
        console.log("\tConnected to Database");
        db.authenticate(config.db.username, config.db.password, function () {
            db.collection(req.params.collection, function(err, collection) {
                collection.remove(spec, function (err, removed) {
                    if (err) throw err;

                    if (removed > 0) {
                        console.log("\tRecord " + req.params.id + " deleted");
                    } else {
                        console.log("\Record " + req.params.id + " does not exist");
                    }
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}');

                    // Close the db
                    db.close();
                    console.log("\n");
                });
            });
        });
    });
});

/**
 * Delete entire collection
 */
app.delete('energy/:collection', function (req, res) {
    console.log('---- DELETE ALL request - db: ' + config.db.name + ', collection: ' + req.params.collection);


    //connect away
    MongoClient.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name, function (err, db) {
        if (err) throw err;
        console.log("\tConnected to Database");
        db.authenticate(config.db.username, config.db.password, function () {
            db.collection(req.params.collection, function (err, collection) {
                collection.remove({}, function (err, removed) {
                    if (err) throw err;

                    if (removed > 0) {
                        console.log("\tRecord " + req.params.id + " deleted");
                    } else {
                        console.log("\Record " + req.params.id + " does not exist");
                    }
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}');

                    // Close the db
                    db.close();
                    console.log("\n");
                });
            });
        });
    });
});