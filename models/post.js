var mongoose = require('mongoose')

var PostSchema = new mongoose.Schema({
  // TODO

  created: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', PostSchema)
