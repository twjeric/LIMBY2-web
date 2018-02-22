var MongoClient = require('mongodb').MongoClient;
var enfError = require('./enf');

function DB() {
    this.db = null;
}

// Connect to database
DB.prototype.connect = function(url, dbName) {
    var _this = this;
	return new Promise(function(resolve, reject) {
		if (_this.db) {
			// Already connected
			resolve();
		} else {
			var __this = _this;
			MongoClient.connect(url)
			.then(
				function(client) {
                    __this.db = client.db(dbName);
                    console.log("Connected successfully to database");
					resolve();
				},
				function(err) {
					console.log("Error connecting to database: " + err.message);
					reject(err);
				}
			)
		}
	})
}

// Find entry provided query and limit
DB.prototype.find = function(collection, query, limit=1) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                col.find(query).limit(limit).toArray(function(err, foundArr) {
                    if (err) {
                        console.log("Error reading cursor: " + err.message);
                        reject(err);
                    }
                    // No entry found
                    else if (typeof(foundArr[0]) == 'undefined') {
                        reject(new enfError);
                    }
                    // At least one entry found
                    else { 
                        resolve(foundArr.slice(0, limit));
                    }
                })
            }
        })
    })
}

// Insert one entry
DB.prototype.insertOne = function(collection, query) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                col.insertOne(query, function(err, r) {
                    if (err) { // Insert failed
                        console.log("Error reading cursor: " + err.message);
                        reject(err);
                    }
                    // Insert succeeded
                    resolve();
                })
            }
        })
    })
}

module.exports = DB;
