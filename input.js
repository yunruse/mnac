

function cellWasClicked(board, cell) {
    console.group(`Cell ${board},${cell} was clicked`)
    
    pushHistory();
    switch (state.action) {
        case ACTION.Play:
            if (state.board !== board) {
                console.info("Can't play in this board");
                break;
            }
        case ACTION.PlayStart:
            doPlay(board, cell);
            break;

        case ACTION.Send:
            doSend(board);
            break;
    }
    console.groupEnd()
    updateBoard();
    return true;
}

function boardWasClicked(board) {
    console.log(`Board ${board} was clicked`)
    if (state.action == ACTION.Send) {
        doSend(board);
        updateBoard();
    }
}

// Keyboard handling

const KB_NOUGHTS = {
    "q": 1, "w": 2, "e": 3,
    "a": 4, "s": 5, "d": 6,
    "z": 7, "x": 8, "c": 9,
}
const KB_CROSSES = {
    "u": 1, "i": 2, "o": 3,
    "j": 4, "k": 5, "l": 6,
    "m": 7, ",": 8, ".": 9,
}

window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) return;
    let key = event.key.toLowerCase();
    
    if (state.player == PLAYER.Noughts)
        key = KB_NOUGHTS[key] || key;
    if (state.player == PLAYER.Crosses)
        key = KB_CROSSES[key] || key;

    if (key == "backspace") {
        popHistory();
        return
    }
    if (key == "n") {
        newGame();
        return
    }

    let code = Number(key);
    if (isNaN(code) || code == 0) return;

    pushHistory();
    code -= 1;

    console.group(`Button ${code} was pressed`)
    switch (state.action) {
        case ACTION.PlayStart:
            state.action = ACTION.Play;
            state.board = code;
            break;
        case ACTION.Play:
            doPlay(state.board, code)
            break;
        case ACTION.Send:
            doSend(code);
            break;
    }
    console.groupEnd()
    updateBoard();
    event.preventDefault();
}, true);