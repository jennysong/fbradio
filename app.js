var env = process.env.NODE_ENV || "development";

var express = require('express');
var session = require('express-session')
var file_store = require('session-file-store')(session)
var moment = require('moment');
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

/*
app.get('/music', function (req,res){
  res.render('music')
})
*/

app.get('/login', function (req, res) {
  scopes = ['public_profile', 'user_posts'] 
  res.redirect('https://www.facebook.com/dialog/oauth?client_id='+config.client_id+'&scope='+ scopes.join('+') +'&redirect_uri='+config.redirect_uri)
});


app.get('/authorize', function (req, res) {
  query = "client_id=" + config.client_id + "&redirect_uri=" + config.redirect_uri + "&client_secret=" + config.client_secret + "&code=" + req.query.code
  rest.get("https://graph.facebook.com/v2.3/oauth/access_token?" + query, function(data, response){
    data = JSON.parse(data.toString())
    req.session.access_token = data.access_token  //req.session.access_token
    res.redirect('fbresult')  //res.redirect('radio')
  })
});

var request_data = function(req){
  var messages_array = []
  var last_request_time
  rest.get("https://graph.facebook.com/me/feed?fields=from,message,story,created_time&access_token="+req.session.access_token, function(data, response){
    postData = JSON.parse(data.toString());
    feedData = postData.data;
    count = feedData.length;
    for (i=count-1; i>=0; i--){
      if (feedData[i].created_time > latest_request_time && feedData[i].from.name != req.session.userName){  //>=
        message = [feedData[i].from.name, feedData[i].created_time, feedData[i].story, feedData[i].message]
        messages_array.push(message);
        last_request_time = feedData[i].created_time
      }
    }
    latest_request_time = last_request_time || latest_request_time;
    console.log(messages_array); // send the messages_array out 
  });
}


app.get('/fbresult', function (req, res) {
  latest_request_time = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZZ"); //latest_request_time
  rest.get("https://graph.facebook.com/me?access_token="+req.session.access_token, function(data, response){
    userData = JSON.parse(data.toString())
    req.session.userName = userData.name;   //req.session.userName
    req.session.userId = userData.id;       //req.session.userId
  });
  request_data(req);
  var every5sec = setInterval(function() { request_data(req) }, 5000);
  res.render('music');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
// var voicelist = responsivevoice.getVoice();
