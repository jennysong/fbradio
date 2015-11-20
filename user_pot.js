var UserPot = function() {
  this.users = {}
}
UserPot.prototype.add = function(id, access_token) {
  var user = {
    id: id,
    access_token: access_token,
    socket: null
  }
  this.users[id] = user;
  return user;

}
UserPot.prototype.find = function(id) {
  return this.users[id];
}

module.exports = UserPot