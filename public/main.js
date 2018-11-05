$(function () {
  var canvas = document.getElementById('canvas')
  var socket = io()
  var game = new Game(canvas, socket, 800)
  game.init()
})