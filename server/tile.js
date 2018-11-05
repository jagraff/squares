class Tile {
    /*
     * 'color' represents which player the tile belongs to ("red", "green", etc).
     * an 'empty' tile (unowned by any player) is represented with "white".
     * 
     * At the moment, 'strength' is either `1` or `2`, the first time you capture a tile
     * the strength will be 1. You may "upgrade" it's strength to `2` if you own 4 adjescent tiles.
     * 
     * The advantage of having strength==2, means the enemy must have 2 adjescent tiles to capture your tile.
     * The disadvantge is it costs you 1 turn.
     */
    constructor(x, y, color, strength) {
        this.x = x
        this.y = y
        this.color = color
        this.strength = strength || 1
    }
    toJson() {
        return {
            x: this.x,
            y: this.y,
            color: this.color,
            strength: this.strength
        }
    }
}
module.exports = Tile