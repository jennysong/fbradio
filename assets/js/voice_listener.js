var VoiceListener = function(id) {
  this.message_id = id
}

VoiceListener.prototype.start = function() {
  var _this = this;
  annyang.addCommands({
      'like': function() {_this.like_post();},      
      'comment *message': function(message) {_this.comment_post(message);}
  })
  annyang.start();
  console.log('## voice recognizer started');
}

VoiceListener.prototype.stop = function() {
  annyang.removeCommands()
  annyang.abort()
  console.log('## voice recognizer ended');
}

VoiceListener.prototype.like_post = function() {
  socket.emit('like_post', this.message_id)
}
VoiceListener.prototype.comment_post = function(message) {
  socket.emit('comment_post', this.message_id, message)
}
