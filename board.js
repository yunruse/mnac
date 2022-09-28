function refreshBoardElements() {
    // Refresh board elements
    let gameBoard = document.getElementById('game');
    gameBoard.replaceChildren(
        ...[...Array(9)].map((_, b) => {
            let board = newElement('div', 'board');
            board.onclick = () => boardWasClicked(b)
            board.replaceChildren(
                ...[...Array(9)].map((_, c) => {
                    let cell = newElement('div', 'cell')
                    cell.onclick = () => cellWasClicked(b, c)
                    // cell.replaceChildren(newElement('span', 'cellTag', c+1))
                    return cell
                }),
                // newElement('span', 'cellTag', b+1)
            )
            return board
      })
    );
}

function doHighlightBoard(board){
    switch (state.action) {
        case ACTION.PlayStart: return true;
        case ACTION.Play: return state.board == board;
        case ACTION.Send: return state.board !== board && state.boardsTaken[board] == "";
        default: return false;
    }
}
function updateBoard() {
    document.getElementById('state').innerText = state.action;
    classy(document.getElementById("titleNoughts"), "bold", state.player == PLAYER.Noughts)
    classy(document.body, "noughts", state.player == PLAYER.Noughts)
    classy(document.getElementById("titleCrosses"), "bold", state.player == PLAYER.Crosses)
    classy(document.body, "crosses", state.player == PLAYER.Crosses)

    // classy(document.getElementById("game"), "selection", state.action == ACTION.PlayStart || state.action == ACTION.Send)

    let boards = document.getElementById('game').children
    for (let b = 0; b < 9; b++) {
        classy(boards[b], 'noughts', state.boardsTaken[b] == 'Noughts')
        classy(boards[b], 'crosses', state.boardsTaken[b] == 'Crosses')
        classy(boards[b], 'selected', doHighlightBoard(b))

        let cells = boards[b].children
        for (let c = 0; c < 9; c++) {
            const cell = cells[c]
            let player = state.grid[b][c]

            classy(cell, "teleport", (player == "") && cellMayTeleport(b, c))
            classy(cell, "noughts", player == PLAYER.Noughts)
            classy(cell, "crosses", player == PLAYER.Crosses)
        }
    }
}

function debugSetDraw(){
    let X = "Crosses"
    let O = "Noughts"
    let _ = "";
    state.grid = [...Array(9)].map(() => [
        X, O, O,
        O, _, X,
        X, X, O]);
}

function newGame(){
    resetGameState();
    updateBoard();

    if (document.getElementById('timer').checked) {
        startTimer();
    } else {
        stopTimer();
    }
}

window.onload = function(){
    refreshBoardElements()
    newGame()
    // debugSetDraw()
    // updateBoard()
}
