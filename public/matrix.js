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