var initMenu = function (io) {
    // connect to the menu namespace
    var socket = io("/menu")

    // When a "join" button is clicked
    // send a request to the server to join that game
    MenuDom.onClickJoin = function (event) {
        // button-game-GAMEID
        var gameId = event.target.id.split("-")[2]
        socket.emit("menu.join", gameId)
        console.log("[sent] menu.join", gameId)
    }
    var handleGameNamespaceId = function (namespaceId) {
        var namespace = io(namespaceId)
        // hide the server menu
        var menu = document.getElementById('menu')
        menu.style.display = "none"
        // set up the canvas
        var canvas = document.getElementById('canvas')
        // canvas.id = "canvas"
        // TODO: move these settings
        canvas.style = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;"
        canvas.unselectable = "on"
        canvas.onselectstart = "return false;"
        canvas.onmousedown = "return false;"
        // turn on the canvas
        canvas.style.display = "block"
        // setup the game
        game = new Game(canvas, namespace, 40)
        game.init()
    }
    var handleAddGame = function (game) {
        MenuDom.addRow(game)
    }
    var handleUpdateGame = function (game) {
        MenuDom.replaceRow(game)
    }
    var handleRemoveGame = function (game) {
        MenuDom.removeRow(game)
    }
    socket.on("game.add", handleAddGame)
    socket.on("game.update", handleUpdateGame)
    socket.on("game.remove", handleRemoveGame)
    socket.on("game.join", handleGameNamespaceId)
    // handle creating new games
    var createPlayersInput = document.getElementById("create-players")
    // var createNameInput = document.getElementById("create-name")
    var createSizeInput = document.getElementById("create-size")
    var createButton = document.getElementById("create-button")
    var handleCreateButtonClick = function (event) {
      var maxPlayers = createPlayersInput.value
      createPlayersInput.value = ""
    //   var name = createNameInput.value
      var size = createSizeInput.value
      createSizeInput.value = ""
      var game = {
        // name: name,
        size: size,
        maxPlayers: maxPlayers
      }
      socket.emit("menu.add", game)
      console.log("[sent] menu.add", game)
    }
    createButton.addEventListener("click", handleCreateButtonClick)
    socket.emit("menu.ready")
}