// Enums
const PLAYER = {
    Draw: -2,
    None: -1,
    Noughts: 0,
    Crosses: 1,
}

const PLAYERNAME = {
    [PLAYER.Noughts]: "Noughts",
    [PLAYER.Crosses]: "Crosses",
}

const ACTION = {
    PlayStart: "select a board to start playing",
    Play: "select a cell to play in",
    Send: "where to send your opponent to?",
    Draw: "it's a draw!",
    Win: "you win!",
}
const GRID_WINNERS = [
    [0, 3, 6], // Vertical
    [1, 4, 7],
    [2, 5, 8],
    [0, 1, 2], // Horizontal
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8], // Diagonal
    [2, 4, 6],
]
const COLORS = {
    "bg": {
        0: "#fff0e1",
        1: "#e6f2ff",
    },

    "highlight": {
        [-1]: "#ddd",
        0: "#d66b00",
        1: "#0068cf",
    },

    "cell": {
        [-1]: "#eee",
        0: "#874400",
        1: "#1a5ea1",
        "teleport": "#cfc",
    }
}

const KEYMAP = {
    1: 1, 2: 2, 3: 3,
    4: 4, 5: 5, 6: 6,
    7: 7, 8: 8, 9: 9,
    "q": 4, "w": 5, "e": 6,
    "a": 7, "s": 8, "d": 9,
}
// Grid coordinate shenanigans
const TITLEHEIGHT = 20;
const CELL = 40;
const GUTTER = 10;
const MARGIN = 4;
const BOARD = CELL * 3 + GUTTER * 2 + MARGIN * 2;
const MARKERWIDTH = 5;


function winner(grid) {
    for (const player of [PLAYER.Noughts, PLAYER.Crosses])
        for (const pattern of GRID_WINNERS)
            if (pattern.every(i => (grid[i] == player)))
                return player
    if (grid.every(p => p != PLAYER.None))
        return PLAYER.Draw;
    return PLAYER.None;
}
function newElement(tag, cls) {
    var el = document.createElement(String(tag))
    el.classList = [cls]
    return el
}
function classy(el, cls, bool) {
    var el = typeof el == "string" ? document.getElementById(el) : el
    bool ? el.classList.add(cls) : el.classList.remove(cls);
}

class MnacGame extends netplayjs.Game {
    static timestep = 10;
    static canvasSize = {
        width: BOARD * 3 + GUTTER * 4,
        height: BOARD * 3 + GUTTER * 4 + TITLEHEIGHT
    };
    static numPlayers = { min: 2, max: 2 };

    // ____  _        _
    // / ___|| |_ __ _| |_ ___
    // \___ \| __/ _` | __/ _ \
    //  ___) | || (_| | ||  __/
    // |____/ \__\__,_|\__\___|

    constructor(canvas, players) {
        super()
        this.players = players;
        this.activePlayer = PLAYER.Noughts
        this.action = ACTION.PlayStart
        this.board = undefined
        this.grid = [...Array(9)].map(() => [...Array(9)].map(() => PLAYER.None))
        this.boardsTaken = [...Array(9)].map(() => PLAYER.None)
    }
    numBoardsTaken() {
        let total = 0
        for (const b of this.grid)
            if (winner(b) !== PLAYER.None)
                total += 1
        return total
    }
    swapPlayer() {
        if (this.activePlayer == PLAYER.Noughts)
            this.activePlayer = PLAYER.Crosses;
        else if (this.activePlayer == PLAYER.Crosses)
            this.activePlayer = PLAYER.Noughts;
    }
    cellMayTeleport(board, cell) {
        return (board == cell) || (
            this.boardsTaken[cell] !== PLAYER.None)
    }
    doSend(board) {
        if (this.boardsTaken[board] !== PLAYER.None)
            return console.warn("Can't send to occupied board");
        if (this.board == board)
            return console.warn("Can't send to own board");

        this.board = board;
        this.swapPlayer()
        this.action = ACTION.Play;
    }
    doPlay(board, cell) {
        if (this.action === ACTION.PlayStart && board == 4)
            return console.warn("House rule: cannot start in centre");
        if (this.grid[board][cell] !== PLAYER.None)
            return console.warn("This cell is already taken!");

        this.grid[board][cell] = this.activePlayer
        this.boardsTaken[board] = winner(this.grid[board]);

        let gameWinner = winner(this.boardsTaken);
        if (gameWinner !== PLAYER.None) {
            // Win or draw
            this.action = (gameWinner == PLAYER.Draw) ? ACTION.Draw : ACTION.Win;
            this.activePlayer = gameWinner;
        } else if (this.numBoardsTaken() == 8) {
            // Draw by exhaustion
            this.action = ACTION.Draw;
            this.activePlayer = PLAYER.Draw;
        } else if (this.cellMayTeleport(board, cell)) {
            // Player still has to send
            this.action = ACTION.Send;
            this.board = board;
        } else {
            // Finish turn
            this.swapPlayer()
            this.action = ACTION.Play;
            this.board = cell;
        }
    }

    tick(inputMaps) {
        for (const [player, input] of inputMaps) {
            if (player.id !== this.activePlayer)
                continue

            let num = undefined
            for (let key in KEYMAP)
                if (input.keysPressed[key])
                    num = KEYMAP[key] - 1

            if (num === undefined)
                continue

            switch (this.action) {
                case ACTION.PlayStart:
                    this.action = ACTION.Play;
                    this.board = num;
                    break;
                case ACTION.Play:
                    this.doPlay(this.board, num)
                    break;
                case ACTION.Send:
                    this.doSend(num);
                    break;
            }
        }
    }

    // ____
    // |  _ \ _ __ __ ___      __
    // | | | | '__/ _` \ \ /\ / /
    // | |_| | | | (_| |\ V  V /
    // |____/|_|  \__,_| \_/\_/

    // Drawing
    doHighlightBoard(board) {
        if (this.boardsTaken[board] !== PLAYER.None) { return false; }
        switch (this.action) {
            case ACTION.PlayStart: return board !== 4;
            case ACTION.Play: return this.board == board;
            case ACTION.Send: return this.board !== board;
            default: return false;
        }
    }

    currentPlayer() {
        // console.log(this)
        for (let player of this.players)
            if (player.isLocalPlayer())
                return player.id
    }
    isActivePlayer() {
        return this.currentPlayer() == this.activePlayer
    }

    markSymbol(ctx, player, x, y, isCell) {
        ctx.strokeStyle = COLORS.cell[player];
        ctx.lineWidth = isCell ? MARKERWIDTH : MARKERWIDTH * (BOARD / CELL);
        ctx.globalAlpha = isCell ? 1 : 0.75;
        let s = isCell ? CELL : BOARD;

        ctx.beginPath()
        if (player == PLAYER.Noughts) {
            // avoid line extending outside of bounds
            x += ctx.lineWidth / 2
            y += ctx.lineWidth / 2
            s -= ctx.lineWidth
            ctx.moveTo(x, y)
            ctx.lineTo(x + s, y + s)
            ctx.moveTo(x, y + s)
            ctx.lineTo(x + s, y)
        }
        if (player == PLAYER.Crosses) {
            ctx.arc(x + s / 2, y + s / 2, (s - ctx.lineWidth) / 2, 0, 2 * Math.PI)
        }
        ctx.stroke()

        ctx.globalAlpha = 1.0;
    }

    draw(canvas) {
        // TODO heavily cache: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
        const ctx = canvas.getContext("2d");

        let activePlayer = this.activePlayer
        let currentPlayer = this.currentPlayer()
        let isActive = activePlayer == currentPlayer

        // Background
        ctx.fillStyle = "#f9f9f9"
        if (isActive)
            ctx.fillStyle = COLORS.bg[activePlayer]
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Title
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#4a4a4a"
        ctx.font = "24px Arial"
        let action = PLAYERNAME[this.activePlayer] + (isActive ? ", " + this.action : " is taking their turn...");
        ctx.fillText(action, GUTTER, GUTTER + TITLEHEIGHT)

        // Board
        // TODO: use some sort of coordinate transform for gutterspace?

        for (let b = 0; b < 9; b++) {
            let bx = b % 3
            let by = Math.floor(b / 3)
            bx = GUTTER + bx * (BOARD + GUTTER);
            by = GUTTER + TITLEHEIGHT + by * (BOARD + GUTTER);

            // Highlight = board can be played in
            let p = PLAYER.None;
            if (isActive && this.doHighlightBoard(b))
                p = activePlayer;

            let doDrawBoard = this.boardsTaken[b] === PLAYER.None
            if (doDrawBoard) {
                ctx.fillStyle = COLORS.highlight[p];
                ctx.fillRect(bx, by, BOARD, BOARD)
                // Inside background: board is taken
                ctx.fillStyle = COLORS.highlight[-1]
                ctx.fillRect(bx + MARGIN, by + MARGIN, BOARD - MARGIN * 2, BOARD - MARGIN * 2)
            }

            // Cells
            for (let c = 0; c < 9; c++) {
                let cx = c % 3
                let cy = Math.floor(c / 3)
                cx = bx + MARGIN + cx * (CELL + GUTTER);
                cy = by + MARGIN + cy * (CELL + GUTTER);
                let p = this.grid[b][c]

                if (doDrawBoard) {
                    let cellbg = PLAYER.None
                    if (p == PLAYER.None && this.cellMayTeleport(b, c))
                        cellbg = "teleport";

                    ctx.fillStyle = COLORS.cell[cellbg];
                    ctx.fillRect(cx, cy, CELL, CELL)
                }

                this.markSymbol(ctx, p, cx, cy, true)
                // Keyboard indicator: cell
                let selectingCell = isActive && (this.action == ACTION.Play);
                if (selectingCell && this.board == b && p == PLAYER.None) {
                    ctx.globalAlpha = 0.75
                    ctx.fillStyle = COLORS.cell[this.activePlayer];
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "24pt Arial"
                    ctx.fillText(c + 1, cx + CELL / 2, cy + CELL / 2)
                    ctx.globalAlpha = 1;
                }
            }
            // symbol on top of board
            this.markSymbol(ctx, this.boardsTaken[b], bx, by, false)

            // Keyboard indicator: board
            let selectingBoard = isActive && (
                this.action == ACTION.PlayStart || this.action == ACTION.Send);
            if (selectingBoard && this.doHighlightBoard(b)) {
                ctx.globalAlpha = 0.75
                ctx.fillStyle = COLORS.cell[this.activePlayer];
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "80pt Arial"
                ctx.fillText(b + 1, bx + BOARD / 2, by + BOARD / 2)
                ctx.globalAlpha = 1;
            }
        }
    }
}

function newGame() {
    new netplayjs.LocalWrapper(MnacGame).start();
}
window.onload = newGame;