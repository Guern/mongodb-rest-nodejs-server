/* 
    main.js
    Civis db server
    
    Author(s): Marco Guernieri
    Concept Reply, 2014-07-09
*/

var mongo = require("mongodb"),
//config = module.parent.exports.config,
util = require("./util");

app.get('/', function (req, res) {
    res.render('layout', {
        body: "<p>Prova!</p>"
    });
});
	
app.get('/info', function(req, res){
    if(config.debug == true) {
        res.render('index', {
            config: config
        });
    } else {
        res.send();
    }
});
