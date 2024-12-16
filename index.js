class Word {
    constructor(word) {
        this.word = word;
        this.position;
        this.element;
    }

    move() {
        // move downwards 
        this.position[1] = this.position[1] + 50
        this.element.style.top = this.position[1] + "px"
    }
    removeWord() {
        // remove element from game container
        WORD_CONTAINER.removeChild(this.element)
    }
    createElement() {
        // create element
        let element = document.createElement("p");
        element.innerHTML = this.word;

        WORD_CONTAINER.append(element);
        this.element = element;

        console.log("added child");
    }
    spawnWord() {
        // generate initial position. use 690 to give some padding
        this.position = [Math.round(Math.random() * (690 - this.element.clientWidth)), 0];
        this.element.style.left = this.position[0] + "px";
    }
    checkGameOver() {
        // 776 = 800px - 1.5em (font size of p, where 1em = 16px)
        if (this.position[1] > 776) {
            console.log("Game Over");
            gameOver();
        }
    }
}

let words = []
let generatedWords = []
let currentInput = ""
const WORD_CONTAINER = document.getElementById("words-container")
let textfield = document.getElementById("input")

async function getData() {
    const url = "https://random-word-api.herokuapp.com/word?length=6&number=20";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json
    } catch (error) {
        console.error(error.message);
    }
}

function gameOver() {
    // remove intervals
    clearInterval(gameLoop);
    clearInterval(updatePosition);
    alert("Game Over");
}

function updateInput(event) {
    if (event.key == "Enter") {
        // check if can remove the most recent word
        if (textfield.value.toLowerCase() == words[0].word) {
            // remove the most recent word
            let removed = words.shift()
            removed.removeWord()
            textfield.value = ""
        } else {
            textfield.style.color = "red"
        }
    } else {
        textfield.style.color = "black";
    }
}

function generateWords() {
    getData().then((res) => {
        generatedWords = res
        console.log(generatedWords)
    });
}

// game logic

function startGame() {
    generateWords()
    
    const gameLoop = setInterval(() => {
        if (generatedWords.length > 0) {
            let newWord = new Word(generatedWords[0]);
            newWord.createElement();
            newWord.spawnWord();
    
            words.push(newWord);
            generatedWords.shift();
        }
    }, 2000);
    
    const updatePosition = setInterval(() => {
        for (let i = 0; i < words.length; ++i) {
            words[i].move()
            words[i].checkGameOver();
        }
    }, 500);
    
    textfield.addEventListener("keydown", (ev) => updateInput(ev));
}

startGame()