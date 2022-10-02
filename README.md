# Meta noughts and crosses \([yunru.se/mnac](https://yunru.se/mnac))

is a tactical variant on the old classic. To win the game, you must claim a line of three boards… but each board is a mini game of noughts and crosses itself. In each turn, you are in a different board – and the cell you place your mark in is the board your opponent goes to! For example, if noughts plays in the bottom-right cell of their board (as shown below) then crosses goes to the bottom-right board (which works to their advantage). Capturing a board requires tricking your opponent into sending you there – so you must think moves ahead to gain the advantage.

![example.png](An example game. Noughts is to play in the bottom-left board, and can win at some tactical cost.)

On a different repo [@yunruse/mnac-old](https://github.com/yunruse/mnac-old) the game is implemented in Python as a local GUI, terminal app, and Discord bot. This version was a quick recreation in JS (and hopefully soon to be made slightly less hacky in TS).
