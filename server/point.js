class Point {
    /*
     * A pairing of (x, y) coordinates.
     * Useful for representing a mouse click, or a position on the game board.
     */
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    /*
     * Returns 'true' if this point is within bounds (0 to size)
     */
    withinBounds(size) {
        return (
            this.x >= 0 &&
            this.y >= 0 &&
            this.x < size &&
            this.y < size
        )
    }
    /*
     * Comparing two points with '==' or '===' will always result in false, because they're 2 seperate objects.
     * Use p1.equals(p2) to check if two points are numerically equivalent.
     */
    equals(other) {
        return (this.x == other.x && this.y == other.y)
    }
    toString() {
        return `Point(${this.x}, ${this.y})`
    }
    /*
     * Useful for sorting the players by their pending moves
     * otherwise the Point would not hash to the same object property
     */
    hashable() {
        return [this.x, this.y].toString()
    }
    /**
     * Returns a Point if the message contains valid (x,y) values.
     * Returns `null` if the message is invalid.
     * @param {*} message - an event (object) received from socketio
     */
    static maybeCreatePointFromMessage(message) {
        const isNumeric = (n) =>  (typeof n == "number" && !isNaN(n))
        if (isNumeric(message.x) && isNumeric(message.y)) {
            return new Point(message.x, message.y)
        }
        return null
    }
}
module.exports = Point