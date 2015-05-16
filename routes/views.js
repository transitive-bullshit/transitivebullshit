var mobileDetect = require('mobile-detect')
var path = require('path')

module.exports = function (app) {
  var blacklist = {
    'png': true,
    'jpg': true,
    'jpeg': true,
    'js': true,
    'css': true,
    'woff': true,
    'otf': true,
    'ttf': true,
    'eot': true,
    'ico': true,
    'map': true
  }

  app.get(/^[a-zA-Z0-9_\/-]*/, function (req, res) {
    var ext = path.extname(req.path).substring(1).toLowerCase()

    if (ext in blacklist || req.path.indexOf('/api') === 0) {
      res.sendStatus(404)
    } else {
      console.log(req.path)
      var md       = new mobileDetect(req.headers['user-agent'])
      var isMobile = !!md.mobile()

      res.render('index', { isMobile: isMobile })
    }
  })
}
