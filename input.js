// TODO: unify this? DRY and all

function cellWasClicked(board, cell) {
    console.group(`Cell ${board},${cell} was clicked`)

    switch (state.action) {
        case ACTION.Play:
            if (state.board !== board) {
                console.info("Can't play in this board");
                break;
            }
        case ACTION.PlayStart:
            state.doPlay(board, cell);
            break;

        case ACTION.Send:
            state.doSend(board);
            break;
    }
    console.groupEnd()
    updateBoard();
    return true;
}

function boardWasClicked(board) {
    console.log(`Board ${board} was clicked`)
    if (state.action == ACTION.Send) {
        state.doSend(board);
        updateBoard();
    }
}

// Keyboard handling

window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) return;
    let key = event.key.toLowerCase();

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

    code -= 1;

    console.group(`Button ${code} was pressed`)
    switch (state.action) {
        case ACTION.PlayStart:
            state.action = ACTION.Play;
            state.board = code;
            break;
        case ACTION.Play:
            state.doPlay(state.board, code)
            break;
        case ACTION.Send:
            state.doSend(code);
            break;
    }
    console.groupEnd()
    updateBoard();
    event.preventDefault();
}, true);