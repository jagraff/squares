class Color {
    constructor(name, r, g, b) {
        this.name = name
        this.r = r
        this.g = g
        this.b = b
    }

    toString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    rgb() {
        return {
            r: this.r,
            g: this.g,
            b: this.b
        }
    }
}

export {
    Color
}