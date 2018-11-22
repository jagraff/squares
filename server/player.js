class Player {
    constructor(socket, teamId) {
        if (teamId === null || typeof teamId === "undefined") {
            throw new Error(`Attempted to create player with invalid teamId: '${teamId}'.`)
        }
        this.socket = socket
        this.teamId = teamId
        this.pendingMove = null
    }
    toString() {
        return `Player(${this.teamId}, ${this.socket.id})`
    }
}
module.exports = Player