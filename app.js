var env = process.env.NODE_ENV || "development";

var express = require('express');
var session = require('express-session')
var file_store = require('session-file-store')(session)

var app = express();

global.config = require(__dirname + '/config.json')[env];
global.rest   = new (require('node-rest-client').Client);


app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/assets', express.static('assets'));
app.use(session({
  store: new file_store(),
  secret: 'Uv8}4{}h&46U*RQ3',
  cookie: { maxAge: 60000 }
}))


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/music', function (req,res){
  res.render('music')
})

app.get('/login', function (req, res) {
  scopes = ['public_profile', 'user_posts'] 
  res.redirect('https://www.facebook.com/dialog/oauth?client_id='+config.client_id+'&scope='+ scopes.join('+') +'&redirect_uri='+config.redirect_uri)
});


app.get('/authorize', function (req, res) {
  query = "client_id=" + config.client_id + "&redirect_uri=" + config.redirect_uri + "&client_secret=" + config.client_secret + "&code=" + req.query.code
  rest.get("https://graph.facebook.com/v2.3/oauth/access_token?" + query, function(data, response){
    data = JSON.parse(data.toString())
    req.session.access_token = data.access_token
    console.log(req.session.access_token+" :)")
    res.send("done")  //res.redirect('radio')
  })
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
// var voicelist = responsivevoice.getVoice();
