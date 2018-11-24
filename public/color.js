function Color (r, g, b, a) {
    this.r = Color.clamp(r)
    this.g = Color.clamp(g)
    this.b = Color.clamp(b)
    this.a = a || 1.0
}
Color.clamp = function(value) {
    return Math.max(0, Math.min(value, 255))
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
Color.prototype.scale = function(normal) {
    return new Color(
        Color.clamp(this.r * normal),
        Color.clamp(this.g * normal, 255),
        Color.clamp(this.b * normal, 255),
        this.a
    )
}
Color.prototype.darker = function() {
    return this.scale(0.8)
}
Color.prototype.withR = function(r) {
    return new Color(r, this.g, this.b, this.a)
}
Color.prototype.withG = function(g) {
    return new Color(this.r, g, this.b, this.a)
}
Color.prototype.withB = function(b) {
    return new Color(this.r, this.g, b, this.a)
}
Color.prototype.withA = function(a) {
    return new Color(this.r, this.g, this.b, a)
}
Color.fromJson = function(json) {
    return new Color(json.r, json.g, json.b, json.a)
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
Color.black = new Color(0, 0, 0)
Color.red = new Color(255, 0, 0)
Color.green = new Color(0, 255, 0)
Color.blue = new Color(0, 0, 255)
Color.white = new Color(255, 255, 255)