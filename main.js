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
                view.flipCard(card)
                model.revealedCards.push(card)
                this.currentStatus = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCard(card)
                model.revealedCards.push(card)
                // see if it's matched
                if (model.isRevealedCardsMatched()) {
                    this.currentStatus = GAME_STATE.CardsMatched
                    view.pairCard(model.revealedCards[0])
                    view.pairCard(model.revealedCards[1])
                } else {
                    setTimeout(() => {
                        view.flipCard(model.revealedCards[0])
                        view.flipCard(model.revealedCards[1])
                        model.revealedCards = []
                        this.currentState = GAME_STATE.CardsMatchFailed
                      }, 1000)
                }
                break
        }
        console.log("current Status:", this.currentStatus)
        console.log("revealed Cards:", model.revealedCards.map(card => {
            card.dataset.index
        }))
    }
    
}

const model = {
    revealedCards: [],
    isRevealedCardsMatched() {
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

    flipCard(card) {
        // if it's back, then turn it to front. 
        if (card.classList.contains('back')){
            card.classList.remove('back')
            let index = card.dataset.index
            card.innerHTML = this.getCardContent(index)
            return
        }

        card.classList.add('back')
        card.innerHTML = null
    },

    pairCard(card){
        card.classList.add("pair")
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