var VoiceListener = function(id) {
  this.message_id = id
}

VoiceListener.prototype.start = function() {
  var _this = this;
  annyang.addCommands({
      'like': function() {_this.like_post();},      
      'comment': function() {_this.comment_post();}
  })
  annyang.start()
}

VoiceListener.prototype.stop = function() {
  annyang.removeCommands()
  annyang.abort()
}

VoiceListener.prototype.like_post = function() {
  socket.emit('like_post', this.message_id)
}
VoiceListener.prototype.comment_post = function() {
  socket.emit('comment_post', this.message_id)
}