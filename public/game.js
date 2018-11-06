function Game(canvas, socket, borderSize) {
    this.canvas = canvas
    this.borderSize = borderSize
    this.socket = socket
    // calculated at run-time
    this.canvasSize = null
    // obtained from server
    this.select = null
    this.color = null
    this.size = null
    this.matrix = null
    this.renderer = null
    this.ready = false
}
Game.prototype.updateSize = function() {
    this.setSize(this.calculateCanvasSize())
    this.renderer.draw(this)
}
Game.prototype.setSize = function(size) {
    this.canvasSize = size
    // make sure the canvas has the correct dimensions
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.canvas.style.width = this.canvasSize + "px"
    this.canvas.style.height = this.canvasSize + "px"
}
Game.prototype.calculateSquareSize = function() {
    return this.canvasSize / this.size
}
Game.prototype.calculateCanvasSize = function() {
    var maxWidth = (
        $(window).width() 
        - (this.borderSize * 2)  // subtract a margin for the edge
        )
      var maxHeight = (
        $(window).height()
        - (this.borderSize * 2)  // subtract the margin to the edge
        - (this.borderSize)      // also subtract for the top-bar
        )
    var size = Math.min(maxWidth, maxHeight)
    return size
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
    this.setSize(this.calculateCanvasSize())
    this.updateColor(config.color)
    this.matrix = new Matrix(this.size, function (x, y) {
        return new Tile(x, y, "white", 1)
    })
    this.renderer = new Renderer(this.canvas.getContext('2d'), this.canvasSize)
    this.matrix.setTiles(config.tiles)
    this.renderer.draw(this)
    this.ready = true
}
Game.prototype.init = function () {
    var self = this
    // Handle mouse clicks.
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
        var squareSize = self.calculateSquareSize()
        var calculateLocation = function (x, y) {
            var cx = Math.ceil(x / squareSize) - 1
            var cy = Math.ceil(y / squareSize) - 1
            return {
                x: cx,
                y: cy
            }
        }
        self.socket.emit('click', calculateLocation(x, y))
    })
    // Handle window resizing.
    $(window).resize(function() { self.updateSize(); });
    // Handle socket events.
    this.socket.on("tiles", function (tiles) { self.updateTiles(tiles) } )
    this.socket.on("config", function (config) { self.updateConfig(config) } )
    this.socket.on("assign", function (color) { self.updateColor(color) } )
    this.socket.on("winner", function (winner) { self.updateWinner(winner) } )
    this.socket.on("pending", function (select) { self.updateSelect(select) } )
    // Tell the server we're ready to join.
    this.socket.emit("join")
}