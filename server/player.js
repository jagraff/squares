class Player {
    constructor(socket, teamId) {
        this.socket = socket
        this.teamId = teamId
        this.pendingMove = null
    }
    toString() {
        return `Player(${this.color}, ${this.socket.id})`
    }
}
module.exports = Player