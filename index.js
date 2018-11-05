

// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

const Game = require('./server/game.js')
var size = 6
var game = new Game(io, size)

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

app.use(express.static(path.join(__dirname, 'public')))

setInterval(function() {
  game.updateIfRunning()
}, 1000)

io.on('connection', (socket) => {
  socket.on('join', () => {
    game.handleSocketConnect(socket)
  })
  socket.on('click', (message) => {
    game.handleSocketClick(socket, message)
  })
  socket.on('disconnect', () => {
    game.handleSocketDisconnect(socket)
  })
})
