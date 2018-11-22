function Renderer(ctx) {
    this.ctx = ctx;
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
Renderer.prototype.drawBorders = function (game) {
    var matrix = game.matrix
    var squareSize = game.calculateSquareSize()
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
    var squareSize = game.calculateSquareSize()
    var adjacentTilesForColor = function (x, y, color) {
        var tiles = []
        var adjacentTiles = matrix.adjacentTiles(x, y)
        for (var i = 0; i < adjacentTiles.length; i++) {
            var tile = adjacentTiles[i]
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
                if (game.color) {
                    // highlight tiles which you can capture
                    var power = adjacentTilesForColor(x, y, game.color).length
                    var highlightColor = Color[game.color]._a(0.1).toString()
                    if (power > 0 && tile.color == "white") {
                        this.fillRect(
                            (x * squareSize) + offset,
                            (y * squareSize) + offset,
                            squareSize - (offset * 2),
                            squareSize - (offset * 2),
                            highlightColor
                        )
                    }
                }
            }
        }
    }
}
Renderer.prototype.drawSelectSquare = function (game) {
    var x = game.select.x
    var y = game.select.y
    var matrix = game.matrix
    var squareSize = game.calculateSquareSize()
    var offset = squareSize / 3
    // this.fillRect(
    //     (x * squareSize) + offset,
    //     (y * squareSize) + offset,
    //     squareSize - (offset * 2),
    //     squareSize - (offset * 2),
    //     // game.color
    //     "white"
    // )
    this.fillRect(
        (x * squareSize) + offset,
        (y * squareSize) + offset,
        squareSize - (offset * 2),
        squareSize - (offset * 2),
        "rgba(0,0,0,0.2)"
    )
}
// fill the canvas with white
Renderer.prototype.clear = function (game) {
    this.fillRect(0, 0, game.canvasSize, game.canvasSize, "white")
}
// draw everything
Renderer.prototype.draw = function (game) {
    this.clear(game)
    this.drawTiles(game)
    this.drawBorders(game)
    if (game.select) {
        this.drawSelectSquare(game)
    }
}