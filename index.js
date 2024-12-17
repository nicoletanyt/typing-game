class Word {
    constructor(word, speed) {
        this.word = word;
        this.position;
        this.element;
        this.speed = speed;
    }

    move() {
        // move downwards 
        this.position[1] = this.position[1] + this.speed
        this.element.style.top = this.position[1] + "px"
    }
    removeWord() {
        // remove element from game container
        wordContainer.removeChild(this.element);
    }
    createElement() {
        // create element
        let element = document.createElement("p");
        element.innerHTML = this.word;

        wordContainer.append(element);
        this.element = element;

        console.log("Added Word");
    }
    spawnWord() {
        // generate initial position. use 690 to give some padding
        this.position = [Math.round(Math.random() * (647 - this.element.clientWidth)), -10];
        this.element.style.left = this.position[0] + "px";
    }
    checkGameOver() {
        // 776 = 800px - 1.5em (font size of p, where 1em = 16px)
        if (this.position[1] > 590) {
            console.log("Game Over");
            gameOver();
        }
    }
}

let words = []
let generatedWords = []
let time = 0
let score = 0
let topScores = []
let gameRunning = false
let fallInterval = 2000
let level = 1

// HTML Elements
const wordContainer = document.getElementById("words-container")
const questionBtn = document.getElementById("question-button");
const playAgainBtn = document.getElementById("play-again-button");
let textfield = document.getElementById("input")
const scoresContainer = document.getElementById("scores");
const scoreLabel = document.getElementById("score-display");

// Screens
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const gameContainer = document.getElementById("game-container");
const instructionScreen = document.getElementById("instructions-screen");

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
    gameRunning = false

    toggleGameOver();
    addScore(score, time);
}

function updateInput(event) {
    if (event.key == "Enter") {
        // check if can remove the most recent word
        if (words.length == 0) {
            if (textfield.value.toLowerCase() == "/start") {
                // start the game
                console.log("Start Game")
                if (instructionScreen.classList.contains("show")) toggleInstructions()
                startGame()
                textfield.value = "";
            } else {
                textfield.style.color = "red";
            }
        } else {
            if (textfield.value.toLowerCase() == words[0].word) {
                // remove the most recent word
                let removed = words.shift();
                removed.removeWord();
                textfield.value = "";
                score += 1
            } else {
                textfield.style.color = "red";
            }
        }
    } else {
        textfield.style.color = "black";
    }
}

function generateWords() {
    getData().then((res) => {
        generatedWords = res
    });
}

// game logic

const gameLoop = setInterval(() => {
	if (gameRunning) {
		if (generatedWords.length > 0) {
			let newWord = new Word(generatedWords[0], (level * 20) + 40);
			newWord.createElement();
			newWord.spawnWord();

			words.push(newWord);
			generatedWords.shift();
            
            if (fallInterval >= 1000) {
                fallInterval -= (100 * level)
            }

            // adjust levels 
            if (score % 5 == 0) {
                level += 1
            }
            
            // generate new words
            if (generatedWords.length == 2) {
                generateWords()
            }
		}
	}
}, fallInterval);

const timer = setInterval(() => {
    // count time spent typing (exclude waiting for word to fall)
    if (gameRunning && textfield.value != "") {
        time += 1
    }
}, 1000)

const updatePosition = setInterval(() => {
    if (gameRunning) {
        for (let i = 0; i < words.length; ++i) {
            words[i].move();
            words[i].checkGameOver();
        }
    }
}, 500);

function toggleInstructions() {
    if (instructionScreen.classList.contains("show")) {
        instructionScreen.classList.add("hidden")
        instructionScreen.classList.remove("show");

        gameContainer.classList.remove("hidden")
        gameContainer.classList.add("show");
    } else {
        instructionScreen.classList.add("show");
        instructionScreen.classList.remove("hidden");
        
        gameContainer.classList.remove("show");
        gameContainer.classList.add("hidden");
    }
}

function toggleGameOver() {
	if (gameScreen.classList.contains("show")) {
		gameScreen.classList.add("hidden");
		gameScreen.classList.remove("show");

		gameOverScreen.classList.add("show");
		gameOverScreen.classList.remove("hidden");
	} else {
		gameScreen.classList.add("show");
		gameScreen.classList.remove("hidden");

		gameOverScreen.classList.add("hidden");
		gameOverScreen.classList.remove("show");

		// close instructions screen
		if (instructionScreen.classList.contains("show")) toggleInstructions();
	}
}

function addScore(score, time) {

    let wpm = Math.round(score / (time / 60));

    if (score == 0 && time == 0) {
        wpm = 0
    } 
    // display score
    scoreLabel.innerText =
            "Words Typed: " +
            score +
            "\n" +
            "Typing Speed: " +
            wpm +
            " WPM (words per minute)";

    // get topScores from local storage
    if (localStorage.getItem("topScores") != null) {
        topScores = JSON.parse(localStorage.getItem("topScores"));
    }

    topScores.push([score, wpm]);
    console.log("Added new score")

    topScores
			.sort(function (a, b) {
				return a[0] - b[0];
			})
			.reverse();

    if (topScores.length > 3) {
        // remove fourth element
        topScores.pop()
    }

    // update local storage
    localStorage.setItem("topScores", JSON.stringify(topScores))

    let n = topScores.length - scoresContainer.children.length;

    for (let i = 0; i < n; ++i) {
        // add new entries
        const wrapper = document.createElement("li");
        const scoreItem = document.createElement("div");
        scoreItem.classList.add("score-item");

        const wordsLabel = document.createElement("p");
        wordsLabel.classList.add("align-left");
        scoreItem.appendChild(wordsLabel);

        const divider = document.createElement("p");
        divider.innerText = "//";
        scoreItem.appendChild(divider);

        const wpmLabel = document.createElement("p");
        wpmLabel.classList.add("align-right")
        scoreItem.appendChild(wpmLabel)

        wrapper.appendChild(scoreItem);
        scoresContainer.appendChild(wrapper)
    }
    
    // update scoreboard
    for (let i = 0; i < topScores.length; ++i) {
        let scoreLabel = scoresContainer.children[i].children[0].children[0]
        let wpmLabel = scoresContainer.children[i].children[0].children[2];
        scoreLabel.textContent = topScores[i][0] + " Words"
        wpmLabel.textContent = Math.round(topScores[i][1]) + " WPM";
    }
}

function playAgain() {
	// remove children
	for (let i = 0; i < words.length; i++) {
		words[i].removeWord();
	}

	words = [];
	generatedWords = [];
	
    time = 0;
    score = 0;
    textfield.value = "";
    fallInterval = 2000;
    level = 1;
    
    toggleGameOver()
}

function startGame() {
    gameRunning = true;

    generateWords()
}

textfield.addEventListener("keydown", (ev) => updateInput(ev));
questionBtn.addEventListener("click", () => toggleInstructions())
playAgainBtn.addEventListener("click", () => playAgain());