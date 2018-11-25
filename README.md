# Squares Game
## done
- highlight tiles which are valid moves
- if you click an invalid move AND you had a valid move selected, it should keep the valid move
- NO CLICK neccesary, automatically capture whatever is under your mouse
- hovering over a tile highlights it

# in progress
- lobby system
    - selecting your color (is this neccesary?)

    - selecting a map

# refactoring
- seperate networking code from game logic code
- GameServer & Game classes
- Packet classes for different message types
- maybe switch to typescript?
- why doesn't my linter stop me from making mistakes

- seperate the business logic of the game from everything else?
    - purely functional?
    - game = tick(game, inputs)

- unit tests, for the love of god
- don't bother sending invalid moves (reduces network chatter)

# add more competative elements
- stats: high score, win/loss ratio, etc.

# probably wont implement
- aim correction, decreasing "wasted clicks" (feels bad)
    - if you click right next to a tile that is valid, it should auto-correct to the valid tile
- turn-selection animation should happen immediatly on the UI side
- visualize the duration of a turn, maybe with a bar at the bottom
    - trid this
- have a time period for taking turns and a pause afterwards
- tweaking the refresh rate
    - probably decide on 1 refresh rate
    - 0.5 seconds works well
- wait for both players to click??

## core gameplay idea
- nick name system [4 character limit]
- non-rectangular maps
    - maybe even change the board to use hexagons?
        - would change all the mechanics
- some way to make people click less, don't want this to be an unreasonable game that gives you carpal tunnel
- more types of maps
    - 
- gamemodes?
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
- alliances?
- diplomatic victory (easter egg?)
- turn transition takes N milliseconds, and no one can click during this time.
- change refresh speed during game

# UI/UX
- customizing colors?
- animated tiles, look like they're glowing?
- actual color schemes
- hold click to capture
- display when you are allowed to click again
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
- making this work cleanly for mobile
    - interface

## infrastructure
- need a fast server for node, probably switch to heroku for now
- wrap up static assets in something fast
- minify frontend javascript
- make sure server code is fast