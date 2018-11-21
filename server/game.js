const Player = require('./player.js')
const Matrix = require('./matrix.js')
const Tile = require('./tile.js')
const Point = require('./point.js')
const Team = require('./team.js')
const Color = require('./color.js')
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
    constructor(io, size) {
        this.io = io
        this.size = size
        // create an empty map
        this.world = new Matrix(size, (x, y) => new Tile(x, y, null, 1))
        this.teams = [
            new Team(0, "red", Color.RED),
            new Team(1, "green", Color.GREEN),
            new Team(2, "blue", Color.BLUE),
            new Team(3, "purple", Color.PURPLE)
        ]
        this.colors = [
            "red",
            "green",
            "purple",
            "blue"
        ]
        this.initTeams()
        // -- should this be seperated?
        // associate a socket.id to a player object
        this.socketToPlayer = {}
        this.running = true
        // flat list of players
        this.players = []
        // list of spectators
        this.spectators = []
        // store each time a tile is modified
        this.updates = []
    }
    /**
     * Place the starting tiles for each team
     */
    initTeams() {
        const tiles = this.world.startingTiles()
        // sanity check
        if (this.teams.length > tiles.length) {
            throw new Error(`There are more teams (${this.teams.length}) than starting tiles (${tiles.length}), can not initialize teams.`)
        }
        // create each player's starting point
        const self = this
        tiles.forEach(function (tile, index) {
            self.map.tiles[tile.x][tile.y].teamId = self.teams[index].id
        })
    }
    reset() {
        // create an empty map
        this.world = new Matrix(this.size, (x, y) => new Tile(x, y, "white", 1))
        // create each players starting point
        this.initTeams()
        // send all tiles
        this.io.emit("tiles", this.tilesToJson())
        this.io.emit("winner", false)
        this.running = true
    }
    addPlayer(player) {
        this.socketToPlayer[player.socket.id] = player
        this.players.push(player)
        // send game configuration to player
        player.socket.emit("config", {
            size: this.size,
            teams: this.teams.map(team => team.toJson()),
            tiles: this.tilesToJson()
        })
        console.log(`[*] ${player.toString()} joined the game.`)
    }
    addSpectator(socket) {

    }
    removePlayer(player) {
        delete this.socketToPlayer[player.socket.id]
        this.players = this.players.filter((p) => p !== player)
        console.log(`[*] ${player.toString()} left the game.`)
    }
    // How many tiles in total are still white?
    countEmptyTiles() {
        return this.world.all().filter((tile) => tile.teamId === null)
    }
    adjescentTilesForTeam(x, y, teamId) {
        return this.world.adjacent(x, y).filter(tile => tile.teamId === teamId)
    }
    // Serialize the whole map so we can send it through socket.io.
    tilesToJson() {
        return this.world.all().map((tile) => tile.toJson())
    }
    setTile(x, y, teamId, strength) {
        const tile = new Tile(x, y, teamId, strength)
        this.world.set(x, y, tile)
        // tell every client about the updated tile
        this.io.emit("tiles", [tile.toJson()])
        console.log(`[*] set tile ${tile.toJson()}`)
    }
    // Process 1 turn.
    update() {
        // determine which players are attempting a legal move
        const players = (
            this.players
            // discard players which don't have a pending move
            .filter(p => p.pendingMove)
            // discard illegal moves
            .filter(p => this.adjescentTilesForTeam(p.pendingMove.x, p.pendingMove.y, p.teamId).length > 0)
        )
        // group together players who are attacking the same tile
        const battles = groupBy(
            players,
            p => p.pendingMove.toString() // toString ensures 2 points will hash to the same bucket
        )
        // decide which player wins each tile
        battles.forEach((possibleWinners) => {
            // randomly choose one of the players from the list
            const randomSelection = Math.floor(Math.random() * possibleWinners.length)
            const winner = possibleWinners[randomSelection]
            const x = winner.pendingMove.x
            const y = winner.pendingMove.y
            const teamId = winner.teamId
            // tile which is being captured
            const tile = this.world.get(x, y)
            // how many tiles does this player have adjescent to the tile being capture?
            const power = this.adjescentTilesForTeam(x, y, teamId).length
            // If the original tile is white, capture is successful.
            if (tile.teamId === null) {
                this.setTile(x, y, teamId, 1)
            }
            // If we're capturing an enemy tile, your power (number of adjescent tiles)
            // must be greater than the strength (so an upgraded tile must be surrounded on 3 sides to be captured)
            else if (tile.teamId !== teamId) {
                switch (tile.strength) {
                    // If the tile strength is less than or equal to 1, capture is successful
                    case 0:
                    case 1:
                        this.setTile(x, y, teamId, 1)
                        break
                    // If tile strength is 2, you must have at least 2 adjescent tiles to capture it.
                    case 2:
                        if (power >= 2) {
                            this.setTile(x, y, teamId, 1)
                        }
                        break;
                }
            }
            // If we're capturing our own tile...
            else {
                // ... and the tile strength == 1, and we have 3 adjescent tiles, then it may be upgraded to strength == 2
                if (tile.strength == 1 && power > 3) {
                    this.setTile(x, y, teamId, 2)
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
        const allTiles = this.world.allTiles().filter(t => t.teamId !== null)
        // group together tiles of the same teamId
        const tilesByColor = groupBy(
            allTiles,
            t => t.teamId
        )
        // Is there only 1 player left on the map? That means they win.
        if (tilesByColor.length == 1) {
            // Figure out which teamId won by peeking at one of their tiles.
            const winner = tilesByColor[0][0].teamId
            // Tell the clients who won.
            this.io.emit('winner', winner)
            console.log(`[*] ${winner} won the game`)
            // Stop updating the game.
            this.running = false
            setTimeout(() => this.reset(), 1000)
        }
    }
    findTeam() {
        const unavailableTeams = this.players.map(p => p.teamId)
        const availableTeams = this.teams.filter(teamId => unavailableTeams.indexOf(teamId) === -1)
        if (availableTeams.length == 0) {
            // there is no empty team
            return null
        }
        const randomSelection = Math.floor(Math.random() * availableTeams.length)
        return availableTeams[randomSelection]
    }
    handleSocketConnect(socket) {
        const team = this.findTeam()
        if (team) {
            const player = new Player(socket, team)
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
                    const tile = this.world.get(point.x, point.y)
                    const power = this.adjescentTilesForColor(point.x, point.y, player.teamId).length
                    const canUpgrade = (tile.teamId == player.teamId && tile.strength == 1 && power > 3)
                    const canAttack = (tile.teamId != player.teamId && power > 0)
                    if (canAttack || canUpgrade) {
                        player.pendingMove = point
                        player.socket.emit("pending", message)
                        console.log(`[*] ${player.toString()} set pending move ${point.toString()}`)
                    } else {
                        console.log(`[!] ${player.toString()} clicked invalid move ${point.toString()}`)
                    }
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