const Player = require('./player.js')
const Matrix = require('./matrix.js')
const Tile = require('./tile.js')
const Point = require('./point.js')
function groupBy(list, keyGetter) {
    const map = {}
    list.forEach((item) => {
        const key = keyGetter(item)
        const collection = map[key]
        if (!collection) {
            map[key] = [item]
        } else {
            collection.push(item)
        }
    })
    return Object.keys(map).map(key => map[key])
}
class Game {
    /*
     * 
     *
     */
    constructor(size) {
        this.size = size
        // create an empty map
        this.map = new Matrix(size, (x, y) => new Tile(x, y, "white", 1))
        this.colors = [
            "red",
            "green",
            "blue"
        ]
        // create each players starting point
        this.map.tiles[0][0] = new Tile(0, 0, "red")
        this.map.tiles[size - 1][size - 1] = new Tile(size - 1, size - 1, "green")
        this.map.tiles[0][size - 1] = new Tile(0, size - 1, "blue")
        // -- should this be seperated?
        // associate a socket.id to a player object
        this.socketToPlayer = {}
        this.running = true
        // flat list of players
        this.players = []
        // store each time a tile is modified
        this.updates = []
    }
    addPlayer(player) {
        this.socketToPlayer[player.socket.id] = player
        this.players.push(player)
        // tell the player which color they have
        // player.socket.emit("assign", player.color)
        // send every tile to the player
        // player.socket.emit("tiles", this.tilesToJson())
        // send game configuration to player
        player.socket.emit("config", {
            size: this.size,
            color: player.color,
            tiles: this.tilesToJson()
        })
        // tell the client they can start now -- TODO: remove this?
        // player.socket.emit("start")
        console.log(`${player.toString()} joined the game.`)
    }
    removePlayer(player) {
        delete this.socketToPlayer[player.socket.id]
        this.players = this.players.filter((p) => p !== player)
        console.log(`${player.toString()} left the game.`)
    }
    // How many tiles in total are still white?
    countWhiteTiles() {
        return this.map.allTiles().filter((tile) => tile.color == "white")
    }
    adjescentTilesForColor(x, y, color) {
        return this.map.adjacentTiles(x, y).filter(tile => tile.color === color).length
    }
    // Serialize the whole map so we can send it through socket.io.
    tilesToJson() {
        return this.map.allTiles().map((tile) => tile.toJson())
    }
    setTile(x, y, color, strength) {
        const tile = new Tile(x, y, color, strength)
        this.tiles[x][y] = tile
        // tell every client about the updated tile
        io.emit("tiles", [tile.toJson()])
        console.log(`setTile(${x}, ${y}, ${color}, ${strength})`)
    }
    // Process 1 turn.
    update() {
        // determine which players are attempting a legal move
        const players = (
            this.players
            // discard players which don't have a pending move
            .filter(p => p.pendingMove)
            // discard illegal moves
            .filter(p => this.adjescentTilesForColor(p.pendingMove.x, p.pendingMove.y, p.color).length > 0)
        )
        // group together players who are attacking the same tile
        const battles = groupBy(
            players,
            p => p.pendingMove.toString() // toString ensures 2 points will hash to the same bucket
        )
        console.log(`player=${this.players.length} battles=${battles.length}`)
        // decide which player wins each tile
        battles.forEach((possibleWinners) => {
            // randomly choose one of the players from the list
            const randomSelection = Math.floor(Math.random() * possibleWinners.length)
            const winner = possibleWinners[randomSelection]
            const x = winner.pendingMove.x
            const y = winner.pendingMove.y
            const color = winner.color
            // tile which is being captured
            const tile = this.tiles[x][y]
            // how many tiles does this player have adjescent to the tile being capture?
            const power = this.adjescentTilesForColor(x, y, color).length
            // If the original tile is white, capture is successful.
            if (tile.color === "white") {
                this.setTile(x, y, color, 1)
            }
            // If we're capturing an enemy tile, your power (number of adjescent tiles)
            // must be greater than the strength (so an upgraded tile must be surrounded on 3 sides to be captured)
            else if (tile.color !== color) {
                switch (tile.strength) {
                    // If the tile strength is less than or equal to 1, capture is successful
                    case 0:
                    case 1:
                        this.setTile(x, y, color, 1)
                        break
                    // If tile strength is 2, you must have at least 2 adjescent tiles to capture it.
                    case 2:
                        if (power >= 2) {
                            this.setTile(x, y, color, 1)
                        }
                        break;
                }
            }
            // If we're capturing our own tile...
            else {
                // ... and the tile strength == 1, and we have 3 adjescent tiles, then it may be upgraded to strength == 2
                if (tile.strength == 1 && power > 3) {
                    this.setTile(x, y, color, 2)
                }
            }
        })
        // remove all pending moves
        this.players.forEach(function (p) {
            p.pendingMove = null
            // tell the client that we have consumed their pending move.
            p.socket.emit("pending", {})
        })
        // Keep track of how many updates we've processed.
        this.updateCounter += 1
        // Check if someone has won the game.
        this.checkForWinner()
    }
    updateIfRunning() {
        if (this.running) {
            this.update()
        }
    }
    checkForWinner() {
        // excluding white tiles, because "white" is not a player
        const allTiles = this.map.allTiles().filter(t => t.color !== "white")
        // group together tiles of the same color
        const tilesByColor = groupBy(
            allTiles,
            t => t.color
        )
        // Is there only 1 player left on the map? That means they win.
        if (tilesByColor.length == 1) {
            // Figure out which color won by peeking at one of their tiles.
            const winner = tilesByColor[0].color
            // Tell the clients who won.
            io.emit('winner', winner)
            // Stop updating the game.
            this.running = false
        }
    }
    findAvailableColors() {
        const playerColors = this.players.map(p => p.color)
        return this.colors.filter(color => playerColors.indexOf(color) === -1)
    }
    handleSocketConnect(socket) {
        const availableColors = this.findAvailableColors()
        if (availableColors.length > 0) {
            const color = availableColors.pop()
            const player = new Player(socket, color)
            this.addPlayer(player)
        } else {
            console.log(`[!] socket(${socket.id}) attempted to join full game`)
        }
    }
    handleSocketDisconnect(socket) {
        const player = this.socketToPlayer[socket.id]
        if (player) {
            this.removePlayer(player)
        } else {
            console.log(`[*] socket(${socket.id}) unknown player disconnected`)
        }
    }
    // Handle a click event from a socket.
    handleSocketClick(socket, message) {
        const player = this.socketToPlayer[socket.id]
        if (player) {
            const point = Point.maybeCreatePointFromMessage(message)
            if (point) {
                if (point.withinBounds(this.size)) {
                    player.pendingMove = point
                    player.socket.emit("pending", message)
                    console.log(`[*] ${player.toString()} set pending move ${point.toString()}`)
                } else {
                    console.log(`[!] ${player.toString()} sent out-of-bounds click ${point.toString()}`)
                }
            } else {
                console.log(`[!] ${player.toString()} sent invalid click ${message.toString()}`)
            }
        } else {
            console.log(`[*] socket(${socket.id}) unknown player clicked`)
        }
    }
}
module.exports = Game