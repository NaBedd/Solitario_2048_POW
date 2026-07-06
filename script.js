(() => {
  const NUM_COLS = 4;
  const MAX_PER_COL = 8; // si una columna llega a 8, se pierde la partida
  const INITIAL_VALUES = [2, 4, 8, 16, 32];
  const WIN_VALUE = 2048;

  const state = {
    columns: [[], [], [], []],
    current: null,
    next: null, 
    score: 0,
    gameOver: false,
    hasWonOnce: false,
  };

  const boardEl = document.getElementById("board");
  const currentCardEl = document.getElementById("current-card");
  const scoreEl = document.getElementById("score");
  const restartBtn = document.getElementById("restart");
  const messageEl = document.getElementById("message");
  const nextCardEl = document.getElementById("next-card");

  function randomCardValue() {
    return INITIAL_VALUES[Math.floor(Math.random() * INITIAL_VALUES.length)];
  }

  function valueClass(value) {
    return `v-${value}`;
  }

function renderCurrent() {
    // Dibuja la carta actual
    currentCardEl.className = "card " + valueClass(state.current);
    currentCardEl.textContent = state.current;
    
    // Dibuja la próxima carta (NUEVO)
    if (nextCardEl) {
      nextCardEl.className = "card " + valueClass(state.next);
      nextCardEl.textContent = state.next;
    }
  }

  function renderBoard(highlight) {
    const cols = boardEl.querySelectorAll(".column");
    cols.forEach((col, i) => {
      const inner = col.querySelector(".col-inner");
      inner.innerHTML = "";
      state.columns[i].forEach((v, idx) => {
        const c = document.createElement("div");
        c.className = "card " + valueClass(v);
        c.textContent = v;
        // La última carta (top del stack) es el slot resultante
        if (
          highlight &&
          highlight.col === i &&
          idx === state.columns[i].length - 1
        ) {
          c.classList.add("merge");
        }
        inner.appendChild(c);
      });
      col.classList.toggle("warn", state.columns[i].length >= MAX_PER_COL - 1);

      if (highlight && highlight.col === i) {
        col.classList.remove("shake");
        // reflow para reiniciar la animación
        void col.offsetWidth;
        col.classList.add("shake");
        setTimeout(() => col.classList.remove("shake"), 400);
      }
    });
    scoreEl.textContent = state.score;
  }

  function processColumn(colIndex) {
    const col = state.columns[colIndex];
    let won = false;
    let mergeCount = 0;
    let merged = true;
    while (merged && col.length >= 2) {
      const top = col[col.length - 1];
      const below = col[col.length - 2];
      if (top === below) {
        const newVal = top * 2;
        col.pop();
        col.pop();
        col.push(newVal);
        state.score += newVal;
        mergeCount++;
        if (newVal === WIN_VALUE) {
          state.columns[colIndex] = [];
          state.score += 500;
          won = true;
          break;
        }
      } else {
        merged = false;
      }
    }
    return { won, mergeCount };
  }

  function dropInColumn(colIndex) {
    if (state.gameOver) return;
    const col = state.columns[colIndex];
    if (col.length >= MAX_PER_COL) return;

    col.push(state.current);
    const { won, mergeCount } = processColumn(colIndex);

    renderBoard(mergeCount > 0 ? { col: colIndex } : null);

    if (won && !state.hasWonOnce) {
      state.hasWonOnce = true;
      showWinMessage(state.score);
      return;
    }

    if (checkDefeat()) {
      state.gameOver = true;
      showMessage("¡Has perdido!", state.score);
      return;
    }

    state.current = state.next;
    state.next = randomCardValue();    renderCurrent();
  }

  function checkDefeat() {
    for (let i = 0; i < NUM_COLS; i++) {
      if (state.columns[i].length >= MAX_PER_COL) return true;
    }
    return false;
  }

  function showMessage(title, score) {
    messageEl.innerHTML = `
      <div>${title}</div>
      <div class="msg-score">Puntuación final: ${score}</div>
      <button class="btn" id="msg-restart">Jugar de nuevo</button>
    `;
    messageEl.classList.remove("hidden");
    document.getElementById("msg-restart").addEventListener("click", reset);
  }

  function showWinMessage(score) {
    messageEl.innerHTML = `
      <div>🎉 ¡Ganaste! 🎉</div>
      <div class="msg-score">Alcanzaste 2048 · Puntuación: ${score}</div>
      <div class="msg-question">¿Quieres seguir jugando?</div>
      <div class="msg-actions">
        <button class="btn" id="msg-continue">Seguir jugando</button>
        <button class="btn btn-secondary" id="msg-restart">Reiniciar partida</button>
      </div>
    `;
    messageEl.classList.remove("hidden");
    document.getElementById("msg-continue").addEventListener("click", () => {
      messageEl.classList.add("hidden");
      state.current = state.next;
      state.next = randomCardValue();
      renderCurrent();
    });
    document.getElementById("msg-restart").addEventListener("click", reset);
  }

function reset() {
    state.columns = [[], [], [], []];
    state.score = 0;
    state.gameOver = false;
    state.hasWonOnce = false;
    
    // Genera ambas cartas
    state.current = randomCardValue();
    state.next = randomCardValue(); 
    
    messageEl.classList.add("hidden");
    renderCurrent();
    renderBoard();
  }

  boardEl.querySelectorAll(".column").forEach((col) => {
    col.addEventListener("click", () => {
      const idx = parseInt(col.dataset.col, 10);
      dropInColumn(idx);
    });
  });

  restartBtn.addEventListener("click", reset);

  reset();
})();
