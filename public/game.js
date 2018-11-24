function Game(canvas, socket) {
    // static, never changes
    this.canvas = canvas
    this.renderer = new Renderer(this.canvas.getContext("2d"))
    this.borderSize = 40
    this.socket = socket
    // updated at run-time as neccesary
    this.canvasSize = this.calculateCanvasSize()
    // obtained from server
    this.teams = []
    this.updateInterval = 1000
    this.turnStartTime = 0
    this.teamToRGB = {}
    this.select = null
    this.size = null
    this.ready = false
}
Game.prototype.updateCanvasSize = function () {
    this.canvasSize = this.calculateCanvasSize()
    GameDom.updateCanvasSize(this.canvasSize)
    // GameDom.updateTimeBarSize(this.canvasSize * 2, 20)
    // GameDom.updateTimeBar(0.5)
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
    // XXX hack to avoid weird lines when rendering squares on the canvas
    // make sure the canvas size is divisible by the game size (number of tiles)
    size -= size % this.size
    return size
}
Game.prototype.redraw = function () {
    if (this.ready) {
        this.renderer.draw(this)
    }
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
    this.updateInterval = config.updateInterval
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
            // uncomment this line to enable mouse-hover clicks
            // self.socket.emit('click', g_mouseLocation)
        }
        g_lastSendMouseLocation = g_mouseLocation
    }, 250)

    // Set an interval to redraw the time bar
    // setInterval(function () {
        // var elapsedTime = Date.now() - self.turnStartTime
        // clamp
        // elapsedTime = Math.max(0, Math.min(elapsedTime, self.updateInterval))
        // self.elapsedTime = elapsedTime
        // var normal = elapsedTime / 1000.0
        // GameDom.updateTimeBar(normal)
        // self.redraw()
    // }, 10)
    // TODO: is it better to keep an animation loop - or to redraw only when neccesary?
    // currently we don't use any smooth animation effects.
    var animate = function () {
        requestAnimationFrame(animate)
        self.redraw()
    }
    // Handle window resizing.
    $(window).resize(function () {
        self.updateCanvasSize();
        // self.redraw();
    });
    // Handle socket events.
    this.socket.on("turnEnd", function() {
        // HACK
        //
        // After every new turn, clear out the last mouse location
        // (forcing us to send a new mouse update).
        //
        // This way, if the player moves their mouse to a tile before the
        // next turn starts, we'll send an update.
        //
        // (otherwise you will sometimes move your mouse on to a tile without
        // it being selected, which is annoying)
        //
        g_lastSendMouseLocation = {}
        // Record a timestamp of when the turn started
        self.turnStartTime = Date.now()
    })
    this.socket.on("tiles", function (tiles) {
        console.debug("update.tiles", tiles)
        self.updateTiles(tiles)
        // self.redraw();
    })
    this.socket.on("config", function (config) {
        console.debug("update.config", config)
        self.updateConfig(config)
        // self.redraw();
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
        // self.redraw();
    })
    // Tell the server we're ready to join.
    this.socket.emit("join")
    requestAnimationFrame(animate)
}