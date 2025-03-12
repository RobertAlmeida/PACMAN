const symbols = [
  "🐯",
  "🦁",
  "🐘",
  "🦒",
  "🦓",
  "🦊",
  "🐺",
  "🐆",
  "🦛",
  "🦏",
  "🌟",
];
let points = 0;
let betAmount = 0;
let isSpinning = false;
let selectedCreditAmount = 5000;

// Elements
const pointsDisplay = document.getElementById("points");
const betDisplay = document.getElementById("bet-amount");
const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const slot3 = document.getElementById("slot3");
const slotMachine = document.getElementById("slot-machine");
const spinButton = document.getElementById("spin-button");
const decreaseBetButton = document.getElementById("decrease-bet");
const increaseBetButton = document.getElementById("increase-bet");
const resultMessage = document.getElementById("result-message");
const addCreditsBtn = document.getElementById("add-credits-btn");
const creditsModal = document.getElementById("credits-modal");
const closeModalBtn = document.getElementById("close-modal");
const confirmCreditsBtn = document.getElementById("confirm-credits");
const creditOptions = document.querySelectorAll(".credit-option");

// Update displays
function updateDisplays() {
  pointsDisplay.textContent = points.toLocaleString();
  betDisplay.textContent = betAmount.toLocaleString();

  // Disable spin if points less than bet
  spinButton.disabled = isSpinning || points < betAmount;

  // Disable bet buttons if spinning or not enough points
  decreaseBetButton.disabled = isSpinning;
  increaseBetButton.disabled = isSpinning;

  // Pulse add-credits button if low on funds
  if (points <= 0) {
    addCreditsBtn.classList.add("pulse");
  } else {
    addCreditsBtn.classList.remove("pulse");
  }
}

// Get random symbol
function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// Spin animation
function spinAnimation(slot, duration, finalSymbol) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let elapsedTime = 0;
    let speed = 50; // Velocidade inicial do giro

    const spinInterval = setInterval(() => {
      slot.textContent = getRandomSymbol();
      elapsedTime = Date.now() - startTime;

      // Diminuir a velocidade conforme o tempo passa (efeito de desaceleração)
      if (elapsedTime > duration * 0.7) speed = 100;
      if (elapsedTime > duration * 0.85) speed = 150;
      if (elapsedTime > duration * 0.95) speed = 250;
    }, speed);

    setTimeout(() => {
      clearInterval(spinInterval);
      slot.textContent = finalSymbol;
      slot.classList.add("slot-stop-effect"); // Efeito de parada suave
      setTimeout(() => slot.classList.remove("slot-stop-effect"), 300);
      resolve();
    }, duration);
  });
}

// Calculate winnings
function calculateWinnings(symbols) {
  const [s1, s2, s3] = symbols;

  // All three same
  if (s1 === s2 && s2 === s3) {
    if (s1 === "🐯") {
      slotMachine.classList.add("jackpot-win");
      setTimeout(() => slotMachine.classList.remove("jackpot-win"), 1000);
      return betAmount * 5; // Tiger
    }
    if (s1 === "🦁") return betAmount * 4; // Lion
    if (s1 === "🐘") return betAmount * 3; // Elephant
    if (s1 === "🦒") return betAmount * 2; // Giraffe
    if (s1 === "🦓") return betAmount * 1.5; // Zebra
    return betAmount * 1; // Any other three matching
  }

  // Two tigers
  if (
    (s1 === "🐯" && s2 === "🐯") ||
    (s1 === "🐯" && s3 === "🐯") ||
    (s2 === "🐯" && s3 === "🐯")
  ) {
    return betAmount * 1.5;
  }

  return 0; // No win
}

// Spin function
async function spin() {
  if (isSpinning || points < betAmount) return;
  if (betAmount == 0) return;

  isSpinning = true;
  points -= betAmount;
  updateDisplays();

  // Clear previous result
  resultMessage.textContent = "";
  resultMessage.classList.remove("win-animation");

  // Add spinning class
  slotMachine.classList.add("spinning");

  // Determine final symbols
  const finalSymbols = [
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ];

  // Animate slots with different durations
  const promises = [
    spinAnimation(slot1, 2000, finalSymbols[0]),
    spinAnimation(slot2, 3000, finalSymbols[1]),
    spinAnimation(slot3, 4000, finalSymbols[2]),
  ];

  await Promise.all(promises);

  // Remove spinning class
  slotMachine.classList.remove("spinning");

  // Calculate winnings
  const winnings = calculateWinnings(finalSymbols);

  if (winnings > 0) {
    points += winnings;
    resultMessage.textContent = `GANHOU ${winnings.toLocaleString()} CRÉDITOS!`;
    resultMessage.classList.add("win-animation");
  }

  // Show add credits modal if low on funds
  if (points < betAmount) {
    setTimeout(() => openCreditsModal(), 1500);
  }

  isSpinning = false;

  // Update display
  updateDisplays();
}

// Credits modal functions
function openCreditsModal() {
  creditsModal.classList.add("active");
}

function closeCreditsModal() {
  creditsModal.classList.remove("active");
}

function selectCreditOption(option) {
  // Remove selected class from all options
  creditOptions.forEach((opt) => opt.classList.remove("selected"));

  // Add selected class to clicked option
  option.classList.add("selected");

  if (option.dataset.amount !== "-") {
    // Update selected amount
    selectedCreditAmount = parseInt(option.dataset.amount);
  }
}

function otherValue() {
  const otherValue = document.getElementById("cred-other");
  selectedCreditAmount = parseInt(otherValue.value);
}

function addCredits() {
  // Add selected amount with bonus
  let bonus = 0;

  if (selectedCreditAmount === 10) bonus = 5;
  else if (selectedCreditAmount === 100) bonus = 15;
  else if (selectedCreditAmount === 150) bonus = 20;

  points += selectedCreditAmount + bonus;
  updateDisplays();

  // Show success message
  resultMessage.textContent = `ADICIONADO ${(
    selectedCreditAmount + bonus
  ).toLocaleString()} CRÉDITOS!`;
  resultMessage.classList.add("win-animation");

  // Close modal
  closeCreditsModal();
}

// Event listeners
spinButton.addEventListener("click", spin);

decreaseBetButton.addEventListener("click", () => {
  if (isSpinning) return;

  if (betAmount == 0) {
    betAmount = 0;
    return;
  }
  betAmount = betAmount - 1;

  updateDisplays();
});

increaseBetButton.addEventListener("click", () => {
  if (isSpinning) return;
  betAmount = betAmount + 1;
  if (betAmount > points) {
    betAmount = points;
  }
  updateDisplays();
});

addCreditsBtn.addEventListener("click", openCreditsModal);
closeModalBtn.addEventListener("click", closeCreditsModal);

// Close modal when clicking outside
creditsModal.addEventListener("click", (e) => {
  if (e.target === creditsModal) {
    closeCreditsModal();
  }
});

// Credit option selection
creditOptions.forEach((option) => {
  option.addEventListener("click", () => selectCreditOption(option));
});

// Confirm credits button
confirmCreditsBtn.addEventListener("click", addCredits);

// Initialize
updateDisplays();
