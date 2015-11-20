var PostSpeaker = function() {
  this.messages = []
  this.voice_tone = "UK English Male";
  this.action_time = 2000
  this.playing = false
}

PostSpeaker.prototype.add = function(data) {
  this.messages.push(data)
  if(!this.playing) this.start();
}

PostSpeaker.prototype.start = function() {
  var _this = this; // to keep this context in callbacks
  var recursive_callback;

  recursive_callback = function() {
    _this.speak(0, recursive_callback);
  }
  recursive_callback();
}

PostSpeaker.prototype.speak = function(index, callback) {
  var _this   = this; // to keep this context in callbacks
  var message = this.messages[index];
  var listener = new VoiceListener(message.id);
  if(!message) return;

  responsiveVoice.speak(this.humanize_message(message), this.voice_tone, {
    onstart: function() {
      volume_down();
      _this.playing = true
      _this.remove(index);
      listener.start()
    },
    onend: function() {
      volume_up();
      setTimeout(function() {
        listener.stop()
        _this.playing = false
        callback()
      }, _this.action_time)
    }
  })
}

PostSpeaker.prototype.humanize_message = function(message) {
  return message.text + ". posted by " + message.name  + " " + moment(message.posted_at).fromNow() + "."
  // "Hi Jenny. posted by Shawn Jung a second ago."
}

PostSpeaker.prototype.remove = function(index) {
  this.messages.splice(index, 1)
}