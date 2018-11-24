class GameRequest {
    constructor (name) {
        this.name = name
        this.maxPlayers = maxPlayers
        this.size = size
        this.maxLength = 10
    }

    isMatch (text) {
        return /^[a-z0-9\s]$/.test(text)
    }

    validateMaxPlayers (value) {
        if (typeof text !== "number") {
            return {
                valid: false,
                reason: "input must be a number"
            }
        }
    }

    validateName (text) {
        if (typeof text !== "string") {
            return {
                valid: false,
                reason: "input must be a string"
            }
        }
        if (text.length > this.maxLength) {
            return {
                valid: false,
                reason: `input must be no longer than ${this.maxLength} characters`
            }
        }
        if (!this.isMatch(text)) {
            return {
                valid: false,
                reason: `input may only contain: A-Z, 0-9, whitespace.`
            }
        }
        return {
            valid: true
        }
    }
}