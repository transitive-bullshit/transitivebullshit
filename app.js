#!/usr/bin/env node

require('dotenv').load()

var express      = require('express')
var errorhandler = require('errorhandler')
var exphbs       = require('express-handlebars')
var bodyParser   = require('body-parser')
var logger       = require('morgan')
var mongoose     = require('mongoose')
var compression  = require('compression')

var utils        = require('./lib/utils')
var path         = require('path')
var app          = express()

var TOKEN_SECRET = process.env.TOKEN_SECRET || 'transitivebullshit-fisch-v1.0.0'

mongoose.connect(process.env.MONGODB)

app.set('port', process.env.PORT || 5000)
app.set('prod', utils.isProd())
app.set('TOKEN_SECRET', TOKEN_SECRET)

app.use(compression())
app.use('/assets', express.static('assets'))
app.use('/build', express.static('dist/build'))

var templateConfig = {
  defaultLayout: false,
  extname: '.html',
}

if (app.get('prod')) {
  templateConfig.partialsDir = path.join(__dirname, 'dist')
} else {
  templateConfig.partialsDir = __dirname
}

app.engine('html', exphbs(templateConfig))
app.set('view engine', 'html')
app.set('views', templateConfig.partialsDir)
app.set('API_PREFIX', '/api/v1')

app.use(require('cookie-parser')())
app.use(require('express-session')({
  secret: TOKEN_SECRET,
  saveUninitialized: true,
  resave: true
}))

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

if (app.get('prod')) {
  app.use(logger())
} else {
  mongoose.set('debug', true)
  app.use(errorhandler())
  app.use(logger('dev'))
}

app.use(require('prerender-node').set('prerenderServiceUrl', process.env.PRERENDER_SERVICE_URL))

require('./routes/post')(app)
require('./routes/views')(app)

app.listen(app.get('port'), function () {
  console.log("Express listening at localhost:" + app.get('port'))
})
