function Matrix(size, createTileCallback) {
    this.size = size
    this.tiles = []
    // initialize
    for (var x = 0; x < size; x++) {
        this.tiles[x] = []
        for (var y = 0; y < size; y++) {
            this.tiles[x][y] = createTileCallback(x, y)
        }
    }
}
// take a list of tiles from socketio and stuff them into the matrix
Matrix.prototype.setTiles = function (tiles) {
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i]
        if (tile.x in this.tiles) {
            if (tile.y in this.tiles[tile.x]) {
                this.tiles[tile.x][tile.y] = tile
            }
        }
    }
}
Matrix.prototype.checkBorders = function (x, y) {
    return {
        up: y > 0,
        down: y < this.size - 1,
        left: x > 0,
        right: x < this.size - 1
    }
}
Matrix.prototype.adjacentTiles = function (x, y) {
    var tiles = []
    // Figure out which sides border the edge of the map, so we can
    // determine which sides have an adjacent tile.
    var border = this.checkBorders(x, y)
    var up = border.up
    var left = border.left
    var right = border.right
    var down = border.down
    if (left) {
        tiles.push(this.tiles[x - 1][y])
    }
    if (right) {
        tiles.push(this.tiles[x + 1][y])
    }
    if (up) {
        tiles.push(this.tiles[x][y - 1])
    }
    if (down) {
        tiles.push(this.tiles[x][y + 1])
    }
    return tiles
}