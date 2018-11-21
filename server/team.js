class Team {
    /**
     * @param {int} id - should be unique
     * @param {int} color
     * @param {string} name
     */
    constructor (id, name, color) {
        this.id = id
        this.name = name
        this.color = color
    }
    equals (other) {
        return this.id == other.id
    }
    toString () {
        return `Team(${this.id}, ${this.name}, ${this.color.toString()})`
    }
    toJson() {
        return {
            id: this.id,
            name: this.name,
            color: this.color.toJson()
        }
    }
}
module.exports = Team