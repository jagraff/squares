const Config = require('./config.js')
const Game = require('./game.js')

class GameList {
    constructor (io) {
        this.io = io
        this.namespace = io.of("/menu")
        this.namespace.on("connection", (socket) => {
            // When the client is ready, send them the server list.
            socket.on("menu.ready", () => {
                this.games
                    .map(this.gameToJson)
                    .forEach((json) => {
                        socket.emit("game.add", json)
                    })
            })
            socket.on("menu.add", (game) => {
                this.createGame(socket, game)
            })
            socket.on("menu.join", (gameId) => {
                this.joinGame(socket, gameId)
            })
        })
        this.games = []
    }
    tick () {
        // update each game
        this.games.forEach((game) => {
            game.tick()
        })
    }
    gameIdToNamespaceId (gameId) {
        const namespaceId = "/game-" + gameId
        return namespaceId
    }
    gameToJson (g) {
        const id = g.id
        const name = g.name
        const players = (
            g.players.length
            + " / " 
            + g.teams.length
        )
        const size = (
            g.size
            + "x"
            + g.size
        )
        const status = "join"
        const game = {id,name,players,size,status}
        return game
    }
    // TODO: send errors to the client
    joinGame (socket, gameId) {
        const game = this.games[gameId]
        // Make sure this game actually exists.
        if (!game) {
            throw new Error(`[!] ${socket.id} attempted to join non-existent game ${gameId}`)
        }
        // Make sure there are enough players
        if (!game.isAvailable()) {
            throw new Error(`[!] ${socket.id} attempted to join a full game ${gameId}`)
        }
        // Ok, looks like we're good to join this game.
        // Instruct the client to join the game's namespace
        socket.emit("game.join", game.namespaceId)
        console.log(`[*] ${socket.id} is joining ${game.toString()}`)
    }
    createGame (socket, options) {
        const gameId = this.games.length.toString()
        const namespaceId = this.gameIdToNamespaceId(gameId)
        const namespace = this.io.of(namespaceId)
        // console.log(this.games.length)
        const game = new Game(gameId, namespace, namespaceId, options.size)
        const message = this.gameToJson(game)
        // add this game to the list of all games
        this.games[game.id] = game
        console.log(`[*] new game ${game.toString()}`)
        // inform everyone in the menu of this new game
        this.namespace.emit("game.add", message)
    }
}
module.exports = GameList