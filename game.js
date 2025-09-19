let board = document.getElementById("board");
let keyboard = document.getElementById("keyboard");

const rows = 6;
const cols = 5;
let currentRow = 0;
let currentCol = 0;
let targetWord = "";
let words = [];


fetch("wordle.txt")
    .then(res => res.text())
    .then(text => {
        words = text.split(/\r?\n/).filter(w => w.length === 5);
        targetWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
        console.log(targetWord)
    });


function buildBoard() {
    for (let r = 0; r < rows; r++) {
        let row = document.createElement("div");
        row.className = "row";
        for (let c = 0; c < cols; c++) {
            let tile = document.createElement("div");
            tile.className = "tile empty";
            tile.id = `tile-${r}-${c}`;
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}


const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Del"]
];

function buildKeyboard() {
    keys.forEach(rowKeys => {
        let row = document.createElement("div");
        row.className = "kbd-row";
        rowKeys.forEach(k => {
            let key = document.createElement("button");
            key.className = "key" + (k === "Enter" || k === "Del" ? " wide" : "");
            key.textContent = k;
            key.addEventListener("click", () => handleKey(k));
            row.appendChild(key);
        });
        keyboard.appendChild(row);
    });
}


function handleKey(key) {
    if (key === "Del") {
        if (currentCol > 0) {
            currentCol--;
            setTile(currentRow, currentCol, "");
        }
    } else if (key === "Enter") {
        if (currentCol === cols) {
            checkGuess();
        }
    } else if (/^[A-Z]$/.test(key)) {
        if (currentCol < cols) {
            setTile(currentRow, currentCol, key);
            currentCol++;
        }
    }
}


function setTile(row, col, letter) {
    const tile = document.getElementById(`tile-${row}-${col}`);
    tile.textContent = letter;
    if (letter === "") {
        tile.classList.add("empty");
    } else {
        tile.classList.remove("empty");
    }
}


function checkGuess() {
    let guess = "";
    for (let c = 0; c < cols; c++) {
        guess += document.getElementById(`tile-${currentRow}-${c}`).textContent;
    }

    if (guess.length !== cols || !words.includes(guess.toLowerCase())) {
        shakeRow(currentRow);
        return;
    }

    let targetArr = targetWord.split("");
    let guessArr = guess.split("");

    for (let c = 0; c < cols; c++) {
        let tile = document.getElementById(`tile-${currentRow}-${c}`);
        let keyBtn = [...document.querySelectorAll(".key")].find(b => b.textContent === guessArr[c]);

        if (guessArr[c] === targetArr[c]) {
            tile.classList.add("correct");
            keyBtn.classList.add("correct");
        } else if (targetArr.includes(guessArr[c])) {
            tile.classList.add("present");
            if (!keyBtn.classList.contains("correct")) keyBtn.classList.add("present");
        } else {
            tile.classList.add("absent");
            if (!keyBtn.classList.contains("correct") && !keyBtn.classList.contains("present")) {
                keyBtn.classList.add("absent");
            }
        }
        tile.classList.add("flip");
    }

    if (guess === targetWord) {
        setTimeout(() => alert("🎉 You guessed it!"), 500);
    } else {
        currentRow++;
        currentCol = 0;
        if (currentRow === rows) {
            setTimeout(() => alert(`The word was ${targetWord}`), 500);
        }
    }
}


function shakeRow(row) {
    for (let c = 0; c < cols; c++) {
        let tile = document.getElementById(`tile-${row}-${c}`);
        tile.classList.add("shake");
        setTimeout(() => tile.classList.remove("shake"), 600);
    }
}


window.addEventListener("keydown", e => {
    let key = e.key.toUpperCase();
    if (key === "BACKSPACE") handleKey("Del");
    else if (key === "ENTER") handleKey("Enter");
    else if (/^[A-Z]$/.test(key)) handleKey(key);
});


buildBoard();
buildKeyboard();

function revealHint(type) {
    const vowels = ["A", "E", "I", "O", "U"];
    const letters = targetWord.split("");
    let candidates;


    if (type === "vowel") {
        candidates = letters.filter(l => vowels.includes(l));
    } else {
        candidates = letters.filter(l => !vowels.includes(l));
    }


    if (candidates.length === 0) {
        alert("No " + type + "s in the word!");
        return;
    }


    const randomLetter = candidates[Math.floor(Math.random() * candidates.length)];


    // Highlight the corresponding key on keyboard
    const keyBtn = [...document.querySelectorAll(".key")].find(b => b.textContent === randomLetter);
    if (keyBtn) {
        keyBtn.classList.add("present");
    }


    alert("Hint: The word contains the letter '" + randomLetter + "'");
}


document.getElementById("hint-vowel").addEventListener("click", function () {
    if (!this.classList.contains("used")) {
        revealHint("vowel");
        this.classList.add("used");
    }
});


document.getElementById("hint-consonant").addEventListener("click", function () {
    if (!this.classList.contains("used")) {
        revealHint("consonant");
        this.classList.add("used");
    }
});


// document.getElementById("toggle-theme").addEventListener("click", function () {
//     document.body.classList.toggle("light");
//     document.querySelector('.container').classList.toggle("light");
//     document.querySelector('.board').classList.toggle("light");
//     const icon = this.querySelector("i");
//     if (document.body.classList.contains("light")) {
//         icon.classList.remove("fa-sun");
//         icon.classList.add("fa-moon");
//     } else {
//         icon.classList.remove("fa-moon");
//         icon.classList.add("fa-sun");
//     }
// });