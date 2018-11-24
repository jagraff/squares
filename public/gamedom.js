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
            throw new Error("Couldn't find #team element.")
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
                // element.style.color = team.color
                element.style.color = "black"
            } else {
                element.textContent = ""
            }
        } else {
            throw new Error("Couldn't find #winner element.")
        }
    },
    /**
     * Update the canvas size.
     * @param {number} size
     */
    updateCanvasSize: function(size) {
        var element = document.getElementById('canvas')
        if (element) {
            element.width = size;
            element.height = size;
            element.style.width = size + "px"
            element.style.height = size + "px"
        } else {
            throw new Error("Couldn't find #canvas element.")
        }
    },
    updateTimeBarSize: function(width, height) {
        var element = document.getElementById('time-canvas')
        if (element) {
            element.width = width;
            element.height = height;
            element.style.width = width + "px"
            element.style.height = height + "px"
        } else {
            throw new Error("Couldn't find #time-canvas element.")
        }
    },
    updateTimeBar: function(normal) {
        var element = document.getElementById('time-canvas')
        if (element) {
            var context = element.getContext("2d")
            // background
            context.beginPath()
            context.rect(0, 0, element.width, element.height)
            context.fillStyle = new Color(240, 250, 250, normal).toString()
            context.fill()
            // bar
            // context.beginPath()
            // context.rect(0, 0, element.width * normal, element.height)
            // context.fillStyle = "rgba(240, 240, 240, 1.0)"
            // context.fill()
            context.beginPath()
            context.rect(0, 0, element.width * normal, element.height)
            context.fillStyle = "white"
            context.fill()
        } else {
            throw new Error("Couldn't find #time-canvas element.")
        }
    }
}