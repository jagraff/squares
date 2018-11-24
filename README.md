# Squares Game
## done
- if you click an invalid move AND you had a valid move selected, it should keep the valid move
- NO CLICK neccesary, automatically capture whatever is under your mouse
# probably wont implement
- aim correction, decreasing "wasted clicks" (feels bad)
    - if you click right next to a tile that is valid, it should auto-correct to the valid tile
- turn-selection animation should happen immediatly on the UI side
## core gameplay idea
- visualize the duration of a turn, maybe with a bar at the bottom
- have a time period for taking turns and a pause afterwards
- tweaking the refresh rate
- non-rectangular maps
    - maybe even change the board to use hexagons?
        - would change all the mechanics
- some way to make people click less, don't want this to be an unreasonable game that gives you carpal tunnel
- more types of maps
    - 
- more advanced upgrade system
    - multiple clicks per upgrade
    - visualize how far along your upgrade it
- "war torn" tiles
    - if 2 players click the same tile it turns black temporarily
- "strength" is really "defense"
- tactical nuke
- bots
- political vibes?
- see other peoples cursors?
- wait for both players to click??
- diplomatic victory
- turn transition takes N milliseconds, and no one can click during this time.
- change refresh speed during game
# UI/UX
- animated tiles, look like they're glowing?
- actual color schemes
- hovering over a tile highlights it
- hold click to capture
- display when you are allowed to click again
- highlight tiles which are valid moves
- only draw the diff
- symbols instead of colors? what to put in these squares besides colors
- not sure what the theme should be?
- can we wrap up this idea in an actual game that looks nothing like this?
- gradients instead of lines
- maybe some kind of map
- better win animation x100
- animation for appearing/spreading
## peripheral ideas
- chat
- lobby system
    - selecting your color
    - selecting a map
- making this work cleanly for mobile
    - interface
## infrastructure
- need a fast server for node, probably switch to heroku for now
- wrap up static assets in something fast
- minify frontend javascript
- make sure server code is fast