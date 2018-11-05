function Renderer(canvas, canvasSize) {
    this.canvasSize = canvasSize
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    // make sure the canvas has the correct dimensions
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;
    this.canvas.style.width = this.canvasSize + "px"
    this.canvas.style.height = this.canvasSize + "px"
}
// fills in a rectangle
Renderer.prototype.fillRect = function (x, y, width, height, color) {
    this.ctx.beginPath()
    this.ctx.lineWidth = "6"
    this.ctx.rect(x, y, width, height)
    this.ctx.fillStyle = color
    this.ctx.fill()
}
// outlines a rectangle
Renderer.prototype.strokeRect = function (x, y, width, height, color, lineWidth) {
    this.ctx.beginPath()
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeStyle = color
    this.ctx.rect(x, y, width, height)
    this.ctx.stroke()
}
// draw the borders for the entire matrix
Renderer.prototype.drawBorders = function (matrix) {
    var squareSize = this.canvasSize / matrix.size
    for (var x = 0; x < matrix.size; x++) {
        for (var y = 0; y < matrix.size; y++) {
            this.strokeRect(
                (x * squareSize),
                (y * squareSize),
                squareSize,
                squareSize,
                "rgba(0,0,0,0.4)",
                "2"
            )
        }
    }
}
// draw each individual tile color
Renderer.prototype.drawTiles = function (matrix) {
    var squareSize = this.canvasSize / matrix.size
    for (var x = 0; x < matrix.size; x++) {
        for (var y = 0; y < matrix.size; y++) {
            var tile = matrix.tiles[x][y]
            if (tile.color) {
                var offset = 0
                this.fillRect(
                    (x * squareSize) + offset,
                    (y * squareSize) + offset,
                    squareSize - (offset * 2),
                    squareSize - (offset * 2),
                    tile.color
                )
                if (tile.strength == 2) {
                    this.fillRect(
                        (x * squareSize) + offset,
                        (y * squareSize) + offset,
                        squareSize - (offset * 2),
                        squareSize - (offset * 2),
                        "rgba(0,0,0,0.2)"
                    )
                }
            }
        }
    }
}
Renderer.prototype.drawSelectSquare = function (matrix, x, y) {
    var offset = 32
    var squareSize = this.canvasSize / matrix.size
    this.strokeRect(
      (x * squareSize) + offset,
      (y * squareSize) + offset,
      squareSize - (offset * 2),
      squareSize - (offset * 2),
      "black",
      "2"
    )
  }
// fill the canvas with white
Renderer.prototype.clear = function () {
    this.fillRect(0, 0, this.canvasSize, this.canvasSize, "white")
}
// draw everything
Renderer.prototype.draw = function (game) {
    this.clear()
    this.drawTiles(game.matrix)
    this.drawBorders(game.matrix)
    if (game.select) {
        this.drawSelectSquare(game.matrix, game.select.x, game.select.y)
    }
}