var env = process.env.NODE_ENV || "development";

var express = require('express');
var session = require('express-session')
var file_store = require('session-file-store')(session)
var moment = require('moment');
var secureRandom = require('secure-random')

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


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

var login_users = new(require('./user_pot'))

app.get('/', function (req, res) {
  res.render('index');
});

/*
app.get('/music', function (req,res){
  res.render('music')?
})
*/

app.get('/login', function (req, res) {
  scopes = ['public_profile', 'user_posts', 'publish_actions'] 
  res.redirect('https://www.facebook.com/dialog/oauth?client_id='+config.client_id+'&scope='+ scopes.join('+') +'&redirect_uri='+config.redirect_uri)
});


app.get('/authorize', function (req, res) {
  query = "client_id=" + config.client_id + "&redirect_uri=" + config.redirect_uri + "&client_secret=" + config.client_secret + "&code=" + req.query.code
  rest.get("https://graph.facebook.com/v2.3/oauth/access_token?" + query, function(data, response){
    data = JSON.parse(data.toString())
    req.session.access_token = data.access_token  //req.session.access_token
    res.redirect('music')  //res.redirect('radio')
  })
});

app.get('/music', function (req, res) {
  var randomSecurity = secureRandom.randomUint8Array(10)
  login_users.add(randomSecurity, req.session.access_token);
  res.render('music', {rand_token: randomSecurity});
});


var server = http.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
// var voicelist = responsivevoice.getVoice();



// pulling my wall

var request_data = function(user){
  // the user object has socket object now.
  // also the user object has access_token.

  var messages_array = []  
  var last_request_time
  rest.get("https://graph.facebook.com/me/feed?fields=from,message,story,created_time,id&access_token="+user.access_token, function(data, response){
    postData = JSON.parse(data.toString());
    feedData = postData.data;
    count = feedData.length;
    for (i=count-1; i>=0; i--){
      if (feedData[i].created_time > user.latest_request_time && feedData[i].from.name != user.user_name){  //>=
        message = {
          id: feedData[i].id,
          text: feedData[i].message,
          name: feedData[i].from.name,
          story: feedData[i].story,
          posted_at: feedData[i].created_time
        }
        messages_array.push(message); 
        last_request_time = feedData[i].created_time
      }
    }
    user.latest_request_time = last_request_time || user.latest_request_time;

    // our app sends the message_array to the user's socket. 

    if(messages_array.length > 0) {
      user.socket.emit('new_messages', JSON.stringify(messages_array));
    }
  });
}


// socket code

io.on('connection', function(socket){
  socket.on('register', function(random_token) {
    // when user is successfully logged in (when user is on /music)
    // we find the logged in from login users.
    // and start broadcast new posts here.

    user = login_users.find(random_token)
    if(!user) return;

    user.socket = socket
    socket.app_user = user
    user.latest_request_time = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZZ");

    rest.get("https://graph.facebook.com/me?access_token="+user.access_token, function(data, response){
      userData = JSON.parse(data.toString())
      user.user_name = userData.name;   //req.session.userName
      user.user_id   = userData.id;       //req.session.userId
      request_data(user);
      var every5sec = setInterval(function() { request_data(user) }, 5000);
    });
  })

  socket.on('like_post', function(message_id) {
    rest.post("https://graph.facebook.com/"+message_id+"/likes?access_token="+socket.app_user.access_token, function(data, response) {
      console.log(response);
    });



    //socket.app_user.access_token
    console.log('### I just liked the id : '+message_id);
  })

  socket.on('disconnect', function() {
    
  })

})