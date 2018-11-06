function Color (r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a || 1.0
}
Color.prototype.toString = function () {
    return (
        "rgba("
        + this.r + ","
        + this.g + ","
        + this.b + ","
        + this.a
        + ")"
    )
}
Color.prototype._r = function(r) {
    this.r = r;
    return this
}
Color.prototype._g = function(g) {
    this.g = g;
    return this
}
Color.prototype._b = function(b) {
    this.b = b;
    return this
}
Color.prototype._a = function(a) {
    this.a = a;
    return this
}
Color.fromHex = function(hex) {
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
Color.red = new Color(255, 0, 0)
Color.green = new Color(0, 255, 0)
Color.blue = new Color(0, 0, 255)