var env = process.env.NODE_ENV || "development";
var express = require('express');
var app = express();


app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/assets', express.static('assets'));


app.get('/voice', function (req, res) {
  res.send('asdf');
});




var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});