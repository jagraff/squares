/**
 * Functions for manipulating the DOM for the menu screen.
 */
var MenuDom = {
    onClickJoin: function(event) {
        throw new Error("unimplemented")
    },
    createJoinButton: function(buttonId) {
        var element = document.createElement("button")
        element.id = buttonId
        element.className = "menu-join-button"
        element.textContent = "join"
        var self = this
        element.addEventListener("click", function (event) {
            self.onClickJoin(event)
        })
        return element
    },
    createRow: function(game) {
        var tr = document.createElement("tr")
        // save the game id in the html so we can lookup this element later
        var gameId = "game-" + game.id
        tr.id = gameId
        var columns = [
            game.name,
            game.players,
            game.size,
            game.status
        ]
        for (var i=0; i < columns.length; i++) {
            var td = document.createElement("td")
            td.textContent = columns[i]
            tr.appendChild(td)
        }
        // If the game is in a "join" status, then add the "join" button.
        if (game.status === "join") {
            var joinButtonId = "button-" + gameId
            var joinButton = this.createJoinButton(joinButtonId)
            tr.children[3].textContent = ""
            tr.children[3].appendChild(joinButton)
        }
        return tr
    },
    replaceRow: function(game) {
        var gameId = "game-" + game.id
        var oldRow = document.getElementById(gameId)
        var newRow = this.createRow(game)
        oldRow.parentElement.insertBefore(newRow, oldRow)
    },
    removeRow: function(game) {
        var gameId = "game-" + game.id
        var row = document.getElementById(gameId)
        row.parentElement.removeChild(row)
    },
    addRow: function(game) {
        var menuTable = document.getElementById("menu-table")
        if (menuTable) {
            var element = this.createRow(game)
            // Add this item below the header (first element)
            menuTable.insertBefore(element, menuTable.children[1])
            return element
        } else {
            throw new Error("Unable to find element: menu-table")
        }
    },
}