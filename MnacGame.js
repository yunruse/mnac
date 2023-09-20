// Enums
const PLAYER = {
    Draw: -2,
    None: -1,
    Noughts: 0,
    Crosses: 1,
}
const ACTION = {
    PlayStart: "Select any cell to start playing",
    Play: "Select a cell to play in",
    Send: "Send your opponent to a different board",
    Draw: "It's a draw!",
    Win: "You win!",
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
        0: "#d66b00",
        1: "#0068cf",
    },

    "board": "#ddd",

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


let AAAA = undefined

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
    static canvasSize = { width: 600, height: 600 };
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
        switch (this.action) {
            case ACTION.PlayStart: return board !== 4;
            case ACTION.Play: return this.board == board;
            case ACTION.Send: return this.board !== board && this.boardsTaken[board] == PLAYER.None;
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

    draw(canvas) {
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
        ctx.fillStyle = "#4a4a4a"
        ctx.font = "30px Arial"

        let action = isActive ? this.action : "Waiting...";
        ctx.fillText(action, 10, 50)

        // Board

        const Y0 = 80;
        const X0 = 80;
        const CELL = 40;
        const GUTTER = 10;
        const BOARD = CELL * 3 + GUTTER * 2

        // TODO: use some sort of coordinate transform for gutterspace?


        for (let b = 0; b < 9; b++) {
            let bx = b % 3
            let by = Math.floor(b / 3)
            // Boards

            let H = this.doHighlightBoard(b)
            let O = this.boardsTaken[b] == PLAYER.Noughts
            let X = this.boardsTaken[b] == PLAYER.Crosses

            // TODO: highlight
            // TODO: capture symbol

            ctx.fillStyle = COLORS.board
            bx = X0 + bx * (BOARD + GUTTER);
            by = Y0 + by * (BOARD + GUTTER);
            ctx.fillRect(bx, by, BOARD, BOARD)


            // Cells
            for (let c = 0; c < 9; c++) {
                let cx = c % 3
                let cy = Math.floor(c / 3)

                let p = this.cellMayTeleport(b, c) ? "teleport" : this.grid[b][c]
                ctx.fillStyle = COLORS.cell[p];
                cx = bx + cx * (CELL + GUTTER);
                cy = by + cy * (CELL + GUTTER);
                ctx.fillRect(cx, cy, CELL, CELL)
                // TODO: capture symbols
            }
        }
    }
}

function newGame() {
    new netplayjs.LocalWrapper(MnacGame).start();
}
window.onload = newGame;