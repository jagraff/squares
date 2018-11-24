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
Color.fromHex = function (hex) {
    // credit: https://stackoverflow.com/a/5624139
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var c = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    return new Color(c.r, c.g, c.b)
}
// EDDE76
// 4F8C8C
// FF9B71
// 5D5D5D
//
// 2176FF
//
// 2191FB blue
// Color.RED = Color.fromHex("#B3001B")
// Color.GREEN = Color.fromHex("#8EA604")
// Color.BLUE = Color.fromHex("#2176FF")
// Color.PURPLE = Color.fromHex("#770058")
//
Color.RED = Color.fromHex("#f05a65")
Color.YELLOW = Color.fromHex("#ffd75e")
Color.BLUE = Color.fromHex("#3ab2e6")
Color.PURPLE = Color.fromHex("#770058")
//
// Color.RED = new Color(255, 0, 0)
// Color.GREEN = new Color(0, 255, 0)
// Color.BLUE = new Color(0, 0, 255)
// Color.PURPLE = new Color(128, 20, 128)
module.exports = Color