/* 
    commands.js
    Civis db server
    
    Author(s): Marco Guernieri
    Concept Reply, 2014-07-09
*/
var mongo = require("mongodb");
    //config = module.parent.exports.config;

app.get('/:command', function(req, res) {
  res.send(501); 
});
