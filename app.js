const gameboard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const width = 8
var playerGo = 'black'
playerDisplay.textContent = 'black'
var last
var check = false

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
]

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece
        square.firstChild?.setAttribute('draggable', true)
        square.setAttribute('square-id', i)
        if (Math.floor(i/width)%2===0) {
            square.classList.add(i%2==0 ? 'light': 'dark')
        }
        else {
            square.classList.add(i%2==0 ? 'dark':'light')
        }

        if (i <= 15) {
            square.firstChild.firstChild.classList.add('black')
        }

        if (i >= 48) {
            square.firstChild.firstChild.classList.add('white')
        }
        gameboard.append(square)
    })
}

createBoard()
changePlayer()

const allSquares = document.querySelectorAll("#gameboard .square")

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('drop', dragDrop)
})

var startPositionId
var draggedElement
var draggedFromSquare
function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
    draggedFromSquare = e.target.parentNode
}

function dragOver(e) {
    e.preventDefault()
}

function dragDrop(e) {
    e.stopPropagation()
    const correctGo = draggedElement.firstChild.classList.contains(playerGo)
    const taken = e.target.classList.contains('piece')
    const valid = checkIfValidMove(e.target, draggedElement)
    const opponentGo = playerGo == 'white' ? 'black' : 'white'
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)

    if (correctGo) {
        if (takenByOpponent && valid) {
            if (e.target.getAttribute('id') !== 'king') {
                if (check) {
                    var tempRemovedElement = e.target.cloneNode(true)
                    const targetId = e.target.parentNode.getAttribute('square-id')
                    e.target.parentNode.append(draggedElement)
                    checkPawnPromotion(e.target.parentNode)
                    e.target.remove()
                    check = isCheck(false)
                    if (check) {
                        const movedFrom = document.querySelector(`[square-id="${startPositionId}"]`)
                        movedFrom.append(draggedElement)
                        const movedTo = document.querySelector(`[square-id="${targetId}"]`)
                        movedTo.append(tempRemovedElement)
                        movedTo.classList.remove('check')
                    } else {
                        const movedFrom = document.querySelector(`[square-id="${startPositionId}"]`)
                        movedFrom.classList.remove('check')
                        changePlayer()
                    }
                    return
                }
                e.target.parentNode.append(draggedElement)
                checkPawnPromotion(e.target.parentNode)
                e.target.remove()
                changePlayer()
                check = isCheck(true)
                return
            } return
        }
        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "You cannot go here!"
            setTimeout(() => infoDisplay.textContent = "", 3000)
            return
        }
        if (valid) {
            if (check) {
                e.target.append(draggedElement)
                checkPawnPromotion(e.target)
                check = isCheck(false)
                if (check) {
                    const movedFrom = document.querySelector(`[square-id="${startPositionId}"]`)
                    movedFrom.append(draggedElement)
                    e.target.classList.remove('check')
                    return
                }
                changePlayer()
                return
            }
            e.target.append(draggedElement)
            checkPawnPromotion(e.target)
            changePlayer()
            check = isCheck(true)
            return
        }
    }
}

function isCheck(after) {
    const opponentColor = playerGo === 'black' ? 'white':'black'
    const playerKing = document.querySelector(`#king svg.${playerGo}`).parentNode.parentNode
    const opponentPieces = Array.from(document.querySelectorAll(`div svg.${opponentColor}`)).map(opponentPiece => opponentPiece.parentNode.parentNode)
    for (var i=0; i<opponentPieces.length; i++) {
        var opponentPiece = opponentPieces[i]
        if (canKill(opponentPiece, playerKing, after)) {
            infoDisplay.textContent = `${playerGo} king is in check`
            playerKing.setAttribute('class', '')
            playerKing.classList.add('square')
            playerKing.classList.add('check')
            playerKing.classList.add('light')
            return true
        }
    }
    infoDisplay.textContent = ""
    var id = after ? (63-Number(startPositionId)) : Number(startPositionId)
    const brownSquare = document.querySelector(`[square-id="${id}"]`)
    brownSquare.classList.remove('check')
    return false
}

function canKill(killer, victim, after) {
    killerType = killer.firstChild.getAttribute('id')
    const killerId = Number(killer.getAttribute('square-id'))
    const victimId = Number(victim.getAttribute('square-id'))
    // if either killer or victim square doesn't have piece
    if (killer.firstChild === undefined || victim.firstChild ===undefined) {
        return false
    }
    // if killer and victim are same color
    if (killer.firstChild?.firstChild?.getAttribute('class') === victim.firstChild?.firstChild?.getAttribute('class')) {
        return false
    }

    switch (killerType) {
        case 'pawn':
            if (after) {
                if(
                    (killerId-width-1===victimId) || 
                    (killerId-width+1===victimId)
                )
                    return true
            } else {
                if(
                    (killerId+width-1===victimId) || 
                    (killerId+width+1===victimId)
                )
                    return true
            }
            break
        default :
            if (checkIfValidMove(victim, killer))
                return true
    }
    return false
}

function checkPawnPromotion(target) {
    const piece = draggedElement.id
    if (piece !== 'pawn')
        return
    if([63,62,61,60,59,58,57,56].includes(Number(target.getAttribute('square-id')))) {
        var dialog = document.getElementById("dialog");
        dialog.style.display = "block";
    }
    
}

function handleOption(option) {
    var dialog = document.getElementById("dialog");
    dialog.style.display = "none";
    
    // Perform action based on the chosen option
    switch (option) {
        case 'pawn':
            break;
        case 'queen':
            playerColor = draggedElement.firstChild.getAttribute('class')
            var square = draggedElement.parentNode
            square.innerHTML = queen
            square.firstChild.setAttribute('draggable', true)
            square.firstChild.firstChild.classList.add(playerColor)
            break;
        case 'rook':
            playerColor = draggedElement.firstChild.getAttribute('class')
            var square = draggedElement.parentNode
            square.innerHTML = rook
            square.firstChild.setAttribute('draggable', true)
            square.firstChild.firstChild.classList.add(playerColor)
            break;
        case 'knight':
            playerColor = draggedElement.firstChild.getAttribute('class')
            var square = draggedElement.parentNode
            square.innerHTML = knight
            square.firstChild.setAttribute('draggable', true)
            square.firstChild.firstChild.classList.add(playerColor)
            break;
        case 'bishop':
            playerColor = draggedElement.firstChild.getAttribute('class')
            var square = draggedElement.parentNode
            square.innerHTML = bishop
            square.firstChild.setAttribute('draggable', true)
            square.firstChild.firstChild.classList.add(playerColor)
            break;
        default:
          console.log("Invalid option");
    }
  }

function checkIfValidMove(target, move) {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'))
    var startId
    if (move.parentNode.hasAttribute('square-id')) {
        startId = Number(move.parentNode.getAttribute('square-id'))
    } else {
        startId = Number(move.getAttribute('square-id'))
    }
    const piece = move.id || move.firstChild?.id
    var value;
    switch(piece) {
        case 'pawn':
            const starterRow = [8,9,10,11,12,13,14,15]
            if (
                (starterRow.includes(startId) && startId + width*2 === targetId) ||
                (startId + width === targetId) || 
                (startId+width-1===targetId && document.querySelector(`[square-id="${startId+width-1}"]`).firstChild) || 
                (startId+width+1===targetId && document.querySelector(`[square-id="${startId+width+1}"]`).firstChild)
            ) {
                return true
            }
            break
        case 'knight':
            if (
                (startId+width*2-1 === targetId) ||
                (startId+width*2+1 === targetId) ||
                (startId+width+2 === targetId) ||
                (startId+width-2 === targetId) ||
                (startId-width*2-1 === targetId) ||
                (startId-width*2+1 === targetId) ||
                (startId-width+2 === targetId) ||
                (startId-width-2 === targetId)
            )
                return true
            break
        case 'bishop':
            value = false
            for (var i = 1; i < 8; i++) {
                var tempValue1 = (startId+width*i+i === targetId)
                var tempValue2 = (startId+width*i-i === targetId)
                var tempValue3 = (startId-width*i-i === targetId)
                var tempValue4 = (startId-width*i+i === targetId)
                for (var j = 1; j < i; j++) {
                    tempValue1 = (tempValue1 && !document.querySelector(`[square-id="${startId+width*j+j}"]`).firstChild)
                    tempValue2 = (tempValue2 && !document.querySelector(`[square-id="${startId+width*j-j}"]`).firstChild)
                    tempValue3 = (tempValue3 && !document.querySelector(`[square-id="${startId-width*j-j}"]`).firstChild)
                    tempValue4 = (tempValue4 && !document.querySelector(`[square-id="${startId-width*j+j}"]`).firstChild)
                }
                value = value || tempValue1 || tempValue2 || tempValue3 || tempValue4
            }
            return value
            break
        case 'rook':
            value = false
            for (var i = 1; i < 8; i++) {
                var tempValue1 = (startId+i === targetId)
                var tempValue2 = startId-i === targetId
                var tempValue3 = startId+width*i === targetId
                var tempValue4 = startId-width*i === targetId
                for (var j = 1; j < i; j++) {
                    tempValue1 = tempValue1 && !document.querySelector(`[square-id="${startId+j}"]`).firstChild
                    tempValue2 = tempValue2 && !document.querySelector(`[square-id="${startId-j}"]`).firstChild
                    tempValue3 = tempValue3 && !document.querySelector(`[square-id="${startId+width*j}"]`).firstChild
                    tempValue4 = tempValue4 && !document.querySelector(`[square-id="${startId-width*j}"]`).firstChild
                }
                value = value || tempValue1 || tempValue2 || tempValue3 || tempValue4
            }
            return value
            break
        case 'queen':
            value = false
            for (var i = 1; i < 8; i++) {
                var tempValue1 = (startId+i === targetId)
                var tempValue2 = startId-i === targetId
                var tempValue3 = startId+width*i === targetId
                var tempValue4 = startId-width*i === targetId
                var tempValue5 = (startId+width*i+i === targetId)
                var tempValue6 = (startId+width*i-i === targetId)
                var tempValue7 = (startId-width*i-i === targetId)
                var tempValue8 = (startId-width*i+i === targetId)
                for (var j = 1; j < i; j++) {
                    tempValue1 = tempValue1 && !document.querySelector(`[square-id="${startId+j}"]`).firstChild
                    tempValue2 = tempValue2 && !document.querySelector(`[square-id="${startId-j}"]`).firstChild
                    tempValue3 = tempValue3 && !document.querySelector(`[square-id="${startId+width*j}"]`).firstChild
                    tempValue4 = tempValue4 && !document.querySelector(`[square-id="${startId-width*j}"]`).firstChild
                    tempValue5 = tempValue5 && !document.querySelector(`[square-id="${startId+width*j+j}"]`).firstChild
                    tempValue6 = tempValue6 && !document.querySelector(`[square-id="${startId+width*j-j}"]`).firstChild
                    tempValue7 = tempValue7 && !document.querySelector(`[square-id="${startId-width*j-j}"]`).firstChild
                    tempValue8 = tempValue8 && !document.querySelector(`[square-id="${startId-width*j+j}"]`).firstChild
                }
                value = value || tempValue1 || tempValue2 || tempValue3 || tempValue4 || tempValue5 || tempValue6 || tempValue7 || tempValue8
            }
            return value
            break
        case 'king':
            if (
                startId+1 === targetId ||
                startId-1 === targetId || 
                startId+width === targetId || startId-width === targetId || 
                startId+width+1 === targetId ||
                startId+width-1 === targetId ||
                startId-width+1 === targetId ||
                startId-width-1 === targetId
            )
                return true
            break
    }
}

function changePlayer() {
    if (playerGo === "black") {
        reverseIds()
        playerGo = "white"
        playerDisplay.textContent = "white"
    } else {
        revertIds()
        playerGo = "black"
        playerDisplay.textContent = "black"
    }
}

function reverseIds() {
    const allSquares = document.querySelectorAll('.square')
    allSquares.forEach((square, i) => {
        square.setAttribute('square-id', (width*width-1)-i)
    })
}

function revertIds() {
    const allSquares = document.querySelectorAll('.square')
    allSquares.forEach((square, i) => {
        square.setAttribute('square-id', i)
    })
}