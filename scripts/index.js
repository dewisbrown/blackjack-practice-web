// Player factory function
const player = () => {
    const hand = [];

    const hit = (Card) => {
        hand.push(Card);
    }

    const clearHand = () => {
        hand.length = 0;
    }

    const getHandValue = () => {
        let value = 0;
        const aceIndex = [];
        let hasAce = false;

        for (let i = 0; i < hand.length; i++) {
            if (hand[i].rank == "A") {
                hasAce = true;
                aceIndex.push(i);
            }
            value += hand[i].getValue();
        }

        // change ace value to 1 if hand value > 21 and recount
        while (value > 21 && hasAce) {
            hand[aceIndex.pop()].setValue(1);

            value = 0;
            for (let i = 0; i < hand.length; i++) {
                value += hand[i].value;
            }
        }

        return value;
    }

    const canSplit = () => hand[0].rank === hand[1].rank;

    const printHand = () => {
        let str = "";
        for (let i = 0; i < hand.length; i++) {
            str += hand[i].printCard();
        }
        return str;
    }

    return { hand, getHandValue, hit, clearHand, printHand, canSplit };
}

// Playing card object literal
function Card(suit, rank, value) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    
    const printCard = () => {
        return `[${this.rank} ${suitSymbol()}]`
    }

    const suitSymbol = () => {
        if (suit === 'C') return '\u2663';
        if (suit === 'D') return '\u2666';
        if (suit === 'H') return '\u2665';
        if (suit === 'S') return '\u2660';
    }

    const setValue = (val) => {
        this.value = val;
    }

    const getValue = () => this.value;

    return { printCard, setValue, suit, rank, getValue };
}

// Casino style 6-deck card deck
const casinoDeck = () => {
    const d = [];

    for (let j = 0; j < 6; j++) {
        // all suits from 2 to 10
        for (let i = 2; i < 11; i++) {
            d.push(new Card("H", i.toString(), i));
            d.push(new Card("C", i.toString(), i));
            d.push(new Card("D", i.toString(), i));
            d.push(new Card("S", i.toString(), i));
        }

        // face Cards and aces for all suits
        d.push(new Card("H", "J", 10));
        d.push(new Card("H", "Q", 10));
        d.push(new Card("H", "K", 10));
        d.push(new Card("H", "A", 11));

        d.push(new Card("C", "J", 10));
        d.push(new Card("C", "Q", 10));
        d.push(new Card("C", "K", 10));
        d.push(new Card("C", "A", 11));

        d.push(new Card("S", "J", 10));
        d.push(new Card("S", "Q", 10));
        d.push(new Card("S", "K", 10));
        d.push(new Card("S", "A", 11));

        d.push(new Card("D", "J", 10));
        d.push(new Card("D", "Q", 10));
        d.push(new Card("D", "K", 10));
        d.push(new Card("D", "A", 11));
    }

    const getCard = () => {
        randomIndex = Math.floor(Math.random() * d.length);
        const randomCard = d[randomIndex];
        d.splice(randomIndex, 1);
        return randomCard;
    }

    const getNumCards = () => d.length;

    return { getCard, getNumCards };
}

const blackjack = (() => {
    let deck = casinoDeck();
    const dealer = player();
    const user = player();

    const dealCards = () => {
        if (deck.getNumCards() < 52) {
            deck = casinoDeck();
        }
        // Clear hands
        dealer.clearHand();
        user.clearHand();

        // Deal cards from deck
        dealer.hit(deck.getCard());
        user.hit(deck.getCard());
        user.hit(deck.getCard());

        screenController.displayCards(dealer.hand, user.hand);
    }

    const checkAction = (action) => {
        // search map for correct action
        if (user.canSplit()) {
            const splitAction = splitMap.get(JSON.stringify([user.hand[0].getValue(), dealer.getHandValue()]));
            if (splitAction) {
                if (action === "SPLIT") {
                    screenController.correct();
                } else {
                    screenController.wrong("SPLIT");
                    return;
                }
            }
        }

        const pair = JSON.stringify([user.getHandValue(), dealer.getHandValue()]);
        const correctAction = actionMap.get(pair);
        
        if (actionMap.get(pair) === action) {
            screenController.correct();
        } else {
            screenController.wrong(correctAction);
        }
    }

    return { dealCards, checkAction };
})();

const screenController = (() => {
    const dealerDiv = document.getElementById("dealer");
    const userDiv = document.getElementById("user");
    const successDiv = document.getElementById("success");
    
    const displayCards = (dealerHand, userHand) => {
        dealerDiv.children[0].data = svgPathMap.get(JSON.stringify([dealerHand[0].rank, dealerHand[0].suit]));
        userDiv.children[0].data = svgPathMap.get(JSON.stringify([userHand[0].rank, userHand[0].suit]));
        userDiv.children[1].data = svgPathMap.get(JSON.stringify([userHand[1].rank, userHand[1].suit]));
    }

    const correct = () => {
        successDiv.style.backgroundColor = '#20b300';
        successDiv.style.color = 'white';
        successDiv.innerHTML = "Correct!";
    }

    const wrong = (correctAction) => {
        successDiv.style.background = 'red';
        successDiv.style.color = 'white';
        successDiv.innerHTML = correctAction;
    }

    return { displayCards, correct, wrong };
})();

// Map setups
function initActionMap() {
    for (let i = 18; i < 22; i++) {
        for (let j = 4; j < 22; j++) {
            actionMap.set(JSON.stringify([i, j]), "STAY");
        }
    }

    for (let i = 4; i < 8; i++) {
        for (let j = 2; j < 12; j++) {
            actionMap.set(JSON.stringify([i, j]), "HIT");
        }
    }

    for (let i = 4; i < 22; i++) {
        for (let j = 2; j < 8; j++) {
            actionMap.set(JSON.stringify([i, j]), "HIT");
        }
    }

    for (let i = 2; i < 12; i++) {
        actionMap.set(JSON.stringify([8, i]), "HIT");
        actionMap.set(JSON.stringify([11, i]), "DOUBLE");
        for (let j = 17; j < 22; j++) {
            actionMap.set(JSON.stringify([j, i]), "STAY");
        }
    }

    for (let i = 13; i < 17; i++) {
        for (let j = 2; j < 7; j++) {
            actionMap.set(JSON.stringify([i, j]), "STAY");
        }
    }

    for (let i = 12; i < 17; i++) {
        for (let j = 7; j < 12; j++) {
            actionMap.set(JSON.stringify([i, j]), "HIT");
        }
    }

    // mapping actions for 9
    actionMap.set(JSON.stringify([9, 2]), "HIT");

    for (let i = 3; i < 7; i++) {
        actionMap.set(JSON.stringify([9, i]), "STAY");
    }

    for (let i = 7; i < 12; i++) {
        actionMap.set(JSON.stringify([9, i]), "HIT");
    }

    // mapping actions for 10
    for (let i = 2; i < 10; i++) {
        actionMap.set(JSON.stringify([10, i]), "DOUBLE");
    }

    actionMap.set(JSON.stringify([10, 10]), "HIT");
    actionMap.set(JSON.stringify([10, 11]), "HIT");

    // mapping actions for 12
    actionMap.set(JSON.stringify([12, 2]), "HIT");
    actionMap.set(JSON.stringify([12, 3]), "HIT");

    for (let i = 4; i < 7; i++) {
        actionMap.set(JSON.stringify([12, i]), "STAY");
    }
}

function initSplitMap() {
    for (let i = 2; i < 12; i++) {
        splitMap.set(JSON.stringify([11, i]), "SPLIT");
        splitMap.set(JSON.stringify([8, i]), "SPLIT");
    }

    for (let i = 2; i < 7; i++) {
        splitMap.set(JSON.stringify([9, i]), "SPLIT");
        splitMap.set(JSON.stringify([7, i]), "SPLIT");
        splitMap.set(JSON.stringify([6, i]), "SPLIT");  // split if double after split allowed (DAS): player: 6-6, dealer: 2
    }

    for (let i = 4; i < 8; i++) {
        splitMap.set(JSON.stringify([2, i]), "SPLIT");
        splitMap.set(JSON.stringify([3, i]), "SPLIT");
    }

    splitMap.set(JSON.stringify([7, 7]), "SPLIT");
    splitMap.set(JSON.stringify([9, 8]), "SPLIT");
    splitMap.set(JSON.stringify([9, 9]), "SPLIT");
}

function initSvgPathMap() {
    svgPathMap.set(JSON.stringify(['A', 'C']), "images/ace_of_clubs.svg");
    svgPathMap.set(JSON.stringify(['J', 'C']), "images/jack_of_clubs.svg");
    svgPathMap.set(JSON.stringify(['Q', 'C']), "images/queen_of_clubs.svg");
    svgPathMap.set(JSON.stringify(['K', 'C']), "images/king_of_clubs.svg");

    svgPathMap.set(JSON.stringify(['A', 'D']), "images/ace_of_diamonds.svg");
    svgPathMap.set(JSON.stringify(['J', 'D']), "images/jack_of_diamonds.svg");
    svgPathMap.set(JSON.stringify(['Q', 'D']), "images/queen_of_diamonds.svg");
    svgPathMap.set(JSON.stringify(['K', 'D']), "images/king_of_diamonds.svg");

    svgPathMap.set(JSON.stringify(['A', 'H']), "images/ace_of_hearts.svg");
    svgPathMap.set(JSON.stringify(['J', 'H']), "images/jack_of_hearts.svg");
    svgPathMap.set(JSON.stringify(['Q', 'H']), "images/queen_of_hearts.svg");
    svgPathMap.set(JSON.stringify(['K', 'H']), "images/king_of_hearts.svg");

    svgPathMap.set(JSON.stringify(['A', 'S']), "images/ace_of_spades.svg");
    svgPathMap.set(JSON.stringify(['J', 'S']), "images/jack_of_spades.svg");
    svgPathMap.set(JSON.stringify(['Q', 'S']), "images/queen_of_spades.svg");
    svgPathMap.set(JSON.stringify(['K', 'S']), "images/king_of_spades.svg");

    for (let i = 2; i < 11; i++) {
        svgPathMap.set(JSON.stringify([i.toString(), 'C']), `images/${i.toString()}_of_clubs.svg`);
        svgPathMap.set(JSON.stringify([i.toString(), 'D']), `images/${i.toString()}_of_diamonds.svg`);
        svgPathMap.set(JSON.stringify([i.toString(), 'H']), `images/${i.toString()}_of_hearts.svg`);
        svgPathMap.set(JSON.stringify([i.toString(), 'S']), `images/${i.toString()}_of_spades.svg`);
    }
}

// Program setup and start
const actionMap = new Map();
const splitMap = new Map();
const svgPathMap = new Map();

initActionMap();
initSplitMap();
initSvgPathMap();

blackjack.dealCards();

// Add event listeners to buttons
document.getElementById("hit").addEventListener('click', () => {
    blackjack.checkAction("HIT");
    blackjack.dealCards();
});
document.getElementById("stay").addEventListener('click', () => {
    blackjack.checkAction("STAY");
    blackjack.dealCards();
});
document.getElementById("double").addEventListener('click', () => {
    blackjack.checkAction("DOUBLE");
    blackjack.dealCards();
});
document.getElementById("split").addEventListener('click', () => {
    blackjack.checkAction("SPLIT");
    blackjack.dealCards();
});
