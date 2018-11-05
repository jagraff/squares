class Player {
    constructor(socket, color) {
        this.socket = socket
        this.color = color
        this.pendingMove = null
    }
    toString() {
        return `Player(${this.color}, ${this.socket.id})`
    }
}
module.exports = Player