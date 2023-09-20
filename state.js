// Enums

let PLAYER = {
    Noughts: 'O',
    Crosses: 'X',
    Draw: '?',
    None: "_",
}
let ACTION = {
    PlayStart: "Select any cell to start playing",
    Play: "Select a cell to play in",
    Send: "Send your opponent to a different board",
    Draw: "It's a draw!",
    Win: "You win!",
}

// State

let state = {
    player: undefined,
    action: undefined,
    board: undefined,
    grid: undefined,
    boardsTaken: undefined,
}
function resetGameState() {
    state.player = PLAYER.Noughts
    state.action = ACTION.PlayStart
    state.board = undefined
    state.grid = [...Array(9)].map(() => [...Array(9)].map(() => PLAYER.None))
    state.boardsTaken = [...Array(9)].map(() => PLAYER.None)
}

// History & state debug functions
function save() { return JSON.stringify(state) }
function load(json) {
    for (const [k, v] of Object.entries(JSON.parse(json))) {
        state[k] = v
    }
    updateBoard();
}

let stateHistory = [];
function pushHistory() {
    let newState = save();
    if (stateHistory[stateHistory.length - 1] === newState) {
        return console.info("Same history state pushed, skipping...");
    }
    stateHistory.push(newState);
}
function popHistory() {
    if (stateHistory.length == 0) {
        return console.info("No history to undo");
    }
    load(stateHistory.pop());
}

// Winner calculation

let GRID_WINNERS = [
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
    for (const player of [PLAYER.Noughts, PLAYER.Crosses]) {
        for (const pattern of GRID_WINNERS) {
            if (pattern.every(i => (grid[i] == player))) {
                return player
            }
        }
    };
    if (grid.every(p => p != PLAYER.None)) {
        return PLAYER.Draw;
    }
    return PLAYER.None;
}

function countBoardsTaken() {
    let total = 0
    for (const b of state.grid)
        if (winner(b) !== PLAYER.None)
            total += 1
    return total
}

// Interactivity

function swapPlayer() {
    if (state.player == PLAYER.Noughts) {
        state.player = PLAYER.Crosses;
    } else if (state.player == PLAYER.Crosses) {
        state.player = PLAYER.Noughts;
    }
}

function cellMayTeleport(board, cell) {
    return (board == cell) || (
        state.boardsTaken[cell] !== PLAYER.None)
}

function doSend(board) {
    if (state.boardsTaken[board] !== PLAYER.None) {
        return console.info("Can't send to occupied board");
    }
    if (state.board == board) {
        return console.info("Can't send to own board");
    }
    state.board = board;
    swapPlayer()
    state.action = ACTION.Play;
}

function doPlay(board, cell) {
    if (state.grid[board][cell] !== PLAYER.None) {
        console.info("This cell is already taken!");
        return
    }
    state.grid[board][cell] = state.player
    state.boardsTaken[board] = winner(state.grid[board]);

    let gameWinner = winner(state.boardsTaken);
    if (gameWinner !== PLAYER.None) {
        // Win or draw
        state.action = (gameWinner == PLAYER.Draw) ? ACTION.Draw : ACTION.Win;
        state.player = gameWinner;
    } else if (countBoardsTaken() == 8) {
        // Draw by exhaustion
        state.action = ACTION.Draw;
        state.player = PLAYER.Draw;
    } else if (cellMayTeleport(board, cell)) {
        // Player still has to send
        state.action = ACTION.Send;
        state.board = board;
    } else {
        // Finish turn
        swapPlayer()
        state.action = ACTION.Play;
        state.board = cell;
    }
}