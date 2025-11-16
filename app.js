// ===== Navigation between sections =====

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    navItems.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.section;
    sections.forEach((sec) => sec.classList.remove("active"));
    const activeSection = document.getElementById("section-" + target);
    if (activeSection) {
      activeSection.classList.add("active");
    }
  });
});

// ===== Movies data =====

const movies = [
  {
    id: "movie1",
    title: "Action Demo",
    file: "media/movie1.mp4",
    tag: "Action",
  },
  {
    id: "movie2",
    title: "Comedy Demo",
    file: "media/movie2.mp4",
    tag: "Comedy",
  },
  {
    id: "cartoon",
    title: "Cartoon Demo",
    file: "media/cartoon.mp4",
    tag: "Kids",
  },
];

// ===== Games data =====

const games = [
  {
    id: "uno",
    title: "Uno Table (4 players)",
  },
];

// ===== Movies logic =====

const movieListEl = document.getElementById("movie-list");
const videoPlayerEl = document.getElementById("video-player");
const nowPlayingEl = document.getElementById("now-playing");

movies.forEach((movie) => {
  const li = document.createElement("li");
  li.className = "list-item";
  li.dataset.id = movie.id;

  const label = document.createElement("span");
  label.className = "list-item-label";
  label.textContent = movie.title;

  const tag = document.createElement("span");
  tag.className = "badge";
  tag.textContent = movie.tag;

  li.appendChild(label);
  li.appendChild(tag);

  li.addEventListener("click", () => {
    playMovie(movie);
    setActiveListItem(movieListEl, li);
  });

  movieListEl.appendChild(li);
});

function playMovie(movie) {
  videoPlayerEl.src = movie.file;
  videoPlayerEl.play();
  nowPlayingEl.textContent = "Now playing: " + movie.title;
}

function setActiveListItem(container, activeLi) {
  container.querySelectorAll(".list-item").forEach((li) => {
    li.classList.remove("active");
  });
  activeLi.classList.add("active");
}

// ===== Games list logic =====

const gameListEl = document.getElementById("game-list");
const gamePlaceholderEl = document.getElementById("game-placeholder");
const unoGameEl = document.getElementById("uno-game");

games.forEach((game) => {
  const li = document.createElement("li");
  li.className = "list-item";
  li.dataset.id = game.id;

  const label = document.createElement("span");
  label.className = "list-item-label";
  label.textContent = game.title;

  li.appendChild(label);

  li.addEventListener("click", () => {
    setActiveListItem(gameListEl, li);
    openGame(game.id);
  });

  gameListEl.appendChild(li);
});

function openGame(gameId) {
  gamePlaceholderEl.classList.remove("hidden");
  unoGameEl.classList.add("hidden");

  if (gameId === "uno") {
    gamePlaceholderEl.classList.add("hidden");
    unoGameEl.classList.remove("hidden");
  }
}

// ===== Uno 4-player game logic =====

// Players:
// index 0: human (You)
// index 1: AI North
// index 2: AI West
// index 3: AI East

const UNO_COLORS = ["red", "green", "blue", "yellow"];
const UNO_NUMBERS = Array.from({ length: 10 }, (_, i) => i); // 0-9

let unoPlayers = [];
let unoDeck = [];
let unoTopCard = null;
let unoCurrentPlayer = 0;
let unoGameOver = false;

// DOM elements
const unoTopCardEl = document.getElementById("uno-top-card");
const unoDeckCountEl = document.getElementById("uno-deck-count");
const unoTurnLabelEl = document.getElementById("uno-turn-label");
const unoInfoLabelEl = document.getElementById("uno-info-label");
const unoMessageEl = document.getElementById("uno-message");

const unoDrawBtn = document.getElementById("uno-draw-btn");
const unoResetBtn = document.getElementById("uno-reset-btn");

const playerAreas = {
  0: document.getElementById("uno-player-0-cards"),
  1: document.getElementById("uno-player-1-cards"),
  2: document.getElementById("uno-player-2-cards"),
  3: document.getElementById("uno-player-3-cards"),
};

// Create & shuffle deck
function createUnoDeck() {
  const deck = [];
  UNO_COLORS.forEach((color) => {
    UNO_NUMBERS.forEach((number) => {
      // Two copies of each number per color (simple)
      deck.push({ color, number });
      deck.push({ color, number });
    });
  });
  return shuffle(deck);
}

function shuffle(arr) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function drawUnoCard() {
  if (unoDeck.length === 0) {
    return null;
  }
  return unoDeck.pop();
}

// Init / reset game
function initUnoGame() {
  unoGameOver = false;
  unoDeck = createUnoDeck();

  unoPlayers = [
    { name: "You", isHuman: true, hand: [] },
    { name: "AI North", isHuman: false, hand: [] },
    { name: "AI West", isHuman: false, hand: [] },
    { name: "AI East", isHuman: false, hand: [] },
  ];

  // Draw initial top card
  unoTopCard = drawUnoCard();

  // Draw 7 cards for each player
  for (let i = 0; i < 7; i++) {
    unoPlayers.forEach((player) => {
      const card = drawUnoCard();
      if (card) {
        player.hand.push(card);
      }
    });
  }

  unoCurrentPlayer = 0;
  unoInfoLabelEl.textContent = "Match color or number to play.";
  unoMessageEl.textContent = "";
  updateUnoUI();
  updateTurnLabel();

  // If starting card is weird (null), just end
  if (!unoTopCard) {
    unoGameOver = true;
    unoInfoLabelEl.textContent = "Deck error: no cards.";
  }
}

// UI Updates
function updateUnoUI() {
  // Top card
  renderUnoTopCard();
  // Deck count
  unoDeckCountEl.textContent = "Deck: " + unoDeck.length;
  // Players
  renderUnoPlayers();
}

function renderUnoTopCard() {
  if (!unoTopCard) {
    unoTopCardEl.textContent = "";
    unoTopCardEl.className = "uno-card slot";
    return;
  }
  setUnoCardElement(unoTopCardEl, unoTopCard, false);
}

function renderUnoPlayers() {
  Object.values(playerAreas).forEach((el) => {
    el.innerHTML = "";
  });

  unoPlayers.forEach((player, index) => {
    const area = playerAreas[index];
    if (!area) return;

    if (player.isHuman) {
      // Show real cards, clickable
      player.hand.forEach((card, cardIndex) => {
        const cardEl = document.createElement("div");
        setUnoCardElement(cardEl, card, true);
        cardEl.addEventListener("click", () => {
          handleHumanPlay(index, cardIndex);
        });
        area.appendChild(cardEl);
      });
    } else {
      // Show backs only
      player.hand.forEach(() => {
        const back = document.createElement("div");
        back.className = "uno-card card-back";
        area.appendChild(back);
      });
    }
  });
}

function setUnoCardElement(el, card, clickable) {
  el.className = "uno-card";
  el.classList.add("card-" + card.color);
  if (clickable) {
    el.classList.add("clickable");
  }
  el.textContent = card.number;
}

function updateTurnLabel() {
  const player = unoPlayers[unoCurrentPlayer];
  if (!player) return;
  unoTurnLabelEl.textContent = player.isHuman
    ? "Your turn"
    : player.name + " is playing";
}

// Card rules
function canPlayOn(card, topCard) {
  if (!topCard) return true;
  return card.color === topCard.color || card.number === topCard.number;
}

// Turn flow
function nextPlayerIndex(index) {
  return (index + 1) % unoPlayers.length;
}

function handleHumanPlay(playerIndex, cardIndex) {
  if (unoGameOver) return;
  if (unoCurrentPlayer !== playerIndex) {
    unoMessageEl.textContent = "It is not your turn.";
    return;
  }

  const player = unoPlayers[playerIndex];
  const card = player.hand[cardIndex];

  if (!canPlayOn(card, unoTopCard)) {
    unoMessageEl.textContent =
      "You must match the color or the number of the top card.";
    return;
  }

  // Play card
  unoTopCard = card;
  player.hand.splice(cardIndex, 1);
  unoMessageEl.textContent = "Nice move!";

  checkWinOrContinue();
}

function handleHumanDraw() {
  if (unoGameOver) return;
  if (!unoPlayers[0].isHuman) return;
  if (unoCurrentPlayer !== 0) {
    unoMessageEl.textContent = "You can only draw on your turn.";
    return;
  }

  const card = drawUnoCard();
  if (!card) {
    unoMessageEl.textContent = "Deck is empty, you cannot draw.";
    updateUnoUI();
    return;
  }

  unoPlayers[0].hand.push(card);
  unoMessageEl.textContent = "You drew a card.";
  updateUnoUI();
}

function checkWinOrContinue() {
  updateUnoUI();

  const currentPlayer = unoPlayers[unoCurrentPlayer];
  if (currentPlayer.hand.length === 0) {
    unoGameOver = true;
    if (currentPlayer.isHuman) {
      unoInfoLabelEl.textContent = "You win! 🎉";
      unoMessageEl.textContent = "Congratulations, you used all your cards.";
    } else {
      unoInfoLabelEl.textContent = currentPlayer.name + " wins!";
      unoMessageEl.textContent = "Better luck next time.";
    }
    return;
  }

  // Next player's turn
  unoCurrentPlayer = nextPlayerIndex(unoCurrentPlayer);
  updateTurnLabel();

  // If AI, let it play automatically
  const nextPlayer = unoPlayers[unoCurrentPlayer];
  if (!nextPlayer.isHuman) {
    setTimeout(aiTakeTurn, 600);
  }
}

// AI logic
function aiTakeTurn() {
  if (unoGameOver) return;

  const player = unoPlayers[unoCurrentPlayer];
  if (!player || player.isHuman) return;

  // Find playable card
  let playableIndex = -1;
  for (let i = 0; i < player.hand.length; i++) {
    if (canPlayOn(player.hand[i], unoTopCard)) {
      playableIndex = i;
      break;
    }
  }

  if (playableIndex === -1) {
    // Draw one card
    const drawn = drawUnoCard();
    if (drawn) {
      player.hand.push(drawn);
      unoMessageEl.textContent = player.name + " drew a card.";
    } else {
      unoMessageEl.textContent =
        player.name + " cannot draw (deck empty) and skips.";
    }
    updateUnoUI();
  } else {
    // Play card
    const card = player.hand[playableIndex];
    unoTopCard = card;
    player.hand.splice(playableIndex, 1);
    unoMessageEl.textContent =
      player.name +
      " played " +
      card.color.toUpperCase() +
      " " +
      card.number +
      ".";
  }

  checkWinOrContinue();
}

// Buttons
unoDrawBtn.addEventListener("click", () => {
  handleHumanDraw();
});

unoResetBtn.addEventListener("click", () => {
  initUnoGame();
});

// Start Uno game so it is ready when user switches
initUnoGame();
