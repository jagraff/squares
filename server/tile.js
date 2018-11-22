class Tile {
    /**
     * @param {number} teamId
     *     represents which player the tile belongs to;
     *     a null teamId represents an unowned tile.
     * 
     * @param {number} strength  
     *     At the moment, 'strength' is either `1` or `2`, the first time you capture a tile
     *     the strength will be 1. You may "upgrade" it's strength to `2` if you own 4 adjacent tiles.
     * 
     *     The advantage of having strength==2, means the enemy must have 2 adjacent tiles to capture your tile.
     *     The disadvantge is it costs you 1 turn.
     */
    constructor(teamId, strength) {
        if (typeof teamId === "undefined") {
            throw new Error("undefined teamId")
        }
        this.teamId = teamId
        this.strength = strength || 1
        // tile will not receive an x or y until it is "set" into a matrix
        this.x = null
        this.y = null
    }
    toJson() {
        if (this.x === null || this.y === null) {
            throw new Error("Attempted to serialize a tile which has not been set!")
        }
        return {
            x: this.x,
            y: this.y,
            teamId: this.teamId,
            strength: this.strength
        }
    }
}
module.exports = Tile