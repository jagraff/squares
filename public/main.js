$(function () {
  var canvas = document.getElementById('canvas');
  var innerContainer = document.getElementById('inner-container');
  var ctx = canvas.getContext('2d');
  var socket = io();
  var SIZE = 10;
  var CANVAS_SIZE = 800;
  var SQUARE_SIZE = CANVAS_SIZE / SIZE;
  

  var state = {
    select: {
      x: null,
      y: null
    },
    enabled: false,
    players: {},
    tiles: []
  };

  window.gstate = state

  var fillRect = function (x, y, width, height, color) {
    ctx.beginPath();
    ctx.lineWidth = "6";
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fill();
  };

  var clear = function() {
    fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, "white")
  }

  var strokeRect = function (x, y, width, height, color, lineWidth) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.rect(x, y, width, height);
    ctx.stroke();
  };

  var fillSquare = function (x, y, color) {
    var x1 = (x * SQUARE_SIZE) + 1;
    var y1 = (y * SQUARE_SIZE) + 1;
    var s = SQUARE_SIZE - 2;
    fillRect(x1,y1,s,s,color);
  };

  var drawSelectSquare = function () {
    if ((!state.select) || state.select.x === null || state.select.y === null) {
      return
    }
    
    var offset = 2;
    strokeRect(
      (state.select.x*SQUARE_SIZE) + offset,
      (state.select.y*SQUARE_SIZE) + offset,
      SQUARE_SIZE - (offset * 2),
      SQUARE_SIZE - (offset * 2),
      "black",
      "4"
    );
    // var offset = 2;
    // strokeRect(
    //   (state.select.x*SQUARE_SIZE) + offset,
    //   (state.select.y*SQUARE_SIZE) + offset,
    //   SQUARE_SIZE - (offset * 2),
    //   SQUARE_SIZE - (offset * 2),
    //   "white",
    //   "2"
    // );
  };

  var drawBorders = function () {
    for (var x = 0; x < SIZE; x++) {
      for (var y = 0; y < SIZE; y++) {
        strokeRect(
          x*SQUARE_SIZE,
          y*SQUARE_SIZE,
          SQUARE_SIZE,
          SQUARE_SIZE,
          "black",
          "2"
        );
      }
    }
  };

  var drawTiles = function() {
    for (var x=0; x < SIZE; x++) {
      for (var y=0; y < SIZE; y++) {
        var tile = state.tiles[x][y]
        if (tile.color) {
          var offset = 1;
          fillRect(
            (x * SQUARE_SIZE) + offset,
            (y * SQUARE_SIZE) + offset,
            SQUARE_SIZE - (offset * 2),
            SQUARE_SIZE - (offset * 2),
            tile.color
          );
          if (tile.strength == 2) {
            var offset = SQUARE_SIZE - 4
            fillRect(
              (x * SQUARE_SIZE) + offset,
              (y * SQUARE_SIZE) + offset,
              SQUARE_SIZE - (offset * 2),
              SQUARE_SIZE - (offset * 2),
              "rgba(0,0,0,0.5)"
            );
          }
        }
      } 
    }
  }

  var withinBounds = function(x, y) {
    return (
      x > 0 &&
      y > 0 &&
      x <= SIZE &&
      y <= SIZE
    );
  };

  var calculateLocation = function (x, y) {
    var cx = Math.ceil(x / SQUARE_SIZE) - 1;
    var cy = Math.ceil(y / SQUARE_SIZE) - 1;
    return {
      x: cx,
      y: cy
    };
  };

  var draw = function() {
    clear();
    drawBorders();
    drawTiles();
    drawSelectSquare();
  }

  var init = function () {
    // setup tiles
    for (var x=0; x < SIZE; x++) {
      state.tiles[x] = []
      for (var y=0; y < SIZE; y++) {
        state.tiles[x][y] = {color: null, strength: 0}
      } 
    }
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    state.select = null;
    state.enabled = true;
    console.log("enabled")

    canvas.addEventListener('click', function (event) {
      var x = (
        event.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft -
        canvas.offsetLeft
      );
      var y = (
        event.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop -
        canvas.offsetTop
      );
      socket.emit('click', calculateLocation(x, y));
    });


  };

  socket.on("updates", function (updates) {
    for (var i=0; i<updates.length; i++) {
      var update = updates[i];
      console.log("update", update)
      state.tiles[update.x][update.y] = update;
    }
  })

  setInterval(function () {
    if (state.enabled) {
      draw();
    }
  }, 100);

  socket.on("init", function (config) {
    SIZE = config.size;
    SQUARE_SIZE = CANVAS_SIZE / SIZE;
    init()
  });

  socket.on("assign", function (message) {
    var e = document.getElementById("color");
    e.textContent = message;
    e.style.color = message;
    // e.style.fontFamily = "Helvetica";
    // e.style.fontWeight = "bold";
  });

  socket.on("winner", function (message) {
    var e = document.getElementById("winner");
    e.textContent = message.toUpperCase() + " WINS!";
    e.style.color = message;
    // e.style.fontFamily = "Helvetica";
    // e.style.fontWeight = "bold";
  });

  socket.on("pending", function (message) {
    state.select = message
  });
  
  socket.emit("join")

});