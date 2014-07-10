/* 
    server.js
    Civis db server
    
    Author(s): Marco Guernieri
    Concept Reply, 2014-07-09
*/

var fs = require("fs"),
		util = require('util'),
		express = require('express'),
        bodyParser = require('body-parser'),
        path = require('path');
		

//var app = module.exports.app = express.createServer();
app = express();

console.log('------------------------');
console.log('| Server is running... |');
console.log('------------------------\n');


// configuration
config = {
    "db": {
        'port': 27017,
        'host': "localhost"
    },
    'server': {
        'port': 3000,
        'address': "0.0.0.0"
    },
    'flavor': "regular",
    'debug': true
};

// reading config.json file
fs.readFile(path.join(process.cwd() + "/config.json"), 'utf-8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        config = JSON.parse(data);
    }

    module.exports.config = config;
});


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static(path.join(process.cwd() + '/public')));
//app.use(express.logger());
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');
	
if (config.accessControl){
	var accesscontrol = require('./lib/accesscontrol');
	app.use(accesscontrol.handle);
}	

// libs
require('./lib/main');
require('./lib/command');

// rest APIs
require('./lib/rest/rest');
require('./lib/rest/users');

if(!process.argv[2] || !process.argv[2].indexOf("expresso")) {
  app.listen(config.server.port, config.server.address);
}
