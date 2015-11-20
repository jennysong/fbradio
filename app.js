var env = process.env.NODE_ENV || "development";
var express = require('express');
var app = express();

global.config = require(__dirname + '/config.json')[env];


app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/assets', express.static('assets'));


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/login', function (req, res) {
  scopes = ['public_profile'] //read_stream
  res.redirect('https://www.facebook.com/dialog/oauth?client_id='+config.client_id+'&scope='+ scopes.join('+') +'&redirect_uri='+config.redirect_uri)
});



app.get('/authorize', function (req, res) {
  console.log(res);
  query = "client_id=" + config.client_id + "&redirect_uri=" + config.redirect_uri + "&client_secret=" + config.client_secret + "&code=" + req.query.code
  rest.get("https://graph.facebook.com/v2.3/oauth/access_token?" + query, function(data, response){
    data = JSON.parse(data.toString())
    req.session.access_token = data.access_token
    res.redirect('/index')
  })
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});