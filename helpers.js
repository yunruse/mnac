function DBG(x) {
    console.log(x)
    return x
}

function newElement(tag, cls, content) {
    var el = document.createElement(String(tag))
    el.classList = [cls]
    el.innerText = content || "";
    return el
}

function classy(element, cls, bool) {
    if (bool == undefined) { bool = true }
    bool ? element.classList.add(cls) : element.classList.remove(cls);
}