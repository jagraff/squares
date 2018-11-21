/**
 * Functions for manipulating the DOM. (excluding the canvas)
 */
var GameDom = {
    /**
     * Display current players team.
     * @param {string} team.color
     * @param {string} team.name
     */
    updateTeam: function (team) {
        var element = document.getElementById("team")
        if (element) {
            if (team) {
                element.textContent = team.name
                element.style.color = team.color
            } else {
                element.textContent = "unassigned"
                element.style.color = "black"
            }
        } else {
            throw new Error("Couldn't find team element.")
        }
    },
    /**
     * Display the winner.
     * @param {string} team.color
     * @param {string} team.name
     */
    updateWinner: function (team) {
        var element = document.getElementById("winner")
        if (element) {
            if (team) {
                element.textContent = team.name.toUpperCase() + " WINS!"
                element.style.color = team.color
            } else {
                element.textContent = ""
            }
        } else {
            throw new Error("Couldn't find winner element.")
        }
    },
    /**
     * Update the canvas size.
     * @param {number} size
     */
    updateCanvasSize = function(size) {
        var canvas = document.getElementById('canvas')
        if (element) {
            canvas.width = size;
            canvas.height = size;
            canvas.style.width = size + "px"
            canvas.style.height = size + "px"
        } else {
            throw new Error("Couldn't find canvas element.")
        }
    }
}