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
    // var matrix = game.matrix
    // var squareSize = game.calculateSquareSize()
    // for (var x = 0; x < matrix.size; x++) {
    //     for (var y = 0; y < matrix.size; y++) {
    //         this.strokeRect(
    //             (x * squareSize),
    //             (y * squareSize),
    //             squareSize,
    //             squareSize,
    //             "rgba(255,255,255,1.0)",
    //             "1"
    //         )
    //     }
    // }
}
Renderer.prototype.circle = function (x, y, radius, color) {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
    this.ctx.fill()
}
// draw each individual tile color
Renderer.prototype.drawTiles = function (game) {
    var matrix = game.matrix
    var squareSize = game.calculateSquareSize()
    for (var x = 0; x < matrix.size; x++) {
        for (var y = 0; y < matrix.size; y++) {
            var tile = matrix.tiles[x][y]
            var teamColor = game.teams[game.teamId].color
            // teamId null maps to tileId white
            // kinda hacky, would be nice to clean this up
            var tileColor = (
                tile.teamId !== null ?
                game.teams[tile.teamId].color :
                Color.white
            )
            if (tile.teamId !== null) {
                var offset = 0
                this.fillRect(
                    (x * squareSize) + offset,
                    (y * squareSize) + offset,
                    squareSize - (offset * 2),
                    squareSize - (offset * 2),
                    tileColor
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
            } else {
                // highlight tiles which you can capture
                var power = game.adjacentTilesForTeamId(x, y, game.teamId).length

                // var alpha = (((x * Math.PI) + (Date.now() / 1000)) % 1.0)
                var highlightColor = teamColor.withA(0.2)

                if (power > 0 && tile.teamId === null) {
                    this.fillRect(
                        (x * squareSize) + offset,
                        (y * squareSize) + offset,
                        squareSize - (offset * 2),
                        squareSize - (offset * 2),
                        highlightColor
                    )
                }
            }

            if (game.lastMouseLocation.x === x &&
                game.lastMouseLocation.y === y) {
                this.fillRect(
                    (x * squareSize),
                    (y * squareSize),
                    squareSize,
                    squareSize,
                    "rgba(255,255,255,0.1)"
                )
            }
        }
    }
}
Renderer.prototype.drawSelectSquare = function (game) {
    var x = game.select.x
    var y = game.select.y
    var squareSize = game.calculateSquareSize()
    this.fillRect(
        (x * squareSize),
        (y * squareSize),
        squareSize,
        squareSize,
        Color.black.withA(0.1)
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