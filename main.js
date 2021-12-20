const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
  }

const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const controller = {
    currentStatus: GAME_STATE.FirstCardAwaits,
    generatedCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    
    dispatchCardAction(card) {
        if (!card.classList.contains('back')){
            return 
        }
        switch (this.currentStatus) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentStatus = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                model.triedTimes ++
                view.renderTriedTimes(model.triedTimes)
                // see if it's matched
                if (model.isRevealedCardsMatched()) {
                    this.currentStatus = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    this.currentStatus = GAME_STATE.FirstCardAwaits
                    model.score += 10
                    view.renderScore(model.score)
                    if (model.score === 260) {
                        console.log("Game finished")
                        this.currentStatus = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    
                } else {
                    this.currentStatus = GAME_STATE.CardsMatchFailed
                    view.wrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
                break
        }
        console.log("current Status:", this.currentStatus)
        console.log("revealed Cards:", model.revealedCards.map(card => {
            card.dataset.index
        }))
    },

    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentStatus = GAME_STATE.FirstCardAwaits
    }
    
}

const model = {
    revealedCards: [],
    score: 0,
    triedTimes: 0,
    isRevealedCardsMatched () {
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    }
  }

const view = {

    getCardContent(index) {

        const number = this.transfromNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]

        return `<p>${number}</p>
            <img src="${symbol}">
            <p>${number}</p>`
    },

    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    }, 
    
    displayCards(indexes) {
        const rootElement = document.querySelector("#cards")
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
        // rootElement.innerHTML = this.getCardElement(11)
    },

    transfromNumber(number) {
        switch (number) {
            case 1:
                return "A"
            case 11:
                return "J"
            case 12:
                return "Q"
            case 13:
                return "K"
            default:
                return number
        }
    },

    flipCards(...cards) {
        // if it's back, then turn it to front.
        cards.map(card => {
            if (card.classList.contains('back')){
                card.classList.remove('back')
                let index = card.dataset.index
                card.innerHTML = this.getCardContent(index)
                return
            }
    
            card.classList.add('back')
            card.innerHTML = null
        })
    },

    pairCards(...cards){
        cards.map(card => {
            card.classList.add("paired")
        })
    },

    renderScore(score) {
        document.querySelector(".score").innerText = `Score: ${score}`
    },

    renderTriedTimes(times) {
        document.querySelector(".tried").innerText = `You've tried: ${times} times`
    },

    wrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add("wrong")
            card.addEventListener("animationend", event => {
                event.target.classList.remove("wrong"), {once: true}
            })
        })
    },

    showGameFinished() {
        const div = document.createElement("div")
        div.classList.add("completed")
        div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>`
        const header = document.querySelector("#header")
        header.before(div)
    }
}

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
          let randomIndex = Math.floor(Math.random() * (index + 1))
          ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}
controller.generatedCards()

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", event => {
        controller.dispatchCardAction(card)
    })
})