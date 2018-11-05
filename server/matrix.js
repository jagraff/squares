class Matrix {
    /*
     * Provides some primitive operations for dealing with
     * a 2D matrix of tiles.
     */
    constructor(size, createTileCallback) {
        this.size = size
        this.tiles = []
        for (var x = 0; x < size; x++) {
            this.tiles[x] = []
            for (var y = 0; y < size; y++) {
                this.tiles[x][y] = createTileCallback(x, y)
            }
        }
    }
    /*
     * Check each border for an adjescent tile.
     * Up, Down, Left, Right.
     *     X
     *   X X X
     *     X
     */
    checkBorders(x, y) {
        return {
            up: y > 0,
            down: y < this.size - 1,
            left: x > 0,
            right: x < this.size - 1
        }
    }
    /*
     * Iterate over the adjescent tiles for a given tile.
     *     X
     *   X X X
     *     X
     */
    adjacentTiles(x, y) {
        const tiles = []
        // Figure out which sides border the edge of the map, so we can
        // determine which sides have an adjecent tile.
        const {
            up,
            down,
            left,
            right
        } = this.checkBorders(x, y)
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
    /*
     * Iterate over diagonal tiles.
     *   X   X
     *     X
     *   X   X
     */
    diagonalTiles(x, y) {
        const tiles = []
        const {
            up,
            down,
            left,
            right
        } = this.checkBorders(x, y)
        if (left && up) {
            tiles.push(this.tiles[x - 1][y - 1])
        }
        if (right && up) {
            tiles.push(this.tiles[x + 1][y - 1])
        }
        if (left && down) {
            tiles.push(this.tiles[x - 1][y + 1])
        }
        if (right && down) {
            tiles.push(this.tiles[x + 1][y + 1])
        }
        return tiles
    }
    /*
     * Iterate over all tiles.
     *   X X X
     *   X X X
     *   X X X
     */
    allTiles() {
        const tiles = []
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                tiles.push(this.tiles[x][y])
            }
        }
        return tiles
    }
}
module.exports = Matrix