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

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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
Renderer.prototype.circle = function (x, y, radius, color) {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(x, y, radius, 0, 2*Math.PI)
    this.ctx.fill()
}
// draw each individual tile color
Renderer.prototype.drawTiles = function (game) {
    var matrix = game.matrix
    var squareSize = this.canvasSize / matrix.size
    var adjescentTilesForColor = function (x, y, color) {
        var tiles = []
        var adjecentTiles = matrix.adjacentTiles(x, y)
        for (var i = 0; i < adjecentTiles.length; i++) {
            var tile = adjecentTiles[i]
            if (tile.color == color) {
                tiles.push(tile)
            }
        }
        return tiles
    }
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
                // highlight tiles which you can capture
                var power = adjescentTilesForColor(x, y, game.color).length
                if (power > 0 && tile.color == "white") {
                    var color = hexToRgb(game.color)
                    var s = "rgba(" + color.r + "," + color.g + "," + color.b + "," + "0.2" + ")"
                    this.fillRect(
                        (x * squareSize) + offset,
                        (y * squareSize) + offset,
                        squareSize - (offset * 2),
                        squareSize - (offset * 2),
                        s
                    )
                }
            }
        }
    }
}
Renderer.prototype.drawSelectSquare = function (game) {
    var x = game.select.x
    var y = game.select.y
    var matrix = game.matrix
    var squareSize = this.canvasSize / matrix.size
    var offset = squareSize / 3
    var color = hexToRgb(game.color)
    var s = "rgba(" + color.r + "," + color.g + "," + color.b + "," + "1.0" + ")"
    // this.fillRect(
    //     (x * squareSize) + offset,
    //     (y * squareSize) + offset,
    //     squareSize - (offset * 2),
    //     squareSize - (offset * 2),
    //     s
    // )
    this.circle(
        (x * squareSize) + (squareSize / 2),
        (y * squareSize) + (squareSize / 2), 
        8,
        s
    )
    this.circle(
        (x * squareSize) + (squareSize / 2),
        (y * squareSize) + (squareSize / 2), 
        8,
        "rgba(0,0,0,0.2)"
    )
}
// fill the canvas with white
Renderer.prototype.clear = function () {
    this.fillRect(0, 0, this.canvasSize, this.canvasSize, "white")
}
// draw everything
Renderer.prototype.draw = function (game) {
    this.clear()
    this.drawTiles(game)
    this.drawBorders(game.matrix)
    if (game.select) {
        this.drawSelectSquare(game)
    }
}