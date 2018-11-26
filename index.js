

// Setup basic express server
const Config = require('./server/config.js')
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

// serve static assets, probably move this to CDN at some point
if (process.env.DEBUG === "true") {
  app.use(express.static(path.join(__dirname, 'assets')))
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(express.static(path.join(__dirname, 'static')))
} else {
  app.use(express.static(path.join(__dirname, 'assets')))
  app.use(express.static(path.join(__dirname, 'dist')))
}

server.listen(port, () => {
  console.debug('Server listening at port %d', port)
})

const GameList = require('./server/gamelist.js')
const gamelist = new GameList(io)

// update the games at our predefined interval
setInterval(function() {
  gamelist.tick()
}, Config.UPDATE_INTERVAL)