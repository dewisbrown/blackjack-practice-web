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

    const printHand = () => {
        let str = "";
        for (let i = 0; i < hand.length; i++) {
            str += hand[i].printCard();
        }
        return str;
    }

    return { hand, getHandValue, hit, clearHand, printHand };
}

// Pair object literal used for map
function Pair(dealer, player) {
    this.dealer = dealer;
    this.player = player;
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
        if (suit == 'C') return '\u2663';
        if (suit == 'D') return '\u2666';
        if (suit == 'H') return '\u2665';
        if (suit == 'S') return '\u2660';
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

const gameController = (() => {
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
    }

    const getAction = (action) => {
        // search map for correct action
        const pair = new Pair(dealer.getHandValue(), user.getHandValue());
        return actionMap.get(pair);
    }

})();

const screenController = (() => {

})();

// Testing stuff
let deck = casinoDeck();
const dealer = player();
const user = player();

dealer.hit(deck.getCard());

user.hit(deck.getCard());
user.hit(deck.getCard());

console.log(`Dealer hand: ${dealer.printHand()}`);
console.log(`Player hand: ${user.printHand()}`);