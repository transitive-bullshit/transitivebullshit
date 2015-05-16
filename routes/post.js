var Post = require('../models/post')
var restify = require('express-restify-mongoose')

module.exports = function (app) {
  restify.serve(app, Post, {
    strict: true,
    fullErrors: app.get('prod'),
    lowercase: true
  })
}
