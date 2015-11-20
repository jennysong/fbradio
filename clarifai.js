
var Clarifai = function(options) {
  this.api_server_url = 'https://api.clarifai.com'
  this.api_version    = 'v1'

  this.client_id     = options.client_id
  this.client_secret = options.client_secret
  this.access_token  = options.access_token
}

_(Clarifai.prototype).extend({
  default_headers: function() {
    output = {"Content-Type": "application/x-www-form-urlencoded"}
    if(this.access_token) output["Authorization"] = "Bearer " + this.access_token;
    return output
  },

  api_url: function(path) {
    return [this.api_server_url, this.api_version, path].join('/')
  },
  bind: function(callback) {
    return _(callback).bind(this)
  },
  get_access_token: function(callback) {
    var _this = this

    var args = {
      data: 'grant_type=client_credentials&client_id='+this.client_id+'&client_secret='+this.client_secret,
      headers: this.default_headers()
    }

    rest.post(this.api_url('token'), args, function (data, response) {
      if(data.access_token) {
        _this.access_token = data.access_token
        callback(_this.access_token)
      } else {
        setTimeout(function () {
          _this.get_access_token(callback)
        }, 1000)
      }

    })

  },
  check_access_token: function (callbacks) {
    var _this = this
    if(!this.access_token) return callbacks.error();

    rest.get(this.api_url('info'), {headers: this.default_headers()}, function (data, response) {
      if(data.status_code == 'OK')
        callbacks.success(_this.access_token)
      else
        callbacks.error();
    })
  },
  ensure_access_token: function (callback) {
    var _this = this

    this.check_access_token({
      success: callback,
      error: function() {
        _this.get_access_token(callback)
      }
    })

  },
  get_tags: function(urls, callback) {
    _this = this
    this.ensure_access_token(function() {
      urls = _(urls).map(function(url) { return "url="+encodeURIComponent(url) })
      var args = {
        data: urls.join('&'),
        headers: _this.default_headers()
      }

      rest.post(_this.api_url('tag'), args, function(data, response) {
        var tags = []
        data.results.forEach(function(result_data){
          result_data.result.tag.classes.forEach(function(tag) {
            tags.push(tag)
          })
        })
        callback(tags);
      })
    })
  }

})

module.exports = Clarifai