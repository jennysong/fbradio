var env = process.env.NODE_ENV || "development";

global._      = require('underscore')
global.config = require(__dirname + '/config.json')[env];
global.rest   = new (require('node-rest-client').Client);

var express = require('express');
var session = require('express-session')
var file_store = require('session-file-store')(session)
var moment = require('moment');
var secureRandom = require('secure-random')
var base64        = require('base-64')
var utf8          = require('utf8')
var Client        = require('node-rest-client').Client;
var OAuth         = require('oauth');
var client        = new Client()

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clarifai   = new (require('./clarifai'))(config.clarifai)

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

 var OAuth2 = OAuth.OAuth2;    
 var twitterConsumerKey = config.twitter_key;
 var twitterConsumerSecret = config.twitter_secret;
 var oauth2 = new OAuth2(
   twitterConsumerKey,
   twitterConsumerSecret, 
   'https://api.twitter.com/', 
   null,
   'oauth2/token', 
   null);

app.get('/login2', function (req, res) {
  oauth2.getOAuthAccessToken(
   '',
   {'grant_type':'client_credentials'},
   function (e, access_token, refresh_token, results){
     console.log('bearer: ',access_token);
     /*
     oauth2.get('protected url', 
       access_token, function(e,data,res) {
         if (e) return callback(e, null);
         if (res.statusCode!=200) 
           return callback(new Error(
             'OAuth2 request failed: '+
             res.statusCode),null);
         try {
           data = JSON.parse(data);

         }
         catch (e){
           return callback(e, null);
         }
         return callback(e, data);
      });*/
   });

  /*
  //var bytes1 = utf8.encode(config.twitter_key)
  //var bytes2 = utf8.encode(config.twitter_secret)
  var encoded = base64.encode(config.twitter_key+":"+config.twitter_secret)
  //var encoded = config.twitter_key+config.twitter_secret
  //console.log(encoded);
  //console.log(utf8.decode(base64.decode(encoded)));
  encoded = "Basic " + encoded
  var args = {
    "Authorization": encoded,
    "User-Agent": "My Twitter App v1.0.23",
    "Content-Length": "29",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "grant_type": "client_credentials"
  }
  client.post("https://api.twitter.com/oauth2/token", args, function (data, response){
    console.log(response);
    //res.redirect('music')

  });*/
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

  // var messages_array = []  
  var last_request_time
  rest.get("https://graph.facebook.com/me/feed?fields=from,message,story,created_time,id,full_picture&access_token="+user.access_token, function(data, response){
    postData = JSON.parse(data.toString());
    feedData = postData.data;
    count = feedData.length;
    for (i=count-1; i>=0; i--){
      if (feedData[i].created_time > user.latest_request_time && feedData[i].from.name != user.user_name){  //>=
        var post_feed_data = feedData[i]
        var emit_message = function(message_data, tags) {
          message = {
            id: message_data.id,
            text: message_data.message,
            name: message_data.from.name,
            story: message_data.story,
            posted_at: message_data.created_time,
            picture: message_data.full_picture,
            tags: tags || []
          }
          user.socket.emit('new_messages', JSON.stringify([message]));
        }
        if(post_feed_data.full_picture) {
          clarifai.get_tags([post_feed_data.full_picture], function(tags) {
            emit_message(post_feed_data, tags);
          })
        } else {
          emit_message(post_feed_data);
        }


        // message = {
        //   id: feedData[i].id,
        //   text: feedData[i].message,
        //   name: feedData[i].from.name,
        //   story: feedData[i].story,
        //   posted_at: feedData[i].created_time,
        //   picture: feedData[i].full_picture 
        // }
        // console.log(message.picture)
        // messages_array.push(message); 
        last_request_time = feedData[i].created_time
      }
    }
    user.latest_request_time = last_request_time || user.latest_request_time;

    // our app sends the message_array to the user's socket. 

    // if(messages_array.length > 0) {
    //   user.socket.emit('new_messages', JSON.stringify(messages_array));
    // }
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
    rest.post("https://graph.facebook.com/"+message_id+"/likes?access_token="+socket.app_user.access_token, function(data, response) {});
    console.log('### I just liked the id : '+message_id);
  })

  socket.on('comment_post', function(message_id) {
    rest.post("https://graph.facebook.com/"+message_id+"/comments?message=Sounds+good,+See+you+tomorrow.&access_token="+socket.app_user.access_token, function(data, response) {});
    console.log('### I just commented on the id : '+message_id);
  })

  socket.on('disconnect', function() {
    
  })

})