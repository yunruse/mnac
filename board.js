function newElement(tag, cls) {
    var el = document.createElement(String(tag))
    el.classList = [cls]
    return el
}
function classy(element, cls, bool) {
    bool ? element.classList.add(cls) : element.classList.remove(cls);
}

function refreshBoardElements() {
    document.getElementById('game').replaceChildren(
        ...[...Array(9)].map((_, b) => {
            let board = newElement('div', 'board');
            board.onclick = () => boardWasClicked(b)
            board.replaceChildren(
                ...[...Array(9)].map((_, c) => {
                    let cell = newElement('div', 'cell')
                    cell.onclick = () => cellWasClicked(b, c)
                    return cell
                }),
            )
            return board
        })
    );
}

function doHighlightBoard(board) {
    switch (state.action) {
        case ACTION.PlayStart: return true;
        case ACTION.Play: return state.board == board;
        case ACTION.Send: return state.board !== board && state.boardsTaken[board] == PLAYER.None;
        default: return false;
    }
}
function updateBoard() {
    document.getElementById('state').innerText = state.action;
    let O = state.player == PLAYER.Noughts;
    let X = state.player == PLAYER.Crosses;
    classy(document.getElementById("titleNoughts"), "bold", O)
    classy(document.body, "noughts", O)
    classy(document.getElementById("titleCrosses"), "bold", X)
    classy(document.body, "crosses", X)

    let boards = document.getElementById('game').children
    for (let b = 0; b < 9; b++) {
        classy(boards[b], 'noughts', state.boardsTaken[b] == PLAYER.Noughts)
        classy(boards[b], 'crosses', state.boardsTaken[b] == PLAYER.Crosses)
        classy(boards[b], 'selected', doHighlightBoard(b))

        let cells = boards[b].children
        for (let c = 0; c < 9; c++) {
            const cell = cells[c]
            let player = state.grid[b][c]

            classy(cell, "teleport", (player == PLAYER.None) && cellMayTeleport(b, c))
            classy(cell, "noughts", player == PLAYER.Noughts)
            classy(cell, "crosses", player == PLAYER.Crosses)
        }
    }
}

function newGame() {
    resetGameState();
    updateBoard();
    document.getElementById('timer').checked ?
        startTimer() : stopTimer();
}

window.onload = function () {
    refreshBoardElements()
    newGame()
}
