let clockState = {
    active: false,
    nought: undefined,
    cross: undefined,
    lastSwap: undefined,
    timerId: undefined,
}
function stopTimer() {
    clearTick();
    document.getElementById('timerNoughts').innerText = ""
    document.getElementById('timerCrosses').innerText = ""
}
function startTimer() {
    stopTimer();
    clockState.active = true;
    clockState.nought = 300;
    clockState.cross = 300;
    clockState.lastSwap = Date.now();
    setTick();
}

function timePassed() {
    return (Date.now() - clockState.lastSwap) / 1000;
}

function setTick() {
    clockState.timerId = setInterval(onTick, 1000)
}
function clearTick() {
    clearInterval(clockState.timerId);
}
function onTick() {
    console.log(clockState.cross, clockState.nought, clockState.lastSwap);
    let t = timePassed();
    let O = clockState.nought;
    let X = clockState.cross;
    if (state.player == "Noughts") {
        O = O - t;
    } else {
        X = X - t;
    }

    document.getElementById('timerNoughts').innerText = formatTime(O);
    document.getElementById('timerCrosses').innerText = formatTime(X);
}

function clockSwapPlayers() {
    if (state.player == "Crosses") {
        clockState.nought -= timePassed();
    } else {
        clockState.cross -= timePassed();
    }
    clockState.lastSwap = Date.now();
}

function formatTime(t) {
    t = Math.max(0, t)
    let m = String(Math.floor(t / 60)).padStart(1, 0)
    let s = String(Math.floor(t % 60)).padStart(2, 0)
    return ` (${m}:${s})`
}