// game.js - fully fixed and aligned with Flask backend and index.html
(() => {
    const categories = window.GAME_CONFIG.categories;
    const answerCol = window.GAME_CONFIG.answer_col;

    const statusEl = document.getElementById("status");
    const tableEl = document.getElementById("hint-table");
    const guessForm = document.getElementById("guess-form");
    const guessInput = document.getElementById("guess-input");
    const newBtn = document.getElementById("new-btn");

    let targetRow = null;
    let revealedCount = 1;
    let gameOver = false;

    async function loadNewRow() {
        try {
            const res = await fetch("/random");
            const data = await res.json();
            targetRow = data;
            revealedCount = 1;
            gameOver = false;

            renderTable();
            setStatus("Make a guess! First hint is visible.");
            guessInput.disabled = false;
            guessInput.value = "";
            guessInput.focus();
        } catch (err) {
            setStatus("Error loading row: " + err.message);
        }
    }

    function renderTable() {
        tableEl.innerHTML = "";
        categories.forEach((cat, idx) => {
            const tr = document.createElement("tr");

            const tdLabel = document.createElement("td");
            tdLabel.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            tdLabel.className = "hint-label";

            const tdValue = document.createElement("td");
            tdValue.className = "hint-value";
            tdValue.style.textAlign = "center";

            const span = document.createElement("span");
            span.textContent = targetRow[cat];
            span.dataset.idx = idx;

            span.className = idx < revealedCount ? "revealed-value" : "hidden-value";

            tdValue.appendChild(span);
            tr.appendChild(tdLabel);
            tr.appendChild(tdValue);
            tableEl.appendChild(tr);
        });
    }

    function setStatus(text, cls = "") {
        statusEl.textContent = text;
        statusEl.className = "status" + (cls ? " " + cls : "");
    }

    function revealNextCategory() {
        if (revealedCount >= categories.length) return;
        const span = tableEl.querySelector(`span[data-idx='${revealedCount}']`);
        if (span) span.className = "revealed-value";
        revealedCount++;
    }

    function revealAll() {
        const spans = tableEl.querySelectorAll("span");
        spans.forEach(s => s.className = "revealed-value");
        revealedCount = categories.length;
    }

    guessForm.addEventListener("submit", e => {
        e.preventDefault();
        if (gameOver) return;

        const guess = guessInput.value.trim();
        if (!guess) return;

        // Normalize strings for comparison
        const normalizedGuess = guess.toLowerCase();
        const correctAnswer = targetRow[answerCol].toString().trim().toLowerCase();

        if (normalizedGuess === correctAnswer) {
            revealAll();
            setStatus(`Correct! You guessed ${targetRow[answerCol]}!`, "success");
            gameOver = true;
            guessInput.disabled = true;
        } else {
            revealNextCategory();
            if (revealedCount > categories.length) {
                revealAll();
                setStatus(`Game over! The correct answer was ${targetRow[answerCol]}.`, "incorrect");
                gameOver = true;
                guessInput.disabled = true;
            } else {
                setStatus("Incorrect! Guess again.", "incorrect");
            }
        }
        guessInput.value = "";
        guessInput.focus();
    });

    newBtn.addEventListener("click", loadNewRow);

    loadNewRow();
})();
