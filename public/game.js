function Game(canvas, socket, canvasSize) {
    this.canvas = canvas
    this.canvasSize = canvasSize
    this.socket = socket
    // obtained from server
    this.select = null
    this.color = null
    this.size = null
    this.squareSize = null
    this.matrix = null
    this.renderer = null
    this.ready = false
}
Game.prototype.updateColor = function (color) {
    this.color = color
    var element = document.getElementById("color")
    element.textContent = this.color
    element.style.color = this.color
}
Game.prototype.updateWinner = function (winner) {
    var element = document.getElementById("winner")
    if (winner) {
        element.textContent = winner.toUpperCase() + " WINS!"
        element.style.color = winner
    } else {
        element.textContent = ""
    }
}
Game.prototype.updateTiles = function (tiles) {
    this.matrix.setTiles(tiles)
    this.renderer.draw(this)
}
Game.prototype.updateSelect = function (select) {
    this.select = select
    this.renderer.draw(this)
}
Game.prototype.updateConfig = function (config) {
    this.size = config.size
    this.squareSize = this.canvasSize / this.size
    this.updateColor(config.color)
    this.matrix = new Matrix(this.size, function (x, y) {
        return new Tile(x, y, "white", 1)
    })
    this.renderer = new Renderer(this.canvas, this.canvasSize)
    this.matrix.setTiles(config.tiles)
    this.renderer.draw(this)
    this.ready = true
}
Game.prototype.init = function () {
    var self = this
    this.canvas.addEventListener('click', function (event) {
        var x = (
            event.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft -
            canvas.offsetLeft
        )
        var y = (
            event.clientY +
            document.body.scrollTop +
            document.documentElement.scrollTop -
            canvas.offsetTop
        )
        var calculateLocation = function (x, y) {
            var cx = Math.ceil(x / self.squareSize) - 1
            var cy = Math.ceil(y / self.squareSize) - 1
            return {
                x: cx,
                y: cy
            }
        }
        self.socket.emit('click', calculateLocation(x, y))
    })
    this.socket.on("tiles", function (tiles) { self.updateTiles(tiles) } )
    this.socket.on("config", function (config) { self.updateConfig(config) } )
    this.socket.on("assign", function (color) { self.updateColor(color) } )
    this.socket.on("winner", function (winner) { self.updateWinner(winner) } )
    this.socket.on("pending", function (select) { self.updateSelect(select) } )
    this.socket.emit("join")
}