class Color {
    constructor (r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
    toString () {
        return `Color(${this.r}, ${this.g}, ${this.b})`
    }
    toJson() {
        return {
            r: this.r,
            g: this.g,
            b: this.b
        }
    }
    equals (other) {
        return (
            this.r === other.r
            && this.g === other.g
            && this.b === other.b
        )
    }
}
Color.RED = new Color(255, 0, 0)
Color.GREEN = new Color(255, 0, 0)
Color.BLUE = new Color(255, 0, 0)
Color.PURPLE = new Color(128, 20, 128)
module.exports = Color