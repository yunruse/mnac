// Enums

const PLAYER = {
    Noughts: 'O',
    Crosses: 'X',
    Draw: '?',
    None: "_",
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

function winner(grid) {
    for (const player of [PLAYER.Noughts, PLAYER.Crosses])
        for (const pattern of GRID_WINNERS)
            if (pattern.every(i => (grid[i] == player)))
                return player
    if (grid.every(p => p != PLAYER.None))
        return PLAYER.Draw;
    return PLAYER.None;
}

class MnacGame extends netplayjs.Game {
    constructor() {
        super()
        this.player = PLAYER.Noughts
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
    // Interactivity
    swapPlayer() {
        if (this.player == PLAYER.Noughts)
            this.player = PLAYER.Crosses;
        else if (this.player == PLAYER.Crosses)
            this.player = PLAYER.Noughts;
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

        this.grid[board][cell] = this.player
        this.boardsTaken[board] = winner(this.grid[board]);

        let gameWinner = winner(this.boardsTaken);
        if (gameWinner !== PLAYER.None) {
            // Win or draw
            this.action = (gameWinner == PLAYER.Draw) ? ACTION.Draw : ACTION.Win;
            this.player = gameWinner;
        } else if (this.numBoardsTaken() == 8) {
            // Draw by exhaustion
            this.action = ACTION.Draw;
            this.player = PLAYER.Draw;
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
}