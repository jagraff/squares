function Game(canvas, socket, borderSize) {
    // static, never changes
    this.canvas = canvas
    this.renderer = new Renderer(this.canvas.getContext("2d"))
    this.borderSize = borderSize
    this.socket = socket
    // updated at run-time as neccesary
    this.canvasSize = this.calculateCanvasSize()
    // obtained from server
    this.teams = []
    this.teamToRGB = {}
    this.select = null
    this.size = null
    this.ready = false
}
Game.prototype.updateCanvasSize = function () {
    this.canvasSize = this.calculateCanvasSize()
    GameDom.updateCanvasSize(this.canvasSize)
}
Game.prototype.calculateSquareSize = function () {
    return this.canvasSize / this.size
}
Game.prototype.calculateCanvasSize = function () {
    var maxWidth = (
        $(window).width() -
        (this.borderSize * 2) // subtract a margin for the edge
    )
    var maxHeight = (
        $(window).height() -
        (this.borderSize * 2) // subtract the margin to the edge
        -
        (this.borderSize) // also subtract for the top-bar
    )
    var size = Math.min(maxWidth, maxHeight)
    return size
}
Game.prototype.redraw = function () {
    this.renderer.draw(this)
}
Game.prototype.updateTeams = function (teams) {
    for (var i = 0; i < teams.length; i++) {
        const t = teams[i]
        this.teams[t.id] = Team.fromJson(t)
    }
}
Game.prototype.updateTeamId = function (teamId) {
    this.teamId = teamId
    var team = this.teams[teamId]
    GameDom.updateTeam(team)
}
Game.prototype.updateWinnerId = function (teamId) {
    var team = this.teams[teamId]
    GameDom.updateWinner(team)
}
Game.prototype.updateTiles = function (tiles) {
    this.matrix.setTiles(tiles)
}
Game.prototype.updateSelect = function (select) {
    this.select = select
}
Game.prototype.adjacentTilesForTeamId = function (x, y, teamId) {
    var tiles = []
    var adjacentTiles = this.matrix.adjacentTiles(x, y)
    for (var i = 0; i < adjacentTiles.length; i++) {
        var tile = adjacentTiles[i]
        if (tile.teamId == teamId) {
            tiles.push(tile)
        }
    }
    return tiles
}
Game.prototype.updateConfig = function (config) {
    this.size = config.size

    this.matrix = new Matrix(this.size, function (x, y) {
        return new Tile(x, y, null, 1);
    })
    this.updateTeams(config.teams)
    this.updateTeamId(config.teamId)
    this.updateTiles(config.tiles)

    // update the size if neccesary
    this.updateCanvasSize()
    this.ready = true
}
Game.prototype.init = function () {
    var self = this
    var g_mouseLocation = {}
    var g_lastSendMouseLocation = {}
    var pointEquals = function (p1, p2) {
        return (p1.x == p2.x) &&
            (p1.y == p2.y)
    }
    // calculate the location of the mouse with respect to the grid
    var calculateLocationFromEvent = function (event) {
        var x = (
            event.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft -
            canvas.offsetLeft
        )
        var y = (
            event.clientY +
            document.body.scrollTop +
            document.documentElement.scrollTop -
            canvas.offsetTop
        )
        var squareSize = self.calculateSquareSize()
        var cx = Math.ceil(x / squareSize) - 1
        var cy = Math.ceil(y / squareSize) - 1
        return {
            x: cx,
            y: cy
        }
    }
    var handleMouseEvent = function (event) {
        g_mouseLocation = calculateLocationFromEvent(event)
        // tell the server the current mouse position if the user clicks
        self.socket.emit('click', g_mouseLocation)
    }
    // Keep track of where the mouse is, but don't neccesary send every update to the server
    this.canvas.addEventListener('mousemove', function () {
        g_mouseLocation = calculateLocationFromEvent(event)
    });
    // Tell the server if the canvas is clicked.
    this.canvas.addEventListener('click', handleMouseEvent)
    // Tell the server the current mouse position - every 10th of a second
    setInterval(function () {
        // only send the new mouse location IF the mouse has moved.
        if (!pointEquals(g_mouseLocation, g_lastSendMouseLocation)) {
            self.socket.emit('click', g_mouseLocation)
        }
        g_lastSendMouseLocation = g_mouseLocation
    }, 250)
    // Handle window resizing.
    $(window).resize(function () {
        self.updateCanvasSize();
        self.redraw();
    });
    // Handle socket events.
    this.socket.on("tiles", function (tiles) {
        console.debug("update.tiles", tiles)
        self.updateTiles(tiles)
        self.redraw();
    })
    this.socket.on("config", function (config) {
        console.debug("update.config", config)
        self.updateConfig(config)
        self.redraw();
    })
    this.socket.on("assign", function (teamId) {
        console.debug("update.assign", teamId)
        self.updateTeamId(teamId)
    })
    this.socket.on("winner", function (winner) {
        console.debug("update.winner", winner)
        self.updateWinnerId(winner)
    })
    this.socket.on("pending", function (select) {
        console.debug("update.pending", select)
        self.updateSelect(select)
        self.redraw();
    })
    // Tell the server we're ready to join.
    this.socket.emit("join")
}