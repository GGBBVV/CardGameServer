export function CheckCard(gameType, {suit,value}, tableCard) {
    //Checking if the card is valid for lastcard
    switch(gameType) {
        case "Last Card":
            if(suit=== tableCard.suit || value === tableCard.value) return true;
            else return false;
    }
}