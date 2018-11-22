var game
$(function () {
  var canvas = document.getElementById('canvas')
  var socket = io()
  var borderSize = 40
  game = new Game(canvas, socket, borderSize)
  game.init()
  
})