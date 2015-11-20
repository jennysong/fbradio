var PostSpeaker = function() {
  this.messages = []
  this.voice_tone = "UK English Male";
  this.action_time = 5000
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
  if(!message) return;

  var listener = new VoiceListener(message.id);

  console.log('## app speaks: ' + this.humanize_message(message));
  responsiveVoice.speak(this.humanize_message(message), this.voice_tone, {
    onstart: function() {
      try { volume_down(); } catch(e) { }
      _this.playing = true
      _this.remove(index);
      listener.start();
    },
    onend: function() {
      try { volume_up(); } catch(e) { }
      setTimeout(function() {
        listener.stop()
        _this.playing = false
        callback()
      }, _this.action_time)
    }
  })
}

PostSpeaker.prototype.humanize_message = function(message) {
  if (message.picture&&message.tags.length){
    message.tags.length = 6;
    return message.text + ". posted by " + message.name  + " " + moment(message.posted_at).fromNow() + ". shared a photo with these tags. " + message.tags.join(', ') ;
  }
  else {
    return message.text + ". posted by " + message.name  + " " + moment(message.posted_at).fromNow() + "."
  }
  // "Hi Jenny. posted by Shawn Jung a second ago."
}

PostSpeaker.prototype.remove = function(index) {
  this.messages.splice(index, 1)
}