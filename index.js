// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

// create a 1D array of nulls
const empty = (size) => Array(size).fill(null)
// create a 2D array of nulls
const empty2 = (size) => empty(size).map((_, i) => empty(size))
const isNumeric = (n) =>  (typeof n == "number" && !isNaN(n))
function groupBy (list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
      const key = keyGetter(item)
      const collection = map.get(key)
      if (!collection) {
          map.set(key, [item])
      } else {
          collection.push(item)
      }
  })
  return map
}

class Tile {
  constructor (color, strength) {
    this.color = color
    this.strength = strength
  }
}

class Color {
  constructor (name, r, g, b) {
    this.name = name
    this.r = r
    this.g = g
    this.b = b
  }

  serialize () {
    return `rgb(${this.r}, ${this.g}, ${this.b})`
  }

  rgb() {
    return {
      r: this.r,
      g: this.g,
      b: this.b
    }
  }
}

const RED = new Color("red", 255, 0, 0)
const GREEN = new Color("green", 0, 255, 0)
const BLUE = new Color("blue", 0, 0, 255)
const EMPTY = new Color("empty", 255, 255, 255)
const COLOR_TABLE = {
  "red": RED,
  "green": GREEN,
  "blue": BLUE,
  "empty": EMPTY,
}

class Player {
  constructor (socket, color) {
    this.socket = socket
    this.color = color
    this.tileCount = 0
    this.pendingMove = null
  }

  handleClick (message) {
    if (isNumeric(message.x) && isNumeric(message.y)) {
      this.pendingMove = new Point(message.x, message.y)
      this.socket.emit("pending", message)
      console.log(`player set pending move: ${this.color} - ${this.pendingMove.x}, ${this.pendingMove.y}`)
    } else {
      console.log(`invalid pending move: socket=${socket.id} message=${message}`)
    }
  }

}

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
  
  equals (other) {
    return (this.x == other.x && this.y == other.y)
  }

  // used for sorting the players by their pending moves
  // otherwise the Point would not hash to the same object property
  hashable () {
    return [this.x, this.y].toString()
  }
}

class Game {

  constructor (size) {
    this.size = size
    this.tiles = empty(size).map(() => empty(size).map(() => new Tile(EMPTY, 1)))
    this.tiles[0][0] = new Tile(RED, 1)
    this.tiles[size-1][size-1] = new Tile(GREEN, 1)
    this.tiles[0][size-1] = new Tile(BLUE, 1)
    this.players = {}
    this.updates = []
    this.possibleColors = [
      RED,
      GREEN,
      BLUE
    ]
    this.possibleColorNames = [
      "red",
      "green",
      "blue"
    ]
    this.minPlayers = 1
    this.running = false
    this.updateCounter = 0
  }

  playerList() {
    return Object.keys(this.players).map((key) => this.players[key])
  }

  usedColors () {
    return this.playerList().map(player => player.color.name)
  }

  nextColor () {
    var usedColors = this.usedColors()
    var freeColors = []
    this.possibleColors.forEach(function (possibleColor) {
      if (usedColors.indexOf(possibleColor.name) === -1) {
        freeColors.push(possibleColor)
      }
    })
    return freeColors[0]
  }

  countEmptyTiles () {
    return this.countColors()[EMPTY.name] || 0
  }

  adjacentTiles (x, y) {
    var ntiles = []
    if (x > 0) {
      ntiles.push(this.tiles[x-1][y])
    }
    if (x < (game.size-1)) {
      ntiles.push(this.tiles[x+1][y])
    }
    if (y > 0) {
      ntiles.push(this.tiles[x][y-1])
    }
    if (y < (game.size-1)) {
      ntiles.push(this.tiles[x][y+1])
    }
    return ntiles
  }

  neighborTiles (x, y) {
    var ntiles = []
    // left
    if (x > 0) {
      ntiles.push(this.tiles[x-1][y])
    }
    // right
    if (x < (game.size-1)) {
      ntiles.push(this.tiles[x+1][y])
    }
    // up
    if (y > 0) {
      ntiles.push(this.tiles[x][y-1])
    }
    // down
    if (y < (game.size-1)) {
      ntiles.push(this.tiles[x][y+1])
    }
    // left-up
    if (x > 0 && y > 0) {
      ntiles.push(this.tiles[x-1][y-1])
    }
    // right-up
    if ((x < (game.size-1)) && (y > 0)) {
      ntiles.push(this.tiles[x+1][y-1])
    }
    // left-down
    if ((x > 0) && (y < (game.size-1))) {
      ntiles.push(this.tiles[x-1][y+1])
    }
    // right-down
    if ((x < (game.size-1)) && (y < (game.size-1))) {
      ntiles.push(this.tiles[x+1][y+1])
    }
    return ntiles
  }

  calculateScore (x, y, color) {
    var score = this.adjacentTiles(x, y).filter(neighbor => neighbor.color === color).length
    return score
  }

  // calculatePower (x, y, color) {
  //   var score = this.neighborTiles(x, y).filter(neighbor => neighbor.color === color).length
  //   return score
  // }

  celebrate (winningColor) {
    var updates = []
    for (var x=0; x < this.size; x++) {
      for (var y=0; y < this.size; y++) {
        var {r, g, b} = winningColor.rgb()
        var flagSquare = Math.floor(this.size / 2.5)
        if (x < flagSquare && y < flagSquare) {
          r *= 0.2
          g *= 0.2
          b *= 0.2
          if ((x+y)%2 == 0) {
            r *= 0.4
            g *= 0.4
            b *= 0.4
          }
        } else if (y % 2 == 0) {
          r *= 0.9
          g *= 0.9
          b *= 0.9
        } else {
          r *= 0.5
          g *= 0.5
          b *= 0.5
        }
        var color = `rgb(${r}, ${g}, ${b})`
        updates.push({
          x: x,
          y: y,
          color: color
        })
      }
    }
    return updates;
  }

  join (socket) {
    if (this.players[socket.id]) {
      // you're already in the game, go away
      return
    }
    var nextColor = this.nextColor()
    if (nextColor) {
      const color = nextColor
      const player = new Player(socket, color)
      this.players[socket.id] = player
      socket.emit("assign", color.name)
      console.log(`player joined the game: socket=${socket.id} color=${player.color.name}`)
      if (this.playerList().length >= this.minPlayers) {
        this.running = true
        socket.emit("start")
        console.log("game has started")
      }
      const updates = this.allUpdates();
      if (updates.length > 0) {
        socket.emit("updates", updates)
      }
    } else {
      console.log(`player attempted to join full game: socket=${socket.id}`)
    }
  }

  allUpdates() {
    var updates = []
    const self = this
    this.tiles.forEach(function (row, x) {
      row.forEach(function (tile, y) {
        if (tile.color.name !== EMPTY.name) {
          updates.push({
            x: x,
            y: y,
            color: tile.color.name,
            strength: tile.strength
          });
        }
      })
    })
    return updates
  }

  leave (socket) {
    const player = this.players[socket.id]
    if (player) {
      console.log(`player left the game: socket=${socket.id} color=${player.color.name}`)
      delete this.players[socket.id]
    }
  }

  withinBounds (point) {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x < this.size &&
      point.y < this.size
    )
  }

  countColors () {
    var colorCount = {}
    // count up the number of tiles for each color
    this.tiles.forEach(function (row) {
      row.forEach(function (tile) {
        if (colorCount[tile.color.name]) {
          colorCount[tile.color.name] += 1
        } else {
          colorCount[tile.color.name] = 1
        }
      })
    })
    return colorCount;
  }

  winningColor () {
    var colorCount = this.countColors()
    // find the color with the highest count
    var winningColor = null
    var winningColorCount = 0
    Object.keys(colorCount).forEach(function (color) {
      if (colorCount[color] > winningColorCount) {
        winningColor = color
        winningColorCount = colorCount[color]
      }
    })
    return COLOR_TABLE[winningColor]
  }

  decideWinner () {
    const winningColor = this.winningColor()
    io.emit('winner', winningColor.name)
    io.emit("updates", this.celebrate(winningColor))
    return winner
  }

  captureTile (winner, strength) {
    this.tiles[winner.pendingMove.x][winner.pendingMove.y] = new Tile(winner.color, strength)
    this.updates.push({x: winner.pendingMove.x, y: winner.pendingMove.y, color: winner.color.name, strength: strength})
    winner.socket.emit("pending", {})
    console.log(`player ${winner.color.name} captured tile ${winner.pendingMove.x} ${winner.pendingMove.y}`)
  }

  flushUpdates () {
    if (this.updates.length > 0) {
      io.emit("updates", this.updates)
      this.updates = []
    }
  }

  update () {

    if (!this.running) {
      return
    }

    const players = this.playerList()
    
    // discard illegal moves
    const legalMoves = players
      .filter(player => (
        player.pendingMove
      ))
      .filter(player =>
        this.calculateScore(
          player.pendingMove.x,
          player.pendingMove.y,
          player.color
        ) > 0
      )

    // groups players by the tiles they propose to capture.
    const moves = groupBy(
      legalMoves,
      player => player.pendingMove && player.pendingMove.hashable()
    )

    // decide which player wins each tile
    moves.forEach((possibleWinners) => {
      // randomly choose one of the players from the list
      const randomSelection = Math.floor(Math.random() * possibleWinners.length)
      const winner = possibleWinners[randomSelection]
      if (winner.pendingMove && winner.color) {
        const original = this.tiles[winner.pendingMove.x][winner.pendingMove.y]
        const power = this.calculateScore(winner.pendingMove.x, winner.pendingMove.y, winner.color)
        if (original.color != winner.color) {
          // If you capture an enemy tile, your power (number of adjescent tiles)
          // must be greater than the strength (so an upgraded tile must be surrounded on 3 sides to be captured)
          if ((original.strength == 2 && power > 1) || (original.strength <= 1)) {
            this.captureTile(winner, 1)
          } else {
            /* not strong enough to capture this tile */
          }
        } else {
          if (original.strength == 1 && power > 3) {
            // If the original color was your color, you get an upgrade to strength 2 on your 2nd click
            this.captureTile(winner, 2)
          }
        }
        
      }
    })

    // clear out pending moves
    players.forEach(function (player) {
      player.pendingMove = null
      player.socket.emit("pending", {})
    })

    this.updateCounter += 1

    // tell all the clients if anything changed
    this.flushUpdates()
    this.checkForWinner()
  }

  checkForWinner () {
    const colors = Object.keys(this.countColors()).filter(color => color !== EMPTY.name)
    if (colors.length == 1) {
      const winner = COLOR_TABLE[colors[0]]
      io.emit('winner', winner.name)
      io.emit("updates", this.celebrate(winner))
      this.running = false
    }
  }

  handleClick (socket, message) {
    if (this.running) {
      const player = this.players[socket.id]
      if (player) {
        if (this.withinBounds(message)) {
          player.handleClick(message)
        } else {
          console.log(`out of bounds click: socket=${socket.id} color=${player.color} message=${message.x} ${message.y}`)
        }
      } else {
        console.log(`unknown player attempted to click socket=${socket.id}`)
      }
    }
  }

}

app.use(express.static(path.join(__dirname, 'public')))

var SIZE = 5
var game = new Game(SIZE)

setInterval(function() {
  game.update()
}, 250)

io.on('connection', (socket) => {
  socket.on('join', () => {
    socket.emit("init", {size: SIZE})
    game.join(socket)
  })
  socket.on('click', (message) => {
    game.handleClick(socket, message)
  })
  socket.on('disconnect', () => {
    game.leave(socket)
  })
})
