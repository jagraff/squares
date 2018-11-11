$(function () {
  var canvas = document.getElementById('canvas')
  var socket = io()
  var borderSize = 40
  var maxHeight 
  var game = new Game(canvas, socket, borderSize)
  game.init()
})